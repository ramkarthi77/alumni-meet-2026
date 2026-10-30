import { describe, it, expect } from 'vitest'
import { rateLimit } from '@/lib/rateLimit'

describe('rateLimit', () => {
  it('allows up to max requests', () => {
    const key = `test:${Math.random()}`
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, { max: 5, windowMs: 60_000 })).toBe(true)
    }
  })

  it('blocks requests exceeding max', () => {
    const key = `test:${Math.random()}`
    for (let i = 0; i < 5; i++) rateLimit(key, { max: 5, windowMs: 60_000 })
    expect(rateLimit(key, { max: 5, windowMs: 60_000 })).toBe(false)
  })

  it('resets after window expires', async () => {
    const key = `test:${Math.random()}`
    rateLimit(key, { max: 1, windowMs: 10 })
    // Wait for window to expire
    await new Promise(r => setTimeout(r, 20))
    expect(rateLimit(key, { max: 1, windowMs: 10 })).toBe(true)
  })
})
