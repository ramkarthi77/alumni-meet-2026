/**
 * GET /api/cron/daily-summary
 * Called automatically every day at 8 PM IST by Vercel Cron (see vercel.json).
 * Sends a daily registration summary email to the organizer.
 * Protected by CRON_SECRET so only Vercel can trigger it.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendDailySummaryEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get overall stats
    const [members, todayMembers] = await Promise.all([
      prisma.member.findMany({
        select: {
          numberOfAdults: true,
          numberOfKids: true,
          contributionAmount: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
      prisma.member.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ])

    const totalAdults = members.reduce((s, m) => s + m.numberOfAdults, 0)
    const totalKids = members.reduce((s, m) => s + m.numberOfKids, 0)
    const totalAmount = members.reduce((s, m) => s + parseFloat(m.contributionAmount.toString()), 0)
    const paidCount = members.filter(m => m.paymentStatus === 'COMPLETED').length
    const pendingCount = members.filter(m => m.paymentStatus !== 'COMPLETED').length

    await sendDailySummaryEmail({
      totalMembers: members.length,
      totalAdults,
      totalKids,
      totalAmount,
      newToday: todayMembers,
      paidCount,
      pendingCount,
    })

    return NextResponse.json({ ok: true, totalMembers: members.length, newToday: todayMembers })
  } catch (err) {
    console.error('[cron/daily-summary]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
