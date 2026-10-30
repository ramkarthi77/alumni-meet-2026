import { describe, it, expect } from 'vitest'
import { normalizePhone, maskPhone, isValidPhone } from '@/lib/phone'

describe('normalizePhone', () => {
  it('normalizes Indian mobile number with country code', () => {
    expect(normalizePhone('+919876543210')).toBe('+919876543210')
  })

  it('normalizes number with spaces', () => {
    expect(normalizePhone('+91 98765 43210')).toBe('+919876543210')
  })

  it('throws on empty string', () => {
    expect(() => normalizePhone('')).toThrow()
  })

  it('throws on obviously invalid number', () => {
    expect(() => normalizePhone('abc')).toThrow()
  })

  it('handles international number — US', () => {
    const result = normalizePhone('+14155552671')
    expect(result).toBe('+14155552671')
  })
})

describe('maskPhone', () => {
  it('masks all but last 4 digits', () => {
    const masked = maskPhone('+919876543210')
    expect(masked).toContain('3210')
    expect(masked).not.toContain('9876')
  })
})

describe('isValidPhone', () => {
  it('returns true for valid Indian number', () => {
    expect(isValidPhone('+919876543210')).toBe(true)
  })

  it('returns false for invalid number', () => {
    expect(isValidPhone('notaphone')).toBe(false)
  })
})
