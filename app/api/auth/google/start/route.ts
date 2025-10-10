import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { PUBLIC_APP_URL } from "@/lib/config";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${PUBLIC_APP_URL}/auth/callback`,
        skipBrowserRedirect: false,
      },
    });
    if (error || !data?.url) {
      return NextResponse.json(
        { error: "Failed to start Google OAuth" },
        { status: 500 }
      );
    }
    return NextResponse.redirect(data.url);
  } catch {
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}

