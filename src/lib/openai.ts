const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5-mini";
export const AI_NOT_CONFIGURED_MESSAGE =
  "AI is not configured yet. Add OPENAI_API_KEY to your environment and restart the app.";

type OpenAITextResponse = {
  output_text?: string;
};

export function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error(AI_NOT_CONFIGURED_MESSAGE);
  }

  return { apiKey, model };
}

export async function generateJson<T>({
  system,
  prompt,
}: {
  system: string;
  prompt: string;
}): Promise<T> {
  const { apiKey, model } = getOpenAIConfig();

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: system }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }],
        },
      ],
      text: {
        format: {
          type: "json_object",
        },
      },
      store: false,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    if (response.status === 401 || response.status === 403) {
      throw new Error("AI configuration looks invalid. Check your OpenAI API key and model settings.");
    }
    throw new Error(message || "AI is temporarily unavailable. Please try again.");
  }

  const data = (await response.json()) as OpenAITextResponse;

  if (!data.output_text) {
    throw new Error("AI did not return a usable response. Please try again.");
  }

  return JSON.parse(data.output_text) as T;
}
