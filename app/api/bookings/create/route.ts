export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionEmail } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendBookingRequestEmail } from '@/lib/email'

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
    data: {
      walkerId, dogId, ownerId: user.id, date,
      duration: dur, totalPrice,
      paymentId: 'bypass',
      paymentStatus: 'PAID',
      address: address || '',
    },
    include: { dog: true, walker: { select: { name: true, email: true } } },
  })

  try {
    await sendBookingRequestEmail({
      walkerEmail: booking.walker.email,
      walkerName: booking.walker.name,
      ownerName: user.name,
      dogName: booking.dog.name,
      date, duration: dur, totalPrice,
      address: address || '',
    })
  } catch (_) {}

  return NextResponse.json(booking)
}
