import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE_NAME = "mydormstash_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

type SessionPayload = {
  email: string;
  verified: true;
  expiresAt: number;
};

function getSessionSecret() {
  return process.env.SESSION_SECRET || "mydormstash-dev-session-secret";
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signValue(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function createSessionToken(email: string) {
  const payload: SessionPayload = {
    email: email.trim().toLowerCase(),
    verified: true,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;

    if (!payload.email || payload.verified !== true || payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookieConfig() {
  return {
    name: SESSION_COOKIE_NAME,
    maxAge: SESSION_MAX_AGE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}
