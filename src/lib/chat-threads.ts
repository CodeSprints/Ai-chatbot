import type { UIMessage } from "ai";
import { useCallback, useEffect, useState } from "react";

export type ChatThread = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: UIMessage[];
};

const STORAGE_KEY = "iskra:chat-threads:v1";

function makeId() {
  return `t_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function createBlankThread(): ChatThread {
  const now = Date.now();
  return {
    id: makeId(),
    title: "Nowa rozmowa",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

function readThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatThread[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeThreads(threads: ChatThread[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch {
    // storage full or unavailable — ignore
  }
}

export function useThreads() {
  const [threads, setThreadsState] = useState<ChatThread[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setThreadsState(readThreads());
    setHydrated(true);
  }, []);

  const setThreads = useCallback(
    (next: ChatThread[] | ((prev: ChatThread[]) => ChatThread[])) => {
      setThreadsState((prev) => {
        const value = typeof next === "function" ? next(prev) : next;
        writeThreads(value);
        return value;
      });
    },
    [],
  );

  const createThread = useCallback((): ChatThread => {
    const t = createBlankThread();
    setThreads((prev) => [t, ...prev]);
    return t;
  }, [setThreads]);

  const deleteThread = useCallback(
    (id: string) => {
      setThreads((prev) => prev.filter((t) => t.id !== id));
    },
    [setThreads],
  );

  const updateThread = useCallback(
    (id: string, patch: Partial<ChatThread>) => {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t,
        ),
      );
    },
    [setThreads],
  );

  const renameThread = useCallback(
    (id: string, title: string) => {
      updateThread(id, { title: title.trim().slice(0, 80) || "Rozmowa" });
    },
    [updateThread],
  );

  const saveMessages = useCallback(
    (id: string, messages: UIMessage[]) => {
      setThreads((prev) => {
        const existing = prev.find((t) => t.id === id);
        if (!existing) return prev;
        let title = existing.title;
        if ((title === "Nowa rozmowa" || !title) && messages.length > 0) {
          const firstUser = messages.find((m) => m.role === "user");
          if (firstUser) {
            const txt = firstUser.parts
              .filter((p) => p.type === "text")
              .map((p) => (p as { text: string }).text)
              .join(" ")
              .trim();
            if (txt) title = txt.slice(0, 60);
          }
        }
        return prev.map((t) =>
          t.id === id
            ? { ...t, messages, title, updatedAt: Date.now() }
            : t,
        );
      });
    },
    [setThreads],
  );

  return {
    threads,
    hydrated,
    createThread,
    deleteThread,
    renameThread,
    saveMessages,
  };
}