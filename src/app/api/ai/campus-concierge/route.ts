import { NextResponse } from "next/server";

import { generateJson } from "@/lib/openai";

type ConciergeRequest = {
  question?: string;
};

type ConciergeResponse = {
  answer: string;
  suggestedRoute: string;
  suggestedAction: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConciergeRequest;
    const question = body.question?.trim();

    if (!question) {
      return NextResponse.json({ error: "Ask a question first." }, { status: 400 });
    }

    const result = await generateJson<ConciergeResponse>({
      system:
        "You are DormStash AI, a campus marketplace concierge. Help students navigate these product areas: Sell Goods, Rent a Room, Launch Events, Fundraise Fast, Campus Creatives, Lost and Found, and Campus Services. Recommend the best route and next action. Return JSON only.",
      prompt: `Student question: ${question}

Return JSON with exactly these string fields:
- answer
- suggestedRoute
- suggestedAction`,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI concierge failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
