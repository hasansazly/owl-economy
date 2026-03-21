import { NextResponse } from "next/server";

import { goodsListings } from "@/lib/sell-goods-data";
import { AI_NOT_CONFIGURED_MESSAGE, generateJson } from "@/lib/openai";

type RecommendationRequest = {
  query?: string;
  homeCampus?: string;
  browseCampus?: string;
  includeOtherCampuses?: boolean;
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
      campus: item.campus,
      category: item.category,
      condition: item.condition,
      price: item.price,
      neighborhood: item.neighborhood,
      summary: item.summary,
    }));

    const result = await generateJson<RecommendationResponse>({
      system:
        "You are an AI shopping assistant for a student marketplace used by university students across the USA. Each user has a home campus, but they may browse other campuses too. Prefer strong matches from the home campus first when available, but include other campuses when the student is open to cross-campus shopping or when another campus clearly has a better fit or price. Recommend only from the provided listing catalog. Return JSON only. itemIds must contain 1 to 3 valid IDs from the catalog.",
      prompt: `Student home campus: ${body.homeCampus || "Unknown"}
Current browse campus: ${body.browseCampus || "Unknown"}
Include other campuses: ${body.includeOtherCampuses ? "Yes" : "No"}
Student request: ${query}

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
    const message =
      error instanceof Error ? error.message : "AI is temporarily unavailable. Please try again.";
    const status = message === AI_NOT_CONFIGURED_MESSAGE ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
