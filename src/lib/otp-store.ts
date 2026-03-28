import type { SupabaseClient } from "@supabase/supabase-js";

type OtpPayload = {
  email: string;
  code: string;
  verified: boolean;
};

export async function saveOtpCode(
  supabase: SupabaseClient,
  payload: OtpPayload,
) {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const normalizedCode = String(payload.code).trim();

  const { data: existingRows, error: selectError } = await supabase
    .from("otps")
    .select("email")
    .eq("email", normalizedEmail)
    .limit(1);

  if (selectError) {
    return { error: selectError };
  }

  if (existingRows && existingRows.length > 0) {
    const { error: updateError } = await supabase
      .from("otps")
      .update({
        code: normalizedCode,
        verified: payload.verified,
      } as never)
      .eq("email", normalizedEmail);

    return { error: updateError };
  }

  const { error: insertError } = await supabase.from("otps").insert({
    email: normalizedEmail,
    code: normalizedCode,
    verified: payload.verified,
  } as never);

  return { error: insertError };
}
