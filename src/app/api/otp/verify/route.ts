import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otp } = await req.json() as { phoneNumber?: string; otp?: string }

    if (!phoneNumber || !otp) {
      return NextResponse.json({ error: 'Phone number and OTP required.' }, { status: 400 })
    }

    const record = await prisma.otpVerification.findUnique({ where: { phoneNumber } })

    if (!record) {
      return NextResponse.json(
        { error: 'OTP not found. Please request a new one.' },
        { status: 400 }
      )
    }

    // Already verified — allow through
    if (record.verified) {
      return NextResponse.json({ success: true })
    }

    if (new Date() > record.expiresAt) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    if (record.attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many wrong attempts. Please request a new OTP.' },
        { status: 429 }
      )
    }

    if (record.otp !== otp) {
      await prisma.otpVerification.update({
        where: { phoneNumber },
        data:  { attempts: { increment: 1 } },
      })
      const remaining = 5 - record.attempts - 1
      return NextResponse.json(
        { error: `Wrong OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` },
        { status: 400 }
      )
    }

    // ✅ Correct — mark verified
    await prisma.otpVerification.update({
      where: { phoneNumber },
      data:  { verified: true },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[OTP verify error]', err)
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 })
  }
}
