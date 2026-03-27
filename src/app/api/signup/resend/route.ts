import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { generateSixDigitVerificationCode, sendStudentVerificationEmail } from "@/lib/brevo-student-verification";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
    };

    const email = body.email?.trim() ?? "";

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
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
      return NextResponse.json({ error: "Could not refresh verification code." }, { status: 500 });
    }

    const result = await sendStudentVerificationEmail(email, code);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Verification code resent.",
    });
  } catch {
    return NextResponse.json({ error: "Could not resend code." }, { status: 500 });
  }
}
