import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendSmsOTP(phone: string, otp: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.FAST2SMS_API_KEY

  // ── Dev mode: no API key → just log ───────────────────────────────────────
  if (!apiKey) {
    console.log(`\n🔑 [DEV OTP] Phone: ${phone} → OTP: ${otp}\n`)
    return { ok: true }
  }

  // Fast2SMS expects the local number (strip country code)
  // e.g. +919876543210 → 9876543210
  const localNumber = phone.replace(/^\+91/, '').replace(/\D/g, '')

  const message = `Your DVC Alumni Meet 2026 OTP is ${otp}. Valid for 10 minutes. Do not share.`

  try {
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
      body: JSON.stringify({
        route: 'q',          // Quick SMS — no DLT template needed
        message,
        language: 'english',
        flash: 0,
        numbers: localNumber,
      }),
    })
    const data = await res.json()
    if (!data.return) {
      console.error('[Fast2SMS Error]', data)
      return { ok: false, error: 'SMS delivery failed. Please try again.' }
    }
    return { ok: true }
  } catch (e) {
    console.error('[Fast2SMS fetch error]', e)
    return { ok: false, error: 'Network error sending OTP.' }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json() as { phoneNumber?: string }

    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.length < 8) {
      return NextResponse.json({ error: 'Valid phone number required.' }, { status: 400 })
    }

    // Block if already registered
    const existing = await prisma.member.findUnique({ where: { phoneNumber } })
    if (existing) {
      return NextResponse.json(
        { error: 'இந்த எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது · Phone already registered.' },
        { status: 409 }
      )
    }

    // Rate-limit: 1 send per 60 seconds
    const prev = await prisma.otpVerification.findUnique({ where: { phoneNumber } })
    if (prev && prev.createdAt > new Date(Date.now() - 60_000)) {
      return NextResponse.json(
        { error: 'Please wait 60 seconds before requesting a new OTP.' },
        { status: 429 }
      )
    }

    const otp       = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.otpVerification.upsert({
      where:  { phoneNumber },
      create: { phoneNumber, otp, expiresAt, verified: false, attempts: 0 },
      update: { otp, expiresAt, verified: false, attempts: 0, createdAt: new Date() },
    })

    const result = await sendSmsOTP(phoneNumber, otp)
    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? 'Failed to send OTP.' }, { status: 500 })
    }

    const isDev = !process.env.FAST2SMS_API_KEY
    return NextResponse.json({
      success: true,
      message: 'OTP sent via SMS',
      ...(isDev && { devOtp: otp }), // shown on screen in dev mode only
    })
  } catch (err) {
    console.error('[OTP send error]', err)
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 })
  }
}
