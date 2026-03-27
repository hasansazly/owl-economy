type IdentityListing = {
  id: string | number;
  category?: string | null;
  major?: string | null;
  class_year?: string | null;
  poster_name?: string | null;
  contact_email?: string | null;
  email?: string | null;
  location?: string | null;
  created_at?: string | null;
};

export function normalizeTagList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getListingOwnerEmail(item: IdentityListing) {
  return (item.contact_email || item.email || "").trim().toLowerCase();
}

export function computeCampusKarma(listings: IdentityListing[], ownerEmail: string) {
  const normalizedOwner = ownerEmail.trim().toLowerCase();

  if (!normalizedOwner) {
    return 0;
  }

  return listings.reduce((score, item) => {
    if (getListingOwnerEmail(item) !== normalizedOwner) {
      return score;
    }

    const category = (item.category || "").toLowerCase();

    if (category.includes("lost")) return score + 12;
    if (category.includes("fundraise")) return score + 8;
    if (category.includes("event")) return score + 6;
    if (category.includes("service")) return score + 7;

    return score + 5;
  }, 0);
}

export function getCampusKarmaLabel(score: number) {
  if (score >= 36) return "Trusted";
  if (score >= 20) return "Known";
  if (score >= 8) return "Active";
  return "New";
}

export function countMutualClassmates(
  listings: IdentityListing[],
  {
    currentEmail,
    classYear,
    major,
  }: {
    currentEmail: string;
    classYear: string;
    major: string;
  },
) {
  const normalizedEmail = currentEmail.trim().toLowerCase();
  const normalizedYear = classYear.trim().toLowerCase();
  const normalizedMajor = major.trim().toLowerCase();
  const seen = new Set<string>();

  for (const item of listings) {
    const ownerEmail = getListingOwnerEmail(item);

    if (!ownerEmail || ownerEmail === normalizedEmail) continue;

    const sameYear = normalizedYear && (item.class_year || "").trim().toLowerCase() === normalizedYear;
    const sameMajor = normalizedMajor && (item.major || "").trim().toLowerCase() === normalizedMajor;

    if (sameYear || sameMajor) {
      seen.add(ownerEmail);
    }
  }

  return seen.size;
}

export function getPreferencePriority(
  item: IdentityListing,
  {
    homeBuilding,
    followedBuildings,
    followedMajors,
  }: {
    homeBuilding: string;
    followedBuildings: string[];
    followedMajors: string[];
  },
) {
  const location = (item.location || "").toLowerCase();
  const major = (item.major || "").toLowerCase();
  const normalizedHome = homeBuilding.trim().toLowerCase();
  const buildingMatches = followedBuildings.some((building) => location.includes(building.toLowerCase()));
  const majorMatches = followedMajors.some((tag) => major.includes(tag.toLowerCase()));

  if (normalizedHome && location.includes(normalizedHome)) return 3;
  if (buildingMatches) return 2;
  if (majorMatches) return 1;
  return 0;
}
