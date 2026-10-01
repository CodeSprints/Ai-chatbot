import { createFileRoute } from "@tanstack/react-router";

// TTS is handled client-side via the Web Speech API.
// This route is kept as a no-op so existing fetch calls get a clear 501 response.
export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async () => {
        return new Response("TTS is handled client-side via SpeechSynthesis API", {
          status: 501,
        });
      },
    },
  },
});