import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";
import { ENABLE_AUTO_REDIRECTS } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);

	try {
		const code = requestUrl.searchParams.get("code");
		const next = requestUrl.searchParams.get("next") ?? "/";

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

		if (ENABLE_AUTO_REDIRECTS) {
			return NextResponse.redirect(`${requestUrl.origin}${next}`);
		}

		return NextResponse.json({ success: true, message: "Authentication successful" });
	} catch (error) {
		console.error("Callback error:", error);
		return NextResponse.redirect(
			`${requestUrl.origin}/auth/auth-code-error?error=unknown`
		);
	}
}
