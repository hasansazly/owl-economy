import { NextResponse } from "next/server";

import { sendStudentVerificationEmail } from "@/lib/brevo-student-verification";
import { storeVerificationCode } from "@/lib/signup-verification";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
    };

    const email = body.email?.trim() ?? "";

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const result = await sendStudentVerificationEmail(email);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    storeVerificationCode(result.email, result.code);

    return NextResponse.json({
      success: true,
      message: "Verification code resent.",
    });
  } catch {
    return NextResponse.json({ error: "Could not resend code." }, { status: 500 });
  }
}
