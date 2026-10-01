import type { Thread } from '@/types/chat'

const key = 'iskra.threads.v2'

export function loadThreads(): Thread[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown
    return Array.isArray(value) ? value as Thread[] : []
  } catch {
    return []
  }
}

export function saveThreads(threads: Thread[]) {
  localStorage.setItem(key, JSON.stringify(threads))
}

export function makeId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}
