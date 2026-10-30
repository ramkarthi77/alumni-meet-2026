import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/session'
import { Decimal } from '@prisma/client/runtime/library'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MemberWhere = any

const CONTRIBUTION_BRACKETS = [
  { label: '₹0',            min: 0,    max: 0      },
  { label: '₹1–₹499',       min: 1,    max: 499    },
  { label: '₹500–₹999',     min: 500,  max: 999    },
  { label: '₹1,000–₹1,999', min: 1000, max: 1999   },
  { label: '₹2,000+',       min: 2000, max: null    },
]

export async function GET() {
  const { session, response } = await requireAuth()
  if (!session) return response!

  const [
    totalMembers,
    attendeeSum,
    contributionSum,
    contributorCount,
    zeroContributionCount,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.aggregate({ _sum: { numberOfPeople: true } }),
    prisma.member.aggregate({ _sum: { contributionAmount: true } }),
    prisma.member.count({ where: { contributionAmount: { gt: 0 } } }),
    prisma.member.count({ where: { contributionAmount: { equals: 0 } } }),
  ])

  // Contribution distribution across brackets
  const distribution = await Promise.all(
    CONTRIBUTION_BRACKETS.map(async bracket => {
      const where: MemberWhere =
        bracket.max === null
          ? { contributionAmount: { gte: bracket.min } }
          : bracket.min === 0 && bracket.max === 0
          ? { contributionAmount: { equals: 0 } }
          : { contributionAmount: { gte: bracket.min, lte: bracket.max } }

      const [count, sum] = await Promise.all([
        prisma.member.count({ where }),
        prisma.member.aggregate({ _sum: { contributionAmount: true }, where }),
      ])

      return {
        label:  bracket.label,
        count,
        total:  (sum._sum.contributionAmount ?? new Decimal(0)).toString(),
        percentage:
          totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0,
      }
    })
  )

  // Batch-wise contribution breakdown
  const batchRaw = await prisma.member.groupBy({
    by: ['classBatch'],
    _sum:   { contributionAmount: true, numberOfPeople: true },
    _count: { phoneNumber: true },
    orderBy: { _sum: { contributionAmount: 'desc' } },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const batchStats = batchRaw.map((b: any) => ({
    classBatch:        b.classBatch,
    memberCount:       b._count.phoneNumber,
    totalContribution: (b._sum.contributionAmount ?? new Decimal(0)).toString(),
    totalPeople:       b._sum.numberOfPeople ?? 0,
  }))

  return NextResponse.json({
    totalMembers,
    totalAttendees:       attendeeSum._sum.numberOfPeople       ?? 0,
    totalContributions:   (contributionSum._sum.contributionAmount ?? new Decimal(0)).toString(),
    contributorCount,
    zeroContributionCount,
    distribution,
    batchStats,
  })
}
