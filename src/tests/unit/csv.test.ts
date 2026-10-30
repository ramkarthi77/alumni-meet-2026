/**
 * Tests for CSV formula injection prevention.
 * We reproduce the same cell-escaping logic used in /api/export/route.ts.
 */
import { describe, it, expect } from 'vitest'

function csvCell(value: string | number | Date | null | undefined): string {
  const s = value === null || value === undefined ? '' : String(value)
  const sanitized = s.replace(/^[=+\-@\t\r]/, "'$&")
  if (/[",\n\r]/.test(sanitized)) {
    return `"${sanitized.replace(/"/g, '""')}"`
  }
  return sanitized
}

describe('csvCell', () => {
  it('leaves plain text alone', () => {
    expect(csvCell('Arun Kumar')).toBe('Arun Kumar')
  })

  it('wraps cells containing commas in quotes', () => {
    expect(csvCell('Smith, John')).toBe('"Smith, John"')
  })

  it('escapes double quotes inside cells', () => {
    expect(csvCell('He said "hello"')).toBe('"He said ""hello"""')
  })

  it('prepends apostrophe to formula injection attempts starting with =', () => {
    expect(csvCell('=1+1')).toBe("'=1+1")
  })

  it('prepends apostrophe to cells starting with +', () => {
    expect(csvCell('+123')).toBe("'+123")
  })

  it('prepends apostrophe to cells starting with -', () => {
    expect(csvCell('-1')).toBe("'-1")
  })

  it('prepends apostrophe to cells starting with @', () => {
    expect(csvCell('@foo')).toBe("'@foo")
  })

  it('returns empty string for null', () => {
    expect(csvCell(null)).toBe('')
  })

  it('handles numbers', () => {
    expect(csvCell(1000)).toBe('1000')
  })
})
