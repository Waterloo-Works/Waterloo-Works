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

            // If first time (no source captured), send to login to collect it before proceeding
            try {
                const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { source: true } });
                if (!dbUser?.source) {
                    return NextResponse.redirect(`${PUBLIC_APP_URL}/login?collectSource=1&next=/explore`);
                }
            } catch {}
        }

        // Redirect to explore after successful auth (existing user)
        return NextResponse.redirect(`${PUBLIC_APP_URL}/explore`);
    } catch (error) {
        console.error("Callback error:", error);
        return NextResponse.redirect(
            `${PUBLIC_APP_URL}/auth/auth-code-error?error=unknown`
        );
    }
}
