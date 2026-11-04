import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/members/check?phone=+919876543210
// Public endpoint — returns { exists: boolean }
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')?.trim()
  if (!phone) {
    return NextResponse.json({ error: 'phone param required' }, { status: 400 })
  }

  const member = await prisma.member.findUnique({
    where: { phoneNumber: phone },
    select: { phoneNumber: true },
  })

  return NextResponse.json({ exists: !!member })
}
