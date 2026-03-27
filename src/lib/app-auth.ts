const VERIFIED_EMAIL_KEY = "mydormstash_verified_email";

export function setVerifiedStudentEmail(email: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VERIFIED_EMAIL_KEY, email.trim().toLowerCase());
}

export function getVerifiedStudentEmail() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(VERIFIED_EMAIL_KEY) || "";
}

export function isVerifiedStudentLoggedIn() {
  return Boolean(getVerifiedStudentEmail());
}

export function clearVerifiedStudentEmail() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(VERIFIED_EMAIL_KEY);
}
