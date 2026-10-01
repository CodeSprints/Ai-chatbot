import { beforeEach, describe, expect, it } from 'vitest'
import { loadThreads, makeId, saveThreads } from '@/lib/storage'

beforeEach(() => localStorage.clear())

describe('storage', () => {
  it('returns an empty list for a new installation', () => {
    expect(loadThreads()).toEqual([])
  })
  it('persists threads as typed data', () => {
    const threads = [{ id: '1', title: 'Test', messages: [], updatedAt: 1 }]
    saveThreads(threads)
    expect(loadThreads()).toEqual(threads)
  })
  it('creates unique ids', () => {
    expect(makeId()).not.toBe(makeId())
  })
})
