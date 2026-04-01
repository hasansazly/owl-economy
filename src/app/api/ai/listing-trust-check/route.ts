import { NextResponse } from "next/server";

import { AI_NOT_CONFIGURED_MESSAGE, generateJson } from "@/lib/openai";
import { enforceRateLimit } from "@/lib/rate-limit";
import { clampText, getApiErrorStatus, parseJsonBody } from "@/lib/security";

type TrustCheckRequest = {
  listingType?: string;
  title?: string;
  description?: string;
  price?: string;
  location?: string;
};

type TrustCheckResponse = {
  safeToPost: string;
  riskLevel: string;
  summary: string;
  checks: string[];
};

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, {
      keyPrefix: "ai-listing-trust-check",
      limit: 8,
      windowMs: 60_000,
    });

    const body = await parseJsonBody<TrustCheckRequest>(request, 12_288);
    const title = clampText(body.title, 120);
    const description = clampText(body.description, 1_500);

    if (!title && !description) {
      return NextResponse.json(
        { error: "Add a title or description before running AI trust check." },
        { status: 400 },
      );
    }

    const result = await generateJson<TrustCheckResponse>({
      system:
        "You are a marketplace trust assistant for a US student marketplace called DormStash. Review listings for clarity, suspicious resale risk, missing details, or safety issues. Do not be alarmist. Return JSON only. safeToPost should be either YES or REVIEW. riskLevel should be LOW, MEDIUM, or HIGH. checks must be an array of 2 to 4 short strings.",
      prompt: `Review this listing:

Listing type: ${clampText(body.listingType, 60) || "Unknown"}
Title: ${title || "Unknown"}
Description: ${description || "Unknown"}
Price: ${clampText(body.price, 40) || "Unknown"}
Pickup location: ${clampText(body.location, 120) || "Unknown"}

Return JSON with exactly these fields:
- safeToPost (string)
- riskLevel (string)
- summary (string)
- checks (array of strings)`,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI is temporarily unavailable. Please try again.";
    const status = getApiErrorStatus(message, AI_NOT_CONFIGURED_MESSAGE);
    return NextResponse.json({ error: message }, { status });
  }
}
