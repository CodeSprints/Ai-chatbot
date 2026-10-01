import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createOpenRouterProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "openrouter",
    baseURL: "https://openrouter.ai/api/v1",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://github.com/ai-chatbot", // Optional: your site URL
      "X-Title": "Iskra Chatbot", // Optional: your app name
    },
  });
}