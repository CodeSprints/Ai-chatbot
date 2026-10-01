/**
 * Klient LM Studio — lokalny serwer OpenAI-compatible.
 * LM Studio domyślnie uruchamia API na http://localhost:1234/v1
 */

export type LmStudioModel = {
  id: string;
  object: "model";
  created?: number;
  owned_by?: string;
};

type LmStudioModelsResponse = {
  data: LmStudioModel[];
};

/**
 * Zwraca base URL LM Studio z env, z domyślnym localhost:1234.
 */
export function getLmStudioBaseUrl(): string {
  return (process.env.LM_STUDIO_BASE_URL ?? "http://localhost:1234").replace(/\/$/, "");
}

/**
 * Sprawdza czy LM Studio jest dostępne (zwraca listę modeli).
 * Timeout 2s — żeby nie blokować requestów gdy LM Studio wyłączone.
 */
export async function checkLmStudioAvailable(): Promise<boolean> {
  const baseUrl = getLmStudioBaseUrl();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${baseUrl}/v1/models`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Pobiera listę modeli załadowanych w LM Studio.
 * Zwraca [] jeśli niedostępne.
 */
export async function getLmStudioModels(): Promise<LmStudioModel[]> {
  const baseUrl = getLmStudioBaseUrl();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${baseUrl}/v1/models`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const data = (await res.json()) as LmStudioModelsResponse;
    return Array.isArray(data.data) ? data.data : [];
  } catch {
    return [];
  }
}

/**
 * Zwraca ID aktywnego modelu LM Studio.
 * Najpierw próbuje env LM_STUDIO_DEFAULT_MODEL,
 * potem pierwszy model z listy załadowanych.
 */
export async function getActiveLmStudioModel(): Promise<string | null> {
  const envModel = process.env.LM_STUDIO_DEFAULT_MODEL?.trim();
  if (envModel) return envModel;

  const models = await getLmStudioModels();
  return models[0]?.id ?? null;
}



type TextContentPart = { type: "text"; text: string };
type ImageContentPart = { type: "image_url"; image_url: { url: string } };
type ContentPart = TextContentPart | ImageContentPart;

export type LmStudioMessage = {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
};



/**
 * Wysyła streaming request do LM Studio.
 * Zwraca Response ze strumieniem SSE lub null jeśli błąd połączenia.
 */
export async function streamLmStudio(
  modelId: string,
  messages: LmStudioMessage[],
): Promise<Response | null> {
  const baseUrl = getLmStudioBaseUrl();
  try {
    const controller = new AbortController();
    // 30s timeout na pierwsze tokeny
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelId,
        messages,
        stream: true,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(`[lm-studio] ${res.status}: ${body.slice(0, 200)}`);
      return null;
    }

    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Jeśli LM Studio nie działa — cicha porażka, fallback do OpenRouter
    if (msg.includes("fetch") || msg.includes("connect") || msg.includes("abort")) {
      console.warn(`[lm-studio] niedostępne: ${msg}`);
      return null;
    }
    console.error(`[lm-studio] błąd:`, err);
    return null;
  }
}
