import { describe, expect, it, vi } from 'vitest'
import { askAssistant } from '@/lib/chat-api'

describe('chat api', () => {
  it('provides a useful demo response without an endpoint', async () => {
    const result = await askAssistant([{ id: '1', role: 'user', content: 'Cześć', createdAt: 1 }])
    expect(result).toContain('Cześć')
  })
  it('maps a configured endpoint response', async () => {
    vi.stubEnv('VITE_CHAT_API_URL', 'https://example.test/chat')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ content: 'OK' }), { status: 200 })))
    await expect(askAssistant([])).resolves.toBe('OK')
    vi.unstubAllEnvs()
  })
})
