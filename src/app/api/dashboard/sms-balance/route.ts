/**
 * GET /api/dashboard/sms-balance
 * Returns current Fast2SMS wallet balance.
 * Called from the organizer dashboard to show a low-balance warning.
 * Protected — requires organizer session.
 */
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const apiKey = process.env.FAST2SMS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ balance: null, error: 'API key not configured' })
  }

  try {
    const res = await fetch('https://www.fast2sms.com/dev/wallet', {
      headers: { authorization: apiKey },
      next: { revalidate: 300 }, // cache 5 minutes
    })

    if (!res.ok) {
      return NextResponse.json({ balance: null, error: 'Failed to fetch balance' })
    }

    const data = await res.json()
    // Fast2SMS returns { return: true, wallet: "31.0000" }
    const balance = parseFloat(data?.wallet ?? '0')
    return NextResponse.json({ balance, low: balance < 20 })
  } catch (err) {
    console.error('[sms-balance]', err)
    return NextResponse.json({ balance: null, error: 'Network error' })
  }
}
