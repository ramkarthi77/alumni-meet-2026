import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/session'
import { memberQuerySchema } from '@/lib/validation'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MemberWhere = any

/** Escape a CSV cell — prevent formula injection */
function csvCell(value: string | number | Date | null | undefined): string {
  const s = value === null || value === undefined ? '' : String(value)
  // Escape cells that start with formula-trigger characters
  const sanitized = s.replace(/^[=+\-@\t\r]/, "'$&")
  // Wrap in quotes if contains comma, quote, or newline
  if (/[",\n\r]/.test(sanitized)) {
    return `"${sanitized.replace(/"/g, '""')}"`
  }
  return sanitized
}

function buildRow(cols: (string | number | Date | null | undefined)[]): string {
  return cols.map(csvCell).join(',')
}

export async function GET(req: NextRequest) {
  const { session, response } = await requireAuth()
  if (!session) return response!

  const { searchParams } = new URL(req.url)
  const qParsed = memberQuerySchema
    .omit({ page: true, limit: true })
    .safeParse(Object.fromEntries(searchParams))

  if (!qParsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
  }

  const q = qParsed.data
  const where: MemberWhere = {}

  if (q.search) {
    where.OR = [
      { name:        { contains: q.search, mode: 'insensitive' } },
      { phoneNumber: { contains: q.search } },
      { classBatch:  { contains: q.search, mode: 'insensitive' } },
    ]
  }
  if (q.classBatch) where.classBatch = { equals: q.classBatch, mode: 'insensitive' }
  if (q.hasContribution === 'yes') where.contributionAmount = { gt: 0 }
  if (q.hasContribution === 'no')  where.contributionAmount = { equals: 0 }

  const members = await prisma.member.findMany({
    where,
    orderBy: { [q.sortBy]: q.sortDir },
  })

  const header = buildRow([
    'Name', 'Phone Number', 'Class / Batch',
    'Number of Adults', 'Number of Kids', 'Contribution Amount (INR)', 'Registration Date',
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = members.map((m: any) =>
    buildRow([
      m.name,
      m.phoneNumber,
      m.classBatch,
      m.numberOfAdults,
      m.numberOfKids,
      m.contributionAmount.toNumber(),
      m.createdAt.toISOString(),
    ])
  )

  const csv = [header, ...rows].join('\r\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="alumni-meet-2026-${Date.now()}.csv"`,
      'Cache-Control':       'no-store',
    },
  })
}
