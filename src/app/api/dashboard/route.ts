import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/session'

export async function GET() {
  const { session, response } = await requireAuth()
  if (!session) return response!

  const [agg, total] = await Promise.all([
    prisma.member.aggregate({
      _sum: { contributionAmount: true, numberOfAdults: true, numberOfKids: true },
    }),
    prisma.member.count(),
  ])

  return NextResponse.json({
    totalMembers: total,
    totalAmount:  Number(agg._sum.contributionAmount ?? 0),
    totalAdults:  Number(agg._sum.numberOfAdults    ?? 0),
    totalKids:    Number(agg._sum.numberOfKids      ?? 0),
  })
}
