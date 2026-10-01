import { createFileRoute } from "@tanstack/react-router";
import {
  getLmStudioModels,
  getLmStudioBaseUrl,
} from "@/lib/lm-studio.server";

/**
 * GET /api/lm-studio-models
 *
 * Zwraca listę modeli załadowanych w LM Studio.
 * Odpowiedź:
 *   { available: true,  models: [{ id, label }], baseUrl }
 *   { available: false, models: [],              baseUrl }
 */
export const Route = createFileRoute("/api/lm-studio-models")({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = getLmStudioBaseUrl();
        const rawModels = await getLmStudioModels();

        if (rawModels.length === 0) {
          return Response.json({ available: false, models: [], baseUrl });
        }

        const models = rawModels.map((m) => ({
          // Prefiks "lm-studio:" żeby frontend odróżnił lokalne od chmury
          id: `lm-studio:${m.id}`,
          label: m.id,
        }));

        return Response.json({ available: true, models, baseUrl });
      },
    },
  },
});
