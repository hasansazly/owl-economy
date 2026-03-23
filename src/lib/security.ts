const TEMPLE_EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@temple\.edu$/i;

export function isVerifiedTempleEmail(email: string) {
  return TEMPLE_EMAIL_PATTERN.test(email.trim());
}

export function buildSellerContactHref(itemTitle: string, sellerEmail: string) {
  const normalizedEmail = sellerEmail.trim().toLowerCase();

  if (!isVerifiedTempleEmail(normalizedEmail)) {
    return null;
  }

  const subject = encodeURIComponent(`Interest in ${itemTitle} on MyDormStash`);
  const body = encodeURIComponent(
    "Hi, I saw your listing on MyDormStash. Is this still available to meet on campus?",
  );

  return `mailto:${normalizedEmail}?subject=${subject}&body=${body}`;
}

export function clampText(value: string | undefined, maxLength: number) {
  return value?.trim().slice(0, maxLength) ?? "";
}

export async function parseJsonBody<T>(request: Request, maxBytes = 8_192): Promise<T> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error("Requests must use application/json.");
  }

  const rawBody = await request.text();
  if (!rawBody.trim()) {
    throw new Error("Request body is required.");
  }

  if (rawBody.length > maxBytes) {
    throw new Error("Request is too large.");
  }

  try {
    return JSON.parse(rawBody) as T;
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

export function getApiErrorStatus(message: string, aiNotConfiguredMessage?: string) {
  if (aiNotConfiguredMessage && message === aiNotConfiguredMessage) {
    return 503;
  }

  if (message.includes("Too many requests")) {
    return 429;
  }

  if (
    message.includes("application/json") ||
    message.includes("Request body") ||
    message.includes("Request is too large") ||
    message.includes("valid JSON")
  ) {
    return 400;
  }

  return 500;
}
