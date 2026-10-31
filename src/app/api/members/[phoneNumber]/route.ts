import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateMemberSchema } from '@/lib/validation'
import { requireAuth } from '@/lib/auth/session'
import type { Prisma } from '@prisma/client'

type Params = { params: Promise<{ phoneNumber: string }> }

// ─── GET /api/members/[phoneNumber] ───────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const { session, response } = await requireAuth()
  if (!session) return response!

  const { phoneNumber } = await params

  const member = await prisma.member.findUnique({
    where: { phoneNumber: decodeURIComponent(phoneNumber) },
  })
  if (!member) return NextResponse.json({ error: 'Member not found.' }, { status: 404 })

  return NextResponse.json({
    phoneNumber:         member.phoneNumber,
    name:                member.name,
    classBatch:          member.classBatch,
    group:               member.group,
    numberOfAdults:      member.numberOfAdults,
    numberOfKids:        member.numberOfKids,
    contributionAmount:  member.contributionAmount.toString(),
    paymentStatus:       member.paymentStatus,
    email:               member.email,
    spouseName:          member.spouseName,
    dateOfBirth:         member.dateOfBirth,
    marriageAnniversary: member.marriageAnniversary,
    profession:          member.profession,
    createdAt:           member.createdAt,
    updatedAt:           member.updatedAt,
  })
}

// ─── PATCH /api/members/[phoneNumber] ─────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const { session, response } = await requireAuth()
  if (!session) return response!

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 })
  }

  const parsed = updateMemberSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { phoneNumber } = await params
  const phone = decodeURIComponent(phoneNumber)

  const existing = await prisma.member.findUnique({ where: { phoneNumber: phone } })
  if (!existing) return NextResponse.json({ error: 'Member not found.' }, { status: 404 })

  const d = parsed.data
  const updateData: Record<string, unknown> = {}
  if (d.name                !== undefined) updateData.name               = d.name
  if (d.classBatch          !== undefined) updateData.classBatch         = d.classBatch
  if (d.group               !== undefined) updateData.group              = d.group || null
  if (d.numberOfAdults      !== undefined) updateData.numberOfAdults     = d.numberOfAdults
  if (d.numberOfKids        !== undefined) updateData.numberOfKids       = d.numberOfKids
  if (d.contributionAmount  !== undefined) updateData.contributionAmount = d.contributionAmount
  if (d.paymentStatus       !== undefined) updateData.paymentStatus      = d.paymentStatus
  if (d.email               !== undefined) updateData.email              = d.email || null
  if (d.spouseName          !== undefined) updateData.spouseName         = d.spouseName || null
  if (d.profession          !== undefined) updateData.profession         = d.profession || null
  if (d.dateOfBirth         !== undefined) updateData.dateOfBirth        = d.dateOfBirth ? new Date(d.dateOfBirth) : null
  if (d.marriageAnniversary !== undefined) updateData.marriageAnniversary = d.marriageAnniversary ? new Date(d.marriageAnniversary) : null

  const [updated] = await prisma.$transaction([
    prisma.member.update({ where: { phoneNumber: phone }, data: updateData }),
    prisma.auditLog.create({
      data: {
        organizerId:   session.user.id,
        action:        'UPDATE',
        targetPhone:   phone,
        changesBefore: {
          name:               existing.name,
          classBatch:         existing.classBatch,
          group:              existing.group,
          numberOfAdults:     existing.numberOfAdults,
          numberOfKids:       existing.numberOfKids,
          contributionAmount: existing.contributionAmount.toString(),
        } as Prisma.InputJsonValue,
        changesAfter: updateData as Prisma.InputJsonValue,
      },
    }),
  ])

  return NextResponse.json({
    phoneNumber:         updated.phoneNumber,
    name:                updated.name,
    classBatch:          updated.classBatch,
    group:               updated.group,
    numberOfAdults:      updated.numberOfAdults,
    numberOfKids:        updated.numberOfKids,
    contributionAmount:  updated.contributionAmount.toString(),
    paymentStatus:       updated.paymentStatus,
    email:               updated.email,
    spouseName:          updated.spouseName,
    dateOfBirth:         updated.dateOfBirth,
    marriageAnniversary: updated.marriageAnniversary,
    profession:          updated.profession,
    createdAt:           updated.createdAt,
    updatedAt:           updated.updatedAt,
  })
}

// ─── DELETE /api/members/[phoneNumber] ────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  const { session, response } = await requireAuth()
  if (!session) return response!

  const { phoneNumber } = await params
  const phone = decodeURIComponent(phoneNumber)

  const existing = await prisma.member.findUnique({ where: { phoneNumber: phone } })
  if (!existing) return NextResponse.json({ error: 'Member not found.' }, { status: 404 })

  await prisma.$transaction([
    prisma.member.delete({ where: { phoneNumber: phone } }),
    prisma.auditLog.create({
      data: {
        organizerId:   session.user.id,
        action:        'DELETE',
        targetPhone:   phone,
        changesBefore: {
          name:               existing.name,
          classBatch:         existing.classBatch,
          group:              existing.group,
          numberOfAdults:     existing.numberOfAdults,
          numberOfKids:       existing.numberOfKids,
          contributionAmount: existing.contributionAmount.toString(),
          createdAt:          existing.createdAt.toISOString(),
        } as Prisma.InputJsonValue,
        changesAfter: {} as Prisma.InputJsonValue,
      },
    }),
  ])

  return NextResponse.json({ success: true, deleted: phone }, { status: 200 })
}