/**
 * Client-side Text-to-Speech using the Web Speech API (SpeechSynthesis).
 * Returns a controller object with a stop() method.
 */
export function speakText(text: string, onEnd?: () => void): { stop: () => void } {
  if (!("speechSynthesis" in window)) {
    console.warn("SpeechSynthesis not supported in this browser");
    onEnd?.();
    return { stop: () => {} };
  }

  // Cancel any current speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pl-PL";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);

  return {
    stop: () => {
      window.speechSynthesis.cancel();
      onEnd?.();
    },
  };
}

// Extend window type for cross-browser SpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}

/**
 * Client-side Speech-to-Text using the Web Speech API (SpeechRecognition).
 * Returns a controller with a stop() method and a promise that resolves with the transcript.
 */
export function startSpeechRecognition(lang = "pl-PL"): {
  result: Promise<string>;
  stop: () => void;
} {
  const RecognitionClass =
    (typeof startSpeechRecognition !== "undefined" ? SpeechRecognition : undefined) ??
    window.webkitSpeechRecognition;

  if (!RecognitionClass) {
    return {
      result: Promise.reject(new Error("SpeechRecognition not supported")),
      stop: () => {},
    };
  }

  const recognition = new RecognitionClass();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let resolveResult!: (text: string) => void;
  let rejectResult!: (err: Error) => void;
  let settled = false;

  const result = new Promise<string>((res, rej) => {
    resolveResult = res;
    rejectResult = rej;
  });

  recognition.onresult = (event) => {
    if (settled) return;
    settled = true;
    const transcript = event.results[0]?.[0]?.transcript ?? "";
    resolveResult(transcript);
  };

  recognition.onerror = (event) => {
    if (settled) return;
    settled = true;
    rejectResult(new Error(event.error));
  };

  recognition.onend = () => {
    if (!settled) {
      settled = true;
      resolveResult("");
    }
  };

  recognition.start();

  return {
    result,
    stop: () => recognition.stop(),
  };
}
