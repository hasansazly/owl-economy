export type CampusWallPostType = "text" | "photo";

type CampusWallMeta = {
  type: CampusWallPostType;
  body: string;
  caption?: string | null;
  imageData?: string | null;
};

const WALL_META_PREFIX = "__campus_wall__:";

export function serializeCampusWallMeta(meta: CampusWallMeta) {
  return `${WALL_META_PREFIX}${JSON.stringify(meta)}`;
}

export function parseCampusWallMeta(raw?: string | null) {
  if (!raw) {
    return {
      type: "text" as CampusWallPostType,
      body: "",
      caption: "",
      imageData: "",
      isWall: false,
    };
  }

  if (!raw.startsWith(WALL_META_PREFIX)) {
    return {
      type: "text" as CampusWallPostType,
      body: raw,
      caption: "",
      imageData: "",
      isWall: false,
    };
  }

  try {
    const parsed = JSON.parse(raw.slice(WALL_META_PREFIX.length)) as CampusWallMeta;
    return {
      type: parsed.type || "text",
      body: parsed.body || "",
      caption: parsed.caption || "",
      imageData: parsed.imageData || "",
      isWall: true,
    };
  } catch {
    return {
      type: "text" as CampusWallPostType,
      body: raw,
      caption: "",
      imageData: "",
      isWall: false,
    };
  }
}

export function getCampusWallSummary(raw?: string | null) {
  const parsed = parseCampusWallMeta(raw);
  if (parsed.type === "photo") {
    return parsed.caption || parsed.body || "Campus Wall photo";
  }
  return parsed.body || "Campus Wall post";
}

export function capWallFeedShare<T extends { category?: string | null }>(items: T[]) {
  const wallItems = items.filter((item) => (item.category || "").toLowerCase() === "campus wall");
  const nonWallItems = items.filter((item) => (item.category || "").toLowerCase() !== "campus wall");

  if (wallItems.length === 0) {
    return items;
  }

  const result: T[] = [];
  let wallIndex = 0;
  let nonWallIndex = 0;

  while (nonWallIndex < nonWallItems.length || wallIndex < wallItems.length) {
    for (let i = 0; i < 4 && nonWallIndex < nonWallItems.length; i += 1) {
      result.push(nonWallItems[nonWallIndex]);
      nonWallIndex += 1;
    }

    if (wallIndex < wallItems.length) {
      result.push(wallItems[wallIndex]);
      wallIndex += 1;
    }

    if (nonWallIndex >= nonWallItems.length && wallIndex < wallItems.length) {
      result.push(...wallItems.slice(wallIndex));
      break;
    }
  }

  return result;
}
