type IdentityListing = {
  id: string | number;
  title?: string | null;
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

export type CampusBadge = {
  id: string;
  label: string;
};

export type LeaderboardEntry = {
  email: string;
  name: string;
  major: string;
  classYear: string;
  karma: number;
  listings: number;
};

export function getListingsForOwner(listings: IdentityListing[], ownerEmail: string) {
  const normalizedOwner = ownerEmail.trim().toLowerCase();
  return listings.filter((item) => getListingOwnerEmail(item) === normalizedOwner);
}

export function getCampusBadges(listings: IdentityListing[], ownerEmail: string) {
  const owned = getListingsForOwner(listings, ownerEmail);
  const badges: CampusBadge[] = [];

  const lostAndFoundCount = owned.filter((item) => (item.category || "").toLowerCase().includes("lost")).length;
  const marketplaceCount = owned.filter((item) => {
    const category = (item.category || "").toLowerCase();
    return !category.includes("lost") && !category.includes("event") && !category.includes("service") && !category.includes("fundraise");
  }).length;
  const eventsCount = owned.filter((item) => (item.category || "").toLowerCase().includes("event")).length;

  if (lostAndFoundCount >= 1) {
    badges.push({ id: "dorm-hero", label: "Dorm Hero" });
  }

  if (marketplaceCount >= 4) {
    badges.push({ id: "hustle-award", label: "Hustle Award" });
  }

  if (eventsCount >= 2) {
    badges.push({ id: "campus-starter", label: "Campus Starter" });
  }

  if (computeCampusKarma(listings, ownerEmail) >= 30) {
    badges.push({ id: "campus-known", label: "Campus Known" });
  }

  return badges;
}

export function buildWeeklyLeaderboard(listings: IdentityListing[]) {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = listings.filter((item) => {
    const created = item.created_at ? new Date(item.created_at).getTime() : 0;
    return created >= oneWeekAgo;
  });

  const byOwner = new Map<string, LeaderboardEntry>();

  for (const item of thisWeek) {
    const email = getListingOwnerEmail(item);
    if (!email) continue;

    const current = byOwner.get(email) || {
      email,
      name: item.poster_name || "Temple Student",
      major: item.major || "",
      classYear: item.class_year || "",
      karma: 0,
      listings: 0,
    };

    current.name = current.name || item.poster_name || "Temple Student";
    current.major = current.major || item.major || "";
    current.classYear = current.classYear || item.class_year || "";
    current.listings += 1;
    byOwner.set(email, current);
  }

  const scored = Array.from(byOwner.values()).map((entry) => ({
    ...entry,
    karma: computeCampusKarma(thisWeek, entry.email),
  }));

  return scored
    .sort((a, b) => {
      if (a.karma !== b.karma) return b.karma - a.karma;
      if (a.listings !== b.listings) return b.listings - a.listings;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 5);
}
