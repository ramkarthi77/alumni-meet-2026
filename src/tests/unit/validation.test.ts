import { describe, it, expect } from 'vitest'
import { registerSchema, updateMemberSchema, memberQuerySchema } from '@/lib/validation'

describe('registerSchema', () => {
  const valid = {
    name: 'Arun Kumar',
    phoneNumber: '+919876543210',
    classBatch: '10th A',
    numberOfAdults: 2,
    numberOfKids: 0,
    contributionAmount: 1000,
  }

  it('accepts valid registration', () => {
    const r = registerSchema.safeParse(valid)
    expect(r.success).toBe(true)
  })

  it('rejects empty name', () => {
    const r = registerSchema.safeParse({ ...valid, name: '' })
    expect(r.success).toBe(false)
  })

  it('rejects whitespace-only name', () => {
    const r = registerSchema.safeParse({ ...valid, name: '   ' })
    expect(r.success).toBe(false)
  })

  it('rejects missing phone', () => {
    const r = registerSchema.safeParse({ ...valid, phoneNumber: '' })
    expect(r.success).toBe(false)
  })

  it('rejects invalid phone', () => {
    const r = registerSchema.safeParse({ ...valid, phoneNumber: 'notaphone' })
    expect(r.success).toBe(false)
  })

  it('rejects zero adults', () => {
    const r = registerSchema.safeParse({ ...valid, numberOfAdults: 0 })
    expect(r.success).toBe(false)
  })

  it('rejects more than 20 adults', () => {
    const r = registerSchema.safeParse({ ...valid, numberOfAdults: 21 })
    expect(r.success).toBe(false)
  })

  it('rejects negative contribution', () => {
    const r = registerSchema.safeParse({ ...valid, contributionAmount: -1 })
    expect(r.success).toBe(false)
  })

  it('accepts zero contribution', () => {
    const r = registerSchema.safeParse({ ...valid, contributionAmount: 0 })
    expect(r.success).toBe(true)
  })

  it('trims name whitespace', () => {
    const r = registerSchema.safeParse({ ...valid, name: '  Arun  ' })
    if (r.success) expect(r.data.name).toBe('Arun')
  })
})

describe('updateMemberSchema', () => {
  it('accepts partial update', () => {
    const r = updateMemberSchema.safeParse({ name: 'New Name' })
    expect(r.success).toBe(true)
  })

  it('rejects negative contribution in update', () => {
    const r = updateMemberSchema.safeParse({ contributionAmount: -5 })
    expect(r.success).toBe(false)
  })
})

describe('memberQuerySchema', () => {
  it('uses defaults when no params', () => {
    const r = memberQuerySchema.safeParse({})
    if (r.success) {
      expect(r.data.page).toBe(1)
      expect(r.data.limit).toBe(20)
      expect(r.data.sortBy).toBe('createdAt')
    }
  })

  it('rejects invalid sortBy', () => {
    const r = memberQuerySchema.safeParse({ sortBy: 'invalidField' })
    expect(r.success).toBe(false)
  })
})
