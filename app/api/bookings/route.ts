export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { sendBookingRequestEmail } from '@/lib/email'
import { sendPushToUser } from '@/lib/push'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json([], { status: 200 })
  const bookings = user.role === 'OWNER'
    ? await prisma.booking.findMany({ where: { ownerId: user.id }, include: { dog: true, walker: { select: { id: true, name: true } }, review: true, messages: { include: { sender: { select: { id: true } } }, orderBy: { createdAt: 'asc' } } }, orderBy: { createdAt: 'desc' } })
    : await prisma.booking.findMany({ where: { walkerId: user.id }, include: { dog: true, owner: { select: { id: true, name: true } }, review: true, messages: { include: { sender: { select: { id: true } } }, orderBy: { createdAt: 'asc' } } }, orderBy: { createdAt: 'desc' } })
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
  const totalPrice = parseInt(duration) === 30 ? 99 : 199
  const booking = await prisma.booking.create({
    data: { walkerId, dogId, ownerId: user.id, date, duration: parseInt(duration), totalPrice },
    include: { dog: true, walker: { select: { name: true, email: true } } },
  })
  try {
    await sendBookingRequestEmail({
      walkerEmail: booking.walker.email,
      walkerName: booking.walker.name,
      ownerName: user.name,
      dogName: booking.dog.name,
      date,
      duration: parseInt(duration),
      totalPrice,
    })
  } catch (_) {}
  try {
    await sendPushToUser(walkerId, {
      title: 'New Booking Request!',
      body: `${user.name} wants to book a walk for ${booking.dog.name} on ${date}`,
      url: '/bookings',
    })
  } catch (_) {}
  return NextResponse.json(booking)
}
