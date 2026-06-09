export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json([], { status: 200 })
  const bookings = user.role === 'OWNER'
    ? await prisma.booking.findMany({ where: { ownerId: user.id }, include: { dog: true, walker: { select: { id: true, name: true } }, review: true }, orderBy: { createdAt: 'desc' } })
    : await prisma.booking.findMany({ where: { walkerId: user.id }, include: { dog: true, owner: { select: { id: true, name: true } }, review: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(bookings)
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || user.role !== 'OWNER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { walkerId, dogId, date, duration } = await req.json()
  const walkerProfile = await prisma.walkerProfile.findFirst({ where: { userId: walkerId } })
  if (!walkerProfile) return NextResponse.json({ error: 'Walker not found' }, { status: 404 })
  const totalPrice = (walkerProfile.hourlyRate * duration) / 60
  const booking = await prisma.booking.create({
    data: { walkerId, dogId, ownerId: user.id, date, duration: parseInt(duration), totalPrice },
  })
  return NextResponse.json(booking)
}
