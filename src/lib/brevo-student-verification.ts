const STRICT_EDU_EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.edu$/i;

const BREVO_SEND_EMAIL_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const MYDORMSTASH_SENDER = {
  name: "MyDormStash",
  email: "info@mydormstash.com",
};

export function isStrictEduEmail(email: string) {
  return STRICT_EDU_EMAIL_PATTERN.test(email.trim());
}

export function generateSixDigitVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function buildVerificationEmailHtml(code: string) {
  return `
    <html>
      <body style="margin:0;padding:0;background:#000000;color:#ffffff;font-family:Inter,Arial,sans-serif;">
        <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
          <div style="border:1px solid rgba(255,255,255,0.12);border-radius:24px;background:rgba(255,255,255,0.03);padding:32px 24px;">
            <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.48);">
              MyDormStash
            </p>
            <h1 style="margin:0;font-size:28px;line-height:1.15;color:#ffffff;font-weight:800;">
              Verify your student email
            </h1>
            <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.68);">
              Use this verification code to finish setting up your MyDormStash account.
            </p>
            <div style="margin:28px 0 20px;padding:22px 18px;border-radius:18px;background:rgba(18,214,255,0.08);border:1px solid rgba(18,214,255,0.24);text-align:center;">
              <span style="display:block;font-size:40px;line-height:1;font-weight:800;letter-spacing:0.18em;color:#12d6ff;">
                ${code}
              </span>
            </div>
            <p style="margin:0;font-size:13px;line-height:1.7;color:rgba(255,255,255,0.44);">
              If you didn&apos;t request this code, you can ignore this email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `.trim();
}

type SendStudentVerificationEmailResult =
  | {
      success: true;
      email: string;
      code: string;
      messageId?: string;
      dbUpdateCommand: {
        sql: string;
        params: [string, string, string];
      };
    }
  | {
      success: false;
      message: string;
    };

export async function sendStudentVerificationEmail(
  email: string,
): Promise<SendStudentVerificationEmailResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isStrictEduEmail(normalizedEmail)) {
    return {
      success: false,
      message: "Only .edu email addresses are allowed.",
    };
  }

  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      message: "BREVO_API_KEY is not configured.",
    };
  }

  const code = generateSixDigitVerificationCode();
  const dbUpdateCommand = {
    sql: "UPDATE users SET verification_code = ?, verification_status = ? WHERE email = ?",
    params: [code, "pending", normalizedEmail] as [string, string, string],
  };

  const response = await fetch(BREVO_SEND_EMAIL_ENDPOINT, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: MYDORMSTASH_SENDER,
      to: [{ email: normalizedEmail }],
      subject: "Your MyDormStash verification code",
      htmlContent: buildVerificationEmailHtml(code),
    }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    messageId?: string;
    message?: string;
    code?: string;
  };

  if (!response.ok) {
    return {
      success: false,
      message: data.message || "Brevo failed to send the verification email.",
    };
  }

  return {
    success: true,
    email: normalizedEmail,
    code,
    messageId: data.messageId,
    dbUpdateCommand,
  };
}
