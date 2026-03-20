import { NextResponse } from "next/server";

import { goodsListings } from "@/lib/sell-goods-data";
import { generateJson } from "@/lib/openai";

type RecommendationRequest = {
  query?: string;
};

type RecommendationResponse = {
  summary: string;
  itemIds: string[];
  nextStep: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RecommendationRequest;
    const query = body.query?.trim();

    if (!query) {
      return NextResponse.json({ error: "Add a shopping question first." }, { status: 400 });
    }

    const listingContext = goodsListings.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      condition: item.condition,
      price: item.price,
      neighborhood: item.neighborhood,
      summary: item.summary,
    }));

    const result = await generateJson<RecommendationResponse>({
      system:
        "You are an AI shopping assistant for a student marketplace. Recommend the most relevant items for the student's need from the provided listing catalog only. Return JSON only. itemIds must contain 1 to 3 valid IDs from the catalog.",
      prompt: `Student request: ${query}

Available listings:
${JSON.stringify(listingContext, null, 2)}

Return JSON with exactly these fields:
- summary (string)
- itemIds (array of strings)
- nextStep (string)`,
    });

    const validIds = new Set(goodsListings.map((item) => item.id));
    const itemIds = (result.itemIds || []).filter((id) => validIds.has(id)).slice(0, 3);

    return NextResponse.json({
      ...result,
      itemIds,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI recommendations failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
