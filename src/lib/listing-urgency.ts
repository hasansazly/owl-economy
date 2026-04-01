export type UrgencyListing = {
  id: string | number;
  title?: string | null;
  description?: string | null;
  created_at?: string | null;
};

type ParsedUrgencyMeta = {
  flashSale: boolean;
  moveOutMode: boolean;
  expiresAt: string | null;
  cleanDescription: string;
};

const META_PREFIX = "[[MDS|";
const META_SUFFIX = "]]";
const LISTING_VIEW_TIMESTAMPS_KEY = "mydormstash_listing_view_timestamps";

export function embedUrgencyMeta(
  description: string,
  options: {
    flashSale?: boolean;
    moveOutMode?: boolean;
    expiresAt?: string | null;
  },
) {
  const metaParts = [
    `flash=${options.flashSale ? 1 : 0}`,
    `moveout=${options.moveOutMode ? 1 : 0}`,
    `expires=${options.expiresAt || ""}`,
  ];

  return `${META_PREFIX}${metaParts.join("|")}${META_SUFFIX}${description.trim()}`;
}

export function parseUrgencyMeta(description?: string | null): ParsedUrgencyMeta {
  const raw = description || "";

  if (!raw.startsWith(META_PREFIX)) {
    return {
      flashSale: false,
      moveOutMode: false,
      expiresAt: null,
      cleanDescription: raw,
    };
  }

  const suffixIndex = raw.indexOf(META_SUFFIX);

  if (suffixIndex === -1) {
    return {
      flashSale: false,
      moveOutMode: false,
      expiresAt: null,
      cleanDescription: raw,
    };
  }

  const metaRaw = raw.slice(META_PREFIX.length, suffixIndex);
  const cleanDescription = raw.slice(suffixIndex + META_SUFFIX.length).trim();
  const meta = Object.fromEntries(
    metaRaw.split("|").map((part) => {
      const [key, value = ""] = part.split("=");
      return [key, value];
    }),
  );

  return {
    flashSale: meta.flash === "1",
    moveOutMode: meta.moveout === "1",
    expiresAt: meta.expires || null,
    cleanDescription,
  };
}

export function getRelativePostLabel(createdAt?: string | null) {
  if (!createdAt) return "Posted just now";

  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));

  if (minutes < 60) return `Posted ${minutes} minute${minutes === 1 ? "" : "s"} ago — moves fast`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Posted ${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `Posted ${days} day${days === 1 ? "" : "s"} ago`;
}

function readViewMap() {
  if (typeof window === "undefined") return {} as Record<string, number[]>;

  try {
    const raw = window.localStorage.getItem(LISTING_VIEW_TIMESTAMPS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number[]>) : {};
  } catch {
    return {} as Record<string, number[]>;
  }
}

function writeViewMap(value: Record<string, number[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LISTING_VIEW_TIMESTAMPS_KEY, JSON.stringify(value));
}

export function recordUrgencyView(listingId: string | number) {
  const current = readViewMap();
  const key = String(listingId);
  const cutoff = Date.now() - 15 * 60 * 1000;
  const nextViews = (current[key] || []).filter((timestamp) => timestamp >= cutoff);
  nextViews.push(Date.now());
  current[key] = nextViews;
  writeViewMap(current);
}

export function getRecentViewerCount(listingId: string | number) {
  const current = readViewMap();
  const key = String(listingId);
  const cutoff = Date.now() - 15 * 60 * 1000;
  const nextViews = (current[key] || []).filter((timestamp) => timestamp >= cutoff);
  current[key] = nextViews;
  writeViewMap(current);
  return nextViews.length;
}

export function getExpiryCountdown(expiresAt?: string | null) {
  if (!expiresAt) return null;

  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Ended";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${Math.max(minutes, 1)}m left`;
}

export function getNextMoveOutDate(now = new Date()) {
  const year = now.getFullYear();
  const spring = new Date(year, 4, 10, 23, 59, 59);
  const fall = new Date(year, 11, 18, 23, 59, 59);

  if (now.getTime() <= spring.getTime()) return spring;
  if (now.getTime() <= fall.getTime()) return fall;

  return new Date(year + 1, 4, 10, 23, 59, 59);
}

export function getMoveOutCountdown(now = new Date()) {
  const next = getNextMoveOutDate(now);
  const diff = next.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days > 45) return null;
  return `${days} day${days === 1 ? "" : "s"} until Move-Out Mode`;
}
