const EDU_EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.edu$/i;

type VerificationRecord = {
  email: string;
  code: string;
};

const verificationStore = new Map<string, string>();

export function isEduEmail(email: string) {
  return EDU_EMAIL_PATTERN.test(email.trim());
}

export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function createSignupVerification(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isEduEmail(normalizedEmail)) {
    return {
      success: false,
      message: "Only .edu email addresses are allowed.",
    };
  }

  const code = generateVerificationCode();
  verificationStore.set(normalizedEmail, code);

  return {
    success: true,
    email: normalizedEmail,
    code,
    dbUpdateCommand: buildMockVerificationUpdate(normalizedEmail, code),
    message: "Verification code generated.",
  };
}

export function buildMockVerificationUpdate(email: string, code: string) {
  return {
    sql: "UPDATE users SET verification_code = ?, verification_status = ? WHERE email = ?",
    params: [code, "pending", email],
  };
}

export function verifyCode(email: string, inputCode: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const storedCode = verificationStore.get(normalizedEmail);

  if (!storedCode) {
    return {
      success: false,
      message: "No verification code found for this email.",
    };
  }

  if (storedCode !== inputCode.trim()) {
    return {
      success: false,
      message: "Verification code does not match.",
    };
  }

  verificationStore.delete(normalizedEmail);

  return {
    success: true,
    message: "Email verified successfully.",
  };
}

export function getStoredVerification(email: string): VerificationRecord | null {
  const normalizedEmail = email.trim().toLowerCase();
  const code = verificationStore.get(normalizedEmail);

  if (!code) {
    return null;
  }

  return {
    email: normalizedEmail,
    code,
  };
}
