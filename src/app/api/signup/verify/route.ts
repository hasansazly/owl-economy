import { NextResponse } from "next/server";

import { createSessionToken, getSessionCookieConfig } from "@/lib/session";
import { verifyCode } from "@/lib/signup-verification";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      code?: string;
    };

    const email = body.email?.trim() ?? "";
    const code = body.code?.trim() ?? "";

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
    }

    const result = verifyCode(email, code);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    const response = NextResponse.json({
      success: true,
      message: result.message,
      redirectTo: "/dashboard",
    });

    response.cookies.set(
      getSessionCookieConfig().name,
      createSessionToken(email),
      getSessionCookieConfig(),
    );

    return response;
  } catch {
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
