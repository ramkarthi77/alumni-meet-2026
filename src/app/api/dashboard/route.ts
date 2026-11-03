import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/session'

export async function GET() {
  const { session, response } = await requireAuth()
  if (!session) return response!

  const [agg, total, paidAgg, paidCount, pendingAgg, pendingCount] = await Promise.all([
    prisma.member.aggregate({
      _sum: { contributionAmount: true, numberOfAdults: true, numberOfKids: true },
      _count: { phoneNumber: true },
    }),
    prisma.member.count(),
    prisma.member.aggregate({
      where: { paymentStatus: 'COMPLETED' },
      _sum: { contributionAmount: true },
    }),
    prisma.member.count({ where: { paymentStatus: 'COMPLETED' } }),
    prisma.member.aggregate({
      where: { paymentStatus: { not: 'COMPLETED' } },
      _sum: { contributionAmount: true },
    }),
    prisma.member.count({ where: { paymentStatus: { not: 'COMPLETED' } } }),
  ])

  return NextResponse.json({
    totalMembers:   total,
    totalAmount:    Number(agg._sum.contributionAmount  ?? 0),
    totalAdults:    Number(agg._sum.numberOfAdults      ?? 0),
    totalKids:      Number(agg._sum.numberOfKids        ?? 0),
    paidCount,
    paidAmount:     Number(paidAgg._sum.contributionAmount    ?? 0),
    pendingCount,
    pendingAmount:  Number(pendingAgg._sum.contributionAmount ?? 0),
  })
}
