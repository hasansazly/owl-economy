import { NextResponse } from "next/server";

import { isVerifiedTempleEmail } from "@/lib/security";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      code?: string;
    };

    const email = body.email?.trim().toLowerCase() ?? "";
    const code = String(body.code?.trim() ?? "");

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
    }

    if (!isVerifiedTempleEmail(email)) {
      return NextResponse.json({ error: "Only @temple.edu emails can be verified here." }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("otps")
      .select("email, code, verified")
      .eq("email", email)
      .eq("code", code)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { error: "Incorrect code. Please check your Temple email again." },
        { status: 400 },
      );
    }

    const { error: updateError } = await supabase
      .from("otps")
      .update({ verified: true } as never)
      .eq("email", email)
      .eq("code", code);

    if (updateError) {
      return NextResponse.json({ error: "Could not complete verification." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Code verified.",
      redirectTo: "/dashboard",
    });
  } catch {
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
