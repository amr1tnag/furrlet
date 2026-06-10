export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendBookingRequestEmail } from '@/lib/email'

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, walkerId, dogId, date, duration } = await req.json()

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
  }

  // Create booking after verified payment
  const walkerProfile = await prisma.walkerProfile.findFirst({ where: { userId: walkerId } })
  if (!walkerProfile) return NextResponse.json({ error: 'Walker not found' }, { status: 404 })
  const dur = parseInt(duration)
  const totalPrice = dur === 30 ? 99 : dur === 45 ? 149 : 199

  const booking = await prisma.booking.create({
    data: {
      walkerId, dogId, ownerId: user.id, date,
      duration: parseInt(duration), totalPrice,
      paymentId: razorpay_payment_id,
      paymentStatus: 'PAID',
    },
    include: { dog: true, walker: { select: { name: true, email: true } } },
  })

  try {
    await sendBookingRequestEmail({
      walkerEmail: booking.walker.email,
      walkerName: booking.walker.name,
      ownerName: user.name,
      dogName: booking.dog.name,
      date, duration: parseInt(duration), totalPrice,
    })
  } catch (_) {}

  return NextResponse.json(booking)
}
