import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registerSchema, memberQuerySchema } from '@/lib/validation'
import { requireAuth } from '@/lib/auth/session'
import { rateLimit, getClientIP } from '@/lib/rateLimit'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { sendFailedRegistrationAlert } from '@/lib/email'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MemberWhere = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MemberOrderBy = any

// ─── POST /api/members — public registration ──────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = getClientIP(req)
  const max = parseInt(process.env.RATE_LIMIT_REGISTER_MAX ?? '10', 10)
  if (!rateLimit(`register:${ip}`, { max, windowMs: 15 * 60 * 1000 })) {
    return NextResponse.json(
      { error: 'Too many registrations. Please try again later.' },
      { status: 429 }
    )
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const phoneNumber = String(parsed.data.phoneNumber).trim()

  // ── Guard: phone must have passed OTP verification ────────────────────────
  const otpRecord = await prisma.otpVerification.findUnique({ where: { phoneNumber } })
  if (!otpRecord?.verified) {
    return NextResponse.json(
      { error: 'Phone number not verified. Please complete OTP verification first.' },
      { status: 403 }
    )
  }

  try {
    const member = await prisma.member.create({
      data: {
        phoneNumber,
        name:               parsed.data.name,
        classBatch:         parsed.data.classBatch,
        group:              parsed.data.group || null,
        numberOfAdults:     parsed.data.numberOfAdults,
        numberOfKids:       parsed.data.numberOfKids ?? 0,
        contributionAmount: parsed.data.contributionAmount,
        email:              parsed.data.email || null,
        spouseName:         parsed.data.spouseName || null,
        dateOfBirth:        parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
        marriageAnniversary: parsed.data.marriageAnniversary ? new Date(parsed.data.marriageAnniversary) : null,
        profession:         parsed.data.profession || null,
      },
    })

    return NextResponse.json({
      success: true,
      member: {
        phoneNumber:        member.phoneNumber,
        name:               member.name,
        classBatch:         member.classBatch,
        group:              member.group,
        numberOfAdults:     member.numberOfAdults,
        numberOfKids:       member.numberOfKids,
        contributionAmount: member.contributionAmount.toString(),
        createdAt:          member.createdAt,
      },
    }, { status: 201 })
  } catch (e: unknown) {
    if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json(
        { error: 'DUPLICATE_PHONE', message: 'This phone number is already registered.' },
        { status: 409 }
      )
    }
    console.error('[POST /api/members]', e)
    // Send alert email to organizer (non-blocking)
    sendFailedRegistrationAlert({
      name: parsed.data.name,
      phone: phoneNumber,
      error: e instanceof Error ? e.message : String(e),
    }).catch(() => {})
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}

// ─── GET /api/members — organizer: list with search/filter/sort/pagination ────
export async function GET(req: NextRequest) {
  const { session, response } = await requireAuth()
  if (!session) return response!

  const { searchParams } = new URL(req.url)
  const qParsed = memberQuerySchema.safeParse(Object.fromEntries(searchParams))
  if (!qParsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
  }

  const q = qParsed.data
  const skip = (q.page - 1) * q.limit
  const where: MemberWhere = {}

  if (q.search) {
    where.OR = [
      { name:        { contains: q.search, mode: 'insensitive' } },
      { phoneNumber: { contains: q.search } },
      { classBatch:  { contains: q.search, mode: 'insensitive' } },
    ]
  }
  if (q.classBatch) {
    where.classBatch = { equals: q.classBatch, mode: 'insensitive' }
  }
  if (q.hasContribution === 'yes') {
    where.contributionAmount = { gt: 0 }
  } else if (q.hasContribution === 'no') {
    where.contributionAmount = { equals: 0 }
  }
  if (q.paymentStatus) {
    where.paymentStatus = q.paymentStatus
  }
  if (q.minAmount !== undefined || q.maxAmount !== undefined) {
    where.contributionAmount = {
      ...(where.contributionAmount as object),
      ...(q.minAmount !== undefined ? { gte: q.minAmount } : {}),
      ...(q.maxAmount !== undefined ? { lte: q.maxAmount } : {}),
    }
  }

  const orderBy: MemberOrderBy = { [q.sortBy]: q.sortDir }

  const [members, total] = await Promise.all([
    prisma.member.findMany({ where, orderBy, skip, take: q.limit }),
    prisma.member.count({ where }),
  ])

  return NextResponse.json({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    members: members.map((m: any) => ({
      phoneNumber:        m.phoneNumber,
      name:               m.name,
      classBatch:         m.classBatch,
      group:              m.group,
      numberOfAdults:     m.numberOfAdults,
      numberOfKids:       m.numberOfKids,
      contributionAmount: m.contributionAmount.toString(),
      paymentStatus:      m.paymentStatus,
      email:              m.email,
      spouseName:         m.spouseName,
      dateOfBirth:        m.dateOfBirth,
      marriageAnniversary: m.marriageAnniversary,
      profession:         m.profession,
      createdAt:          m.createdAt,
      updatedAt:          m.updatedAt,
    })),
    total,
    page:  q.page,
    limit: q.limit,
    pages: Math.ceil(total / q.limit),
  })
}
