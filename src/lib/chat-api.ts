import type { Message } from '@/types/chat'

export async function askAssistant(messages: Message[], signal?: AbortSignal): Promise<string> {
  const endpoint = import.meta.env.VITE_CHAT_API_URL as string | undefined
  if (!endpoint) {
    await new Promise((resolve) => window.setTimeout(resolve, 650))
    const last = messages.at(-1)?.content ?? ''
    return `To tryb demonstracyjny. Otrzymałem wiadomość: „${last}”. Skonfiguruj VITE_CHAT_API_URL, aby połączyć Iskrę z własnym API.`
  }
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  })
  if (!response.ok) throw new Error(`Serwer odpowiedział kodem ${response.status}`)
  const data = await response.json() as { message?: string; content?: string }
  return data.message ?? data.content ?? 'Serwer nie zwrócił treści odpowiedzi.'
}
