const VERIFIED_EMAIL_KEY = "mydormstash_verified_email";
const STUDENT_PROFILE_KEY = "mydormstash_student_profile";

export type StudentProfile = {
  name: string;
  email: string;
  phone: string;
  major: string;
  classYear: string;
  privacyMode: boolean;
  eventAlerts: boolean;
  lostFoundAlerts: boolean;
};

const defaultProfile: StudentProfile = {
  name: "",
  email: "",
  phone: "",
  major: "",
  classYear: "2028",
  privacyMode: true,
  eventAlerts: true,
  lostFoundAlerts: true,
};

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

export function getStudentProfile() {
  if (typeof window === "undefined") return defaultProfile;

  const raw = window.localStorage.getItem(STUDENT_PROFILE_KEY);

  if (!raw) {
    return {
      ...defaultProfile,
      email: getVerifiedStudentEmail(),
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StudentProfile>;
    return {
      ...defaultProfile,
      ...parsed,
      email: parsed.email || getVerifiedStudentEmail(),
    };
  } catch {
    return {
      ...defaultProfile,
      email: getVerifiedStudentEmail(),
    };
  }
}

export function saveStudentProfile(profile: StudentProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(profile));
}

export function clearStudentProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STUDENT_PROFILE_KEY);
}
