import { NextResponse } from "next/server";

import { generateSixDigitVerificationCode, sendStudentVerificationEmail } from "@/lib/brevo-student-verification";
import { isVerifiedTempleEmail } from "@/lib/security";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase() ?? "";

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    if (!isVerifiedTempleEmail(email)) {
      return NextResponse.json({ error: "Only @temple.edu emails can sign up." }, { status: 400 });
    }

    if (!body.password || body.password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
    }

    const code = generateSixDigitVerificationCode();

    const { error: otpError } = await supabase.from("otps").upsert(
      {
        email,
        code,
        verified: false,
      } as never,
      { onConflict: "email" },
    );

    if (otpError) {
      return NextResponse.json({ error: "Could not create verification code." }, { status: 500 });
    }

    const result = await sendStudentVerificationEmail(email, code);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      email: result.email,
      dbUpdateCommand: result.dbUpdateCommand,
      message: "Verification email sent.",
    });
  } catch {
    return NextResponse.json(
      { error: "Signup failed. Please try again." },
      { status: 500 },
    );
  }
}
