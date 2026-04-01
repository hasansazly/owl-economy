export type NotificationListing = {
  id: string | number;
  title?: string | null;
  category?: string | null;
  description?: string | null;
  poster_name?: string | null;
  price?: number | string | null;
  location?: string | null;
  created_at?: string | null;
  contact_email?: string | null;
  email?: string | null;
};

export type CampusNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

type SavedItemSnapshot = {
  id: string;
  title: string;
  lastPrice: number | null;
};

const NOTIFICATIONS_KEY = "mydormstash_notifications";
const SEEN_LISTINGS_KEY = "mydormstash_seen_listings";
const SAVED_ITEMS_KEY = "mydormstash_saved_items";
const LISTING_VIEWS_KEY = "mydormstash_listing_views";
const ACKED_VIEWS_KEY = "mydormstash_acked_listing_views";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizePrice(price?: number | string | null) {
  if (price === null || price === undefined || price === "") return null;
  const parsed = Number(price);
  return Number.isNaN(parsed) ? null : parsed;
}

function mergeNotifications(nextItems: CampusNotification[]) {
  const current = readJson<CampusNotification[]>(NOTIFICATIONS_KEY, []);
  const byId = new Map(current.map((item) => [item.id, item]));

  for (const item of nextItems) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }

  const merged = Array.from(byId.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 25);

  writeJson(NOTIFICATIONS_KEY, merged);
  return merged;
}

export function getCampusNotifications() {
  return readJson<CampusNotification[]>(NOTIFICATIONS_KEY, []);
}

export function markCampusNotificationsRead() {
  const current = getCampusNotifications();
  const next = current.map((item) => ({ ...item, read: true }));
  writeJson(NOTIFICATIONS_KEY, next);
  return next;
}

export function isSavedListing(listingId: string | number) {
  const current = readJson<Record<string, SavedItemSnapshot>>(SAVED_ITEMS_KEY, {});
  return Boolean(current[String(listingId)]);
}

export function toggleSavedListing(listing: NotificationListing) {
  const current = readJson<Record<string, SavedItemSnapshot>>(SAVED_ITEMS_KEY, {});
  const key = String(listing.id);

  if (current[key]) {
    delete current[key];
  } else {
    current[key] = {
      id: key,
      title: listing.title || "Saved listing",
      lastPrice: normalizePrice(listing.price),
    };
  }

  writeJson(SAVED_ITEMS_KEY, current);
  return Boolean(current[key]);
}

export function incrementListingView(listing: NotificationListing, viewerEmail: string) {
  const ownerEmail = (listing.contact_email || listing.email || "").trim().toLowerCase();
  const normalizedViewer = viewerEmail.trim().toLowerCase();

  if (!ownerEmail || !normalizedViewer || ownerEmail === normalizedViewer || typeof window === "undefined") {
    return;
  }

  const current = readJson<Record<string, number>>(LISTING_VIEWS_KEY, {});
  const key = String(listing.id);
  current[key] = (current[key] || 0) + 1;
  writeJson(LISTING_VIEWS_KEY, current);
}

export function buildCampusNotifications({
  listings,
  currentEmail,
  eventAlerts,
  lostFoundAlerts,
}: {
  listings: NotificationListing[];
  currentEmail: string;
  eventAlerts: boolean;
  lostFoundAlerts: boolean;
}) {
  const existing = getCampusNotifications();
  const next: CampusNotification[] = [];
  const seenIds = new Set(readJson<string[]>(SEEN_LISTINGS_KEY, []));
  const newListings = listings.filter((item) => !seenIds.has(String(item.id)));
  const savedItems = readJson<Record<string, SavedItemSnapshot>>(SAVED_ITEMS_KEY, {});
  const viewCounts = readJson<Record<string, number>>(LISTING_VIEWS_KEY, {});
  const ackedViews = readJson<Record<string, number>>(ACKED_VIEWS_KEY, {});
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const normalizedEmail = currentEmail.trim().toLowerCase();

  const nearbyFreshPosts = listings.filter((item) => {
    const createdAt = item.created_at ? new Date(item.created_at).getTime() : 0;
    return createdAt >= oneHourAgo;
  });

  if (nearbyFreshPosts.length >= 3) {
    const newestId = String(nearbyFreshPosts[0]?.id || "hourly");
    next.push({
      id: `nearby-hour-${newestId}`,
      title: "New items near you",
      body: `${nearbyFreshPosts.length} new items posted near you in the last hour.`,
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  if (lostFoundAlerts) {
    const airpodPost = newListings.find((item) => {
      const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
      return (item.category || "").toLowerCase().includes("lost") && text.includes("airpod");
    });

    if (airpodPost) {
      next.push({
        id: `lost-airpod-${String(airpodPost.id)}`,
        title: `${airpodPost.poster_name || "A student"} just posted a lost AirPod`,
        body: `${airpodPost.poster_name || "A Temple student"} posted in Lost & Found${airpodPost.location ? ` near ${airpodPost.location}` : ""}.`,
        createdAt: airpodPost.created_at || new Date().toISOString(),
        read: false,
      });
    }
  }

  if (eventAlerts) {
    for (const [id, snapshot] of Object.entries(savedItems)) {
      const currentListing = listings.find((item) => String(item.id) === id);
      if (!currentListing) continue;

      const currentPrice = normalizePrice(currentListing.price);
      if (snapshot.lastPrice !== null && currentPrice !== null && currentPrice < snapshot.lastPrice) {
        next.push({
          id: `price-drop-${id}-${currentPrice}`,
          title: "Price drop on a saved item",
          body: `${currentListing.title || snapshot.title} dropped from $${snapshot.lastPrice} to $${currentPrice}.`,
          createdAt: new Date().toISOString(),
          read: false,
        });
        savedItems[id] = {
          ...snapshot,
          lastPrice: currentPrice,
        };
      }
    }
  }

  if (normalizedEmail) {
    const ownedListings = listings.filter((item) => {
      const ownerEmail = (item.contact_email || item.email || "").trim().toLowerCase();
      return ownerEmail && ownerEmail === normalizedEmail;
    });

    for (const item of ownedListings) {
      const key = String(item.id);
      const currentViews = viewCounts[key] || 0;
      const seenViews = ackedViews[key] || 0;

      if (currentViews > seenViews) {
        const delta = currentViews - seenViews;
        next.push({
          id: `listing-view-${key}-${currentViews}`,
          title: "Someone viewed your listing",
          body: `"${item.title || "Your listing"}" picked up ${delta} new view${delta === 1 ? "" : "s"}.`,
          createdAt: new Date().toISOString(),
          read: false,
        });
        ackedViews[key] = currentViews;
      }
    }
  }

  writeJson(SAVED_ITEMS_KEY, savedItems);
  writeJson(ACKED_VIEWS_KEY, ackedViews);
  writeJson(SEEN_LISTINGS_KEY, listings.map((item) => String(item.id)));

  return mergeNotifications(next.length ? next : existing.slice(0, 25));
}
