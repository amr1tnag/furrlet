export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionEmail } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const walkers = await prisma.walkerProfile.findMany({
    where: { isActive: true },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  return NextResponse.json(walkers)
}

export async function POST(req: NextRequest) {
  const email = await getSessionEmail(req)
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const { bio, city, availability, photoUrl, upiId } = await req.json()
  const profile = await prisma.walkerProfile.upsert({
    where: { userId: user.id },
    update: { bio, city, availability, ...(photoUrl !== undefined && { photoUrl }), ...(upiId !== undefined && { upiId }) },
    create: { userId: user.id, bio, hourlyRate: 0, city, availability, photoUrl: photoUrl || '', upiId: upiId || '' },
  })
  return NextResponse.json(profile)
}

export async function PATCH(req: NextRequest) {
  const email = await getSessionEmail(req)
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.role !== 'WALKER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { isActive } = await req.json()
  const profile = await prisma.walkerProfile.update({
    where: { userId: user.id },
    data: { isActive },
  })
  return NextResponse.json(profile)
}
