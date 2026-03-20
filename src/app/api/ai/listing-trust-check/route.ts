import { NextResponse } from "next/server";

import { generateJson } from "@/lib/openai";

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
    const body = (await request.json()) as TrustCheckRequest;

    if (!body.title?.trim() && !body.description?.trim()) {
      return NextResponse.json(
        { error: "Add a title or description before running AI trust check." },
        { status: 400 },
      );
    }

    const result = await generateJson<TrustCheckResponse>({
      system:
        "You are a marketplace trust assistant for a US student marketplace called DormStash. Review listings for clarity, suspicious resale risk, missing details, or safety issues. Do not be alarmist. Return JSON only. safeToPost should be either YES or REVIEW. riskLevel should be LOW, MEDIUM, or HIGH. checks must be an array of 2 to 4 short strings.",
      prompt: `Review this listing:

Listing type: ${body.listingType || "Unknown"}
Title: ${body.title || "Unknown"}
Description: ${body.description || "Unknown"}
Price: ${body.price || "Unknown"}
Pickup location: ${body.location || "Unknown"}

Return JSON with exactly these fields:
- safeToPost (string)
- riskLevel (string)
- summary (string)
- checks (array of strings)`,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI trust check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
