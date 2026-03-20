import { NextResponse } from "next/server";

import { AI_NOT_CONFIGURED_MESSAGE, generateJson } from "@/lib/openai";

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
    const body = (await request.json()) as ListingDraftRequest;

    const notes = body.notes?.trim();
    if (!notes) {
      return NextResponse.json({ error: "Please add a few details first." }, { status: 400 });
    }

    const result = await generateJson<ListingDraftResponse>({
      system:
        "You help students create campus marketplace listings for DormStash. Return concise, trustworthy output as JSON only. Keep the tone student-friendly, specific, and practical. The title must be under 60 characters. The description must be under 280 characters.",
      prompt: `Draft a marketplace listing using this info:

Listing type: ${body.listingType || "Unknown"}
Condition: ${body.condition || "Unknown"}
Current category: ${body.category || "Unknown"}
Current price: ${body.price || "Unknown"}
Pickup location: ${body.location || "Unknown"}
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
    const status = message === AI_NOT_CONFIGURED_MESSAGE ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
