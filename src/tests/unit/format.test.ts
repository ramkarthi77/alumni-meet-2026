import { describe, it, expect } from 'vitest'
import { formatINR } from '@/lib/format'

describe('formatINR', () => {
  it('formats zero', () => {
    expect(formatINR(0)).toContain('0')
  })

  it('formats positive amount', () => {
    const r = formatINR(1000)
    expect(r).toContain('1,000')
    expect(r).toContain('₹')
  })

  it('handles string input', () => {
    const r = formatINR('2500')
    expect(r).toContain('₹')
  })

  it('handles null gracefully', () => {
    expect(formatINR(null)).toBe('₹0')
  })

  it('handles NaN gracefully', () => {
    expect(formatINR(NaN)).toBe('₹0')
  })
})
