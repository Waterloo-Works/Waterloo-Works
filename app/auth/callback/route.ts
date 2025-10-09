import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createUserRecord } from "@/app/actions/auth";
import type { EmailOtpType } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);

    try {
        const code = requestUrl.searchParams.get("code");
        const tokenHash = requestUrl.searchParams.get("token_hash");
        const supabase = await createClient();

        let error: { message: string } | null = null;

        if (code) {
            const { error: exError } = await supabase.auth.exchangeCodeForSession(code);
            error = exError;
        } else if (tokenHash) {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: "magiclink" as EmailOtpType,
            });
            error = verifyError ?? null;
        } else {
            return NextResponse.redirect(
                `${requestUrl.origin}/auth/auth-code-error?error=no_code`
            );
        }

        if (error) {
            console.error("Auth error:", error.message);
            return NextResponse.redirect(
                `${requestUrl.origin}/auth/auth-code-error?error=${encodeURIComponent(
                    error.message
                )}`
            );
        }

        // Get the user data
        const {
            data: { user },
        } = await supabase.auth.getUser();

        // Enforce UWaterloo-only access. If the email domain doesn't match,
        // immediately sign out and show an error.
        if (user) {
            const email = (user.email || "").toLowerCase();
            const isUW = email.endsWith("@uwaterloo.ca");
            if (!isUW) {
                await supabase.auth.signOut();
                return NextResponse.redirect(
                    `${requestUrl.origin}/auth/auth-code-error?error=Only%20uwaterloo.ca%20emails%20are%20allowed`
                );
            }
            // Create or update user record in our database
            await createUserRecord({
                userId: user.id,
                email: user.email || "",
                fullName: user.user_metadata?.full_name || user.user_metadata?.name,
                source: user.user_metadata?.source,
            });
        }

        // Redirect to explore after successful auth
        return NextResponse.redirect(`${requestUrl.origin}/explore`);
    } catch (error) {
        console.error("Callback error:", error);
        return NextResponse.redirect(
            `${requestUrl.origin}/auth/auth-code-error?error=unknown`
        );
    }
}
