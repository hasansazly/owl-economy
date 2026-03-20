const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5-mini";

type OpenAITextResponse = {
  output_text?: string;
};

export function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
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
    throw new Error(message || "OpenAI request failed");
  }

  const data = (await response.json()) as OpenAITextResponse;

  if (!data.output_text) {
    throw new Error("No AI output returned");
  }

  return JSON.parse(data.output_text) as T;
}
