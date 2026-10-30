import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'

/**
 * Normalise a phone number to E.164 format.
 * Throws if the number is invalid.
 */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) throw new Error('Phone number is required.')

  // Try to parse; default country hint India — users can still prefix +
  const parsed = parsePhoneNumber(trimmed, 'IN')
  if (!parsed || !parsed.isValid()) {
    throw new Error(`Invalid phone number: ${raw}`)
  }
  return parsed.format('E.164')   // e.g. +919876543210
}

export function isValidPhone(raw: string): boolean {
  try {
    return isValidPhoneNumber(raw.trim(), 'IN')
  } catch {
    return false
  }
}

/** Mask all but last 4 digits for display, e.g. +91 XXXXX X4321 */
export function maskPhone(e164: string): string {
  if (e164.length <= 4) return '****'
  return e164.slice(0, 3) + ' ' + '*'.repeat(e164.length - 7) + ' ' + e164.slice(-4)
}
