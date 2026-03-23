import { NextResponse } from "next/server";

import { AI_NOT_CONFIGURED_MESSAGE, generateJson } from "@/lib/openai";
import { enforceRateLimit } from "@/lib/rate-limit";
import { clampText, getApiErrorStatus, parseJsonBody } from "@/lib/security";

type ConciergeRequest = {
  question?: string;
  homeCampus?: string;
  browsingCampus?: string;
};

type ConciergeResponse = {
  answer: string;
  suggestedRoute: string;
  suggestedAction: string;
};

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, {
      keyPrefix: "ai-campus-concierge",
      limit: 12,
      windowMs: 60_000,
    });

    const body = await parseJsonBody<ConciergeRequest>(request);
    const question = clampText(body.question, 600);
    const homeCampus = clampText(body.homeCampus, 80) || "Unknown";
    const browsingCampus = clampText(body.browsingCampus, 80) || "Unknown";

    if (!question) {
      return NextResponse.json({ error: "Ask a question first." }, { status: 400 });
    }

    const result = await generateJson<ConciergeResponse>({
      system:
        "You are the DormStash AI Concierge, an autonomous campus agent for university students across the USA. Every student has a home campus from their college login, but they may also browse other campuses for better prices or better options. Prioritize the student's home campus first when it fits their need, then mention alternate campus options if cross-campus browsing could help. Your job is to move beyond generic advice and guide the user toward the next concrete action inside DormStash. You support these areas: Sell Goods, Rent a Room, Launch Events, Fundraise Fast, Campus Creatives, Lost and Found, and Campus Services. Use a productive, fast-paced, campus-live tone. Reference campus landmarks only when the campus is known; otherwise use generic landmarks like student center, main library, residence hall, or campus quad. Always prioritize campus helpfulness and trust over profit, especially for Lost and Found requests. When the user wants something specific, shift into action mode: offer to draft a message, suggest a negotiation move, propose a meetup landmark, or help prepare a booking request. The answer should feel like a real campus operator, not a generic chatbot. The suggestedAction must always be a single action-oriented sentence that starts with 'Shall I' and proposes the best next step. Return JSON only.",
      prompt: `Student home campus: ${homeCampus}
Current browsing campus: ${browsingCampus}
Student question: ${question}

Return JSON with exactly these string fields:
- answer
- suggestedRoute
- suggestedAction`,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI is temporarily unavailable. Please try again.";
    const status = getApiErrorStatus(message, AI_NOT_CONFIGURED_MESSAGE);
    return NextResponse.json({ error: message }, { status });
  }
}
