export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionEmail } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendBookingRequestEmail } from '@/lib/email'
import { sendPushToUser } from '@/lib/push'

export async function GET(req: NextRequest) {
  const email = await getSessionEmail(req)
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json([], { status: 200 })
  const bookings = user.role === 'OWNER'
    ? await prisma.booking.findMany({ where: { ownerId: user.id }, include: { dog: true, walker: { select: { id: true, name: true } }, review: true, messages: { include: { sender: { select: { id: true } } }, orderBy: { createdAt: 'asc' } } }, orderBy: { createdAt: 'desc' } })
    : await prisma.booking.findMany({ where: { walkerId: user.id }, include: { dog: true, owner: { select: { id: true, name: true } }, review: true, messages: { include: { sender: { select: { id: true } } }, orderBy: { createdAt: 'asc' } } }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(bookings)
}

export async function POST(req: NextRequest) {
  const email = await getSessionEmail(req)
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.role !== 'OWNER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { walkerId, dogId, date, duration, address } = await req.json()
  const walkerProfile = await prisma.walkerProfile.findFirst({ where: { userId: walkerId } })
  if (!walkerProfile) return NextResponse.json({ error: 'Walker not found' }, { status: 404 })
  const dur = parseInt(duration)
  const totalPrice = dur === 30 ? 99 : dur === 45 ? 149 : 199
  const booking = await prisma.booking.create({
    data: { walkerId, dogId, ownerId: user.id, date, duration: dur, totalPrice, address: address || '' },
    include: { dog: true, walker: { select: { name: true, email: true } } },
  })
  try {
    await sendBookingRequestEmail({
      walkerEmail: booking.walker.email,
      walkerName: booking.walker.name,
      ownerName: user.name,
      dogName: booking.dog.name,
      date,
      duration: dur,
      totalPrice,
      address: address || '',
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
