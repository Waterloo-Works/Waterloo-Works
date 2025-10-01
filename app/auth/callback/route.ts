import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createUserRecord } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);

	try {
		const code = requestUrl.searchParams.get("code");

		if (!code) {
			return NextResponse.redirect(
				`${requestUrl.origin}/auth/auth-code-error?error=no_code`
			);
		}

		const supabase = await createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);

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

		if (user) {
			// Create or update user record in our database
			await createUserRecord({
				userId: user.id,
				email: user.email || "",
				fullName: user.user_metadata?.full_name || user.user_metadata?.name,
				source: user.user_metadata?.source,
			});
		}

		// Redirect to dashboard after successful auth
		return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
	} catch (error) {
		console.error("Callback error:", error);
		return NextResponse.redirect(
			`${requestUrl.origin}/auth/auth-code-error?error=unknown`
		);
	}
}
