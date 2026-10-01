import { createFileRoute } from "@tanstack/react-router";

// STT is handled client-side via the Web Speech Recognition API.
// This route is kept as a no-op so any legacy calls get a clear 501 response.
export const Route = createFileRoute("/api/stt")({
  server: {
    handlers: {
      POST: async () => {
        return new Response("STT is handled client-side via SpeechRecognition API", {
          status: 501,
        });
      },
    },
  },
});