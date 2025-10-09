import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const bodySchema = z.object({
  email: z.string().email().max(320),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parse = bodySchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const emailRaw = parse.data.email.trim();
    const email = emailRaw.toLowerCase();

    // Enforce @uwaterloo.ca only
    const allowed = email.endsWith("@uwaterloo.ca");
    if (!allowed) {
      return NextResponse.json(
        { error: "Only @uwaterloo.ca emails are allowed." },
        { status: 400 }
      );
    }

    const origin = new URL(req.url).origin;
    const redirectTo = `${origin}/auth/callback`;

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    if (error) {
      // Hide detailed errors to avoid information leakage
      return NextResponse.json(
        { error: "Could not send magic link. Please try again." },
        { status: error.status ?? 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}

