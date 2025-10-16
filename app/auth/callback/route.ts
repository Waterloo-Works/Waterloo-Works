import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createUserRecord } from "@/app/actions/auth";
import { PUBLIC_APP_URL } from "@/lib/config";
import { prisma } from "@/utils/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);

    try {
        const code = requestUrl.searchParams.get("code");
        const next = requestUrl.searchParams.get("next");
        const supabase = await createClient();

        if (!code) {
            return NextResponse.redirect(
                `${PUBLIC_APP_URL}/auth/auth-code-error?error=no_code`
            );
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error("Auth error:", error.message);
            return NextResponse.redirect(
                `${PUBLIC_APP_URL}/auth/auth-code-error?error=${encodeURIComponent(
                    error.message
                )}`
            );
        }

        // Get the user data
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user) {
            await createUserRecord({
                userId: user.id,
                email: user.email || "",
                fullName: user.user_metadata?.full_name || user.user_metadata?.name,
                source: user.user_metadata?.source,
            });

            // Create user profile if it doesn't exist - CRITICAL for site stability
            try {
                await prisma.userProfile.upsert({
                    where: { userId: user.id },
                    update: {}, // No updates needed if exists
                    create: {
                        userId: user.id,
                    }
                });
            } catch (error) {
                console.error("CRITICAL: Failed to create user profile:", error);
                // Profile creation is essential - if this fails, redirect to error page
                return NextResponse.redirect(
                    `${PUBLIC_APP_URL}/auth/auth-code-error?error=${encodeURIComponent(
                        "profile_creation_failed"
                    )}`
                );
            }

            // If first time (no source captured), send to login to collect it before proceeding
            try {
                const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { source: true } });
                if (!dbUser?.source) {
                    // Preserve the next parameter when collecting source
                    const redirectUrl = next
                        ? `${PUBLIC_APP_URL}/login?collectSource=1&next=${encodeURIComponent(next)}`
                        : `${PUBLIC_APP_URL}/login?collectSource=1&next=/explore`;
                    return NextResponse.redirect(redirectUrl);
                }
            } catch {}
        }

        // Redirect to the next URL if provided, otherwise explore after successful auth
        const finalRedirect = next ? `${PUBLIC_APP_URL}${next}` : `${PUBLIC_APP_URL}/explore`;
        return NextResponse.redirect(finalRedirect);
    } catch (error) {
        console.error("Callback error:", error);
        return NextResponse.redirect(
            `${PUBLIC_APP_URL}/auth/auth-code-error?error=unknown`
        );
    }
}
