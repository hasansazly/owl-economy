import { NextResponse } from "next/server";

import { AI_NOT_CONFIGURED_MESSAGE, generateJson } from "@/lib/openai";
import { enforceRateLimit } from "@/lib/rate-limit";
import { clampText, getApiErrorStatus, parseJsonBody } from "@/lib/security";

type ListingDraftRequest = {
  listingType?: string;
  condition?: string;
  category?: string;
  price?: string;
  location?: string;
  notes?: string;
};

type ListingDraftResponse = {
  title: string;
  description: string;
  categorySuggestion: string;
  pricingTip: string;
};

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, {
      keyPrefix: "ai-listing-draft",
      limit: 8,
      windowMs: 60_000,
    });

    const body = await parseJsonBody<ListingDraftRequest>(request, 12_288);

    const notes = clampText(body.notes, 1_500);
    if (!notes) {
      return NextResponse.json({ error: "Please add a few details first." }, { status: 400 });
    }

    const result = await generateJson<ListingDraftResponse>({
      system:
        "You help students create campus marketplace listings for DormStash. Return concise, trustworthy output as JSON only. Keep the tone student-friendly, specific, and practical. The title must be under 60 characters. The description must be under 280 characters.",
      prompt: `Draft a marketplace listing using this info:

Listing type: ${clampText(body.listingType, 60) || "Unknown"}
Condition: ${clampText(body.condition, 60) || "Unknown"}
Current category: ${clampText(body.category, 60) || "Unknown"}
Current price: ${clampText(body.price, 40) || "Unknown"}
Pickup location: ${clampText(body.location, 120) || "Unknown"}
Seller notes: ${notes}

Return JSON with exactly these string fields:
- title
- description
- categorySuggestion
- pricingTip`,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI is temporarily unavailable. Please try again.";
    const status = getApiErrorStatus(message, AI_NOT_CONFIGURED_MESSAGE);
    return NextResponse.json({ error: message }, { status });
  }
}
