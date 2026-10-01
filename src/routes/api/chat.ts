import { createFileRoute } from "vue-router";
import {
  streamLmStudio,
  getActiveLmStudioModel,
  type LmStudioMessage,
} from "@/lib/lm-studio.server";



type FilePart = {
  type: "file";
  mediaType?: string;
  mimeType?: string;
  data?: string;
  url?: string;
};

type TextPart = { type: "text"; text: string };
type MessagePart = TextPart | FilePart | { type: string };

type UIMessage = {
  id?: string;
  role: "user" | "assistant" | "system";
  content?: string;
  parts?: MessagePart[];
};

type ChatRequestBody = {
  messages?: unknown;
  model?: unknown;
};

type ImageContentPart = { type: "image_url"; image_url: { url: string } };
type ContentPart = { type: "text"; text: string } | ImageContentPart;

// ─── Stałe ────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Jesteś pomocnym asystentem AI o imieniu Iskra. 
Odpowiadaj po polsku (chyba że użytkownik napisze w innym języku).
Używaj markdown do formatowania, emotek gdy pasują, i bądź zwięzły ale zimny.
Gdy użytkownik prześle obraz lub plik, opisz co widzisz i odpowiedz na jego pytanie.`;

const LM_STUDIO_PREFIX = "lm-studio:";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isTextPart(p: MessagePart): p is TextPart {
  return p.type === "text";
}

function isFilePart(p: MessagePart): p is FilePart {
  return p.type === "file";
}

function extractLmModelId(modelId: string): string {
  return modelId.startsWith(LM_STUDIO_PREFIX)
    ? modelId.slice(LM_STUDIO_PREFIX.length)
    : modelId;
}

function isLmStudioModel(modelId: string): boolean {
  return modelId === "lm-studio" || modelId.startsWith(LM_STUDIO_PREFIX);
}

// ─── Konwersja wiadomości ─────────────────────────────────────────────────────

function buildImageUrl(part: FilePart): string | null {
  if (part.url) return part.url;
  if (part.data) {
    const mime = part.mediaType ?? part.mimeType ?? "image/jpeg";
    return part.data.startsWith("data:") ? part.data : `data:${mime};base64,${part.data}`;
  }
  return null;
}

function uiMessagesToLmStudio(messages: UIMessage[]): LmStudioMessage[] {
  const result: LmStudioMessage[] = [];

  for (const msg of messages) {
    const role = msg.role ?? "user";

    if (role === "assistant") {
      const text =
        (msg.parts ?? []).filter(isTextPart).map((p) => p.text).join("") ||
        msg.content ||
        "";
      if (text) result.push({ role: "assistant", content: text });
      continue;
    }

    if (role === "user") {
      const parts = msg.parts ?? [];

      if (parts.length === 0) {
        result.push({ role: "user", content: msg.content ?? "" });
        continue;
      }

      const contentParts: ContentPart[] = [];

      for (const part of parts) {
        if (isTextPart(part) && part.text.trim()) {
          contentParts.push({ type: "text", text: part.text });
        } else if (isFilePart(part)) {
          const mime = part.mediaType ?? part.mimeType ?? "";
          if (mime.startsWith("image/")) {
            const url = buildImageUrl(part);
            if (url) contentParts.push({ type: "image_url", image_url: { url } });
          }
        }
      }

      if (contentParts.length === 0) {
        result.push({ role: "user", content: msg.content ?? "" });
      } else if (contentParts.length === 1 && contentParts[0].type === "text") {
        result.push({ role: "user", content: contentParts[0].text });
      } else {
        // LmStudioMessage.content akceptuje ContentPart[] (OpenAI-compatible)
        result.push({ role: "user", content: contentParts as LmStudioMessage["content"] });
      }
    }
  }

  return result;
}

// ─── SSE → AI SDK v7 stream bridge ───────────────────────────────────────────

function lmSseToAiSdkStream(
  sseStream: ReadableStream<Uint8Array>,
  modelId: string,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const msgId = crypto.randomUUID();
  const textPartId = crypto.randomUUID();

  function emit(obj: unknown): Uint8Array {
    return encoder.encode(`data: ${JSON.stringify(obj)}\n\n`);
  }

  return new ReadableStream({
    async start(controller) {
      const reader = sseStream.getReader();
      let buffer = "";
      let started = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data) as {
                choices?: Array<{
                  delta?: { content?: string | null };
                  finish_reason?: string | null;
                }>;
                error?: { message: string };
              };

              if (parsed.error) {
                console.error(`[lm-studio stream] ${parsed.error.message}`);
                break;
              }

              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                if (!started) {
                  controller.enqueue(emit({ type: "start", messageId: msgId }));
                  controller.enqueue(emit({ type: "start-step" }));
                  controller.enqueue(emit({ type: "text-start", id: textPartId }));
                  controller.enqueue(emit({
                    type: "data-model-used",
                    id: crypto.randomUUID(),
                    data: { model: modelId },
                  }));
                  started = true;
                }
                controller.enqueue(emit({ type: "text-delta", id: textPartId, delta: content }));
              }

              const finishReason = parsed.choices?.[0]?.finish_reason;
              if (finishReason && finishReason !== "null" && started) {
                controller.enqueue(emit({ type: "text-end", id: textPartId }));
                controller.enqueue(emit({ type: "finish-step" }));
                controller.enqueue(emit({ type: "finish", finishReason }));
              }
            } catch {
              // pominięty malformed chunk
            }
          }
        }

        if (started) {
          controller.enqueue(emit({ type: "text-end", id: textPartId }));
          controller.enqueue(emit({ type: "finish-step" }));
          controller.enqueue(emit({ type: "finish", finishReason: "stop" }));
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        console.error(`[lm-studio stream] błąd odczytu:`, err);
        controller.error(err);
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });
}

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: ChatRequestBody;
        try {
          body = (await request.json()) as ChatRequestBody;
        } catch {
          return new Response("Nieprawidłowy JSON", { status: 400 });
        }

        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          return new Response("Wiadomości są wymagane", { status: 400 });
        }

        const uiMessages = body.messages as UIMessage[];
        const requestedModel =
          typeof body.model === "string" ? body.model : "lm-studio";

        // Wyciągnij rzeczywiste ID modelu w LM Studio
        const rawModelId = isLmStudioModel(requestedModel)
          ? requestedModel === "lm-studio"
            ? await getActiveLmStudioModel()
            : extractLmModelId(requestedModel)
          : requestedModel; // na wypadek gdyby ktoś wysłał dowolny string

        if (!rawModelId) {
          return new Response(
            "LM Studio nie ma załadowanego modelu. Załaduj model w LM Studio i spróbuj ponownie.",
            { status: 503 },
          );
        }

        const lmMessages: LmStudioMessage[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...uiMessagesToLmStudio(uiMessages),
        ];

        console.log(`[chat] LM Studio → ${rawModelId}`);

        const res = await streamLmStudio(rawModelId, lmMessages);

        if (!res || !res.ok || !res.body) {
          const detail = res
            ? `HTTP ${res.status}`
            : "brak połączenia";
          console.error(`[chat] LM Studio niedostępne: ${detail}`);
          return new Response(
            `LM Studio niedostępne (${detail}). Upewnij się że serwer jest uruchomiony na ${process.env.LM_STUDIO_BASE_URL ?? "http://localhost:1234"}.`,
            { status: 503 },
          );
        }

        const stream = lmSseToAiSdkStream(res.body, `lm-studio:${rawModelId}`);
        return new Response(stream, {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "X-Model-Used": `lm-studio:${rawModelId}`,
          },
        });
      },
    },
  },
});
