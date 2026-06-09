export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { sendBookingStatusEmail, sendRefundEmail } from '@/lib/email'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status } = await req.json()

  // Fetch booking before update to check payment status
  const existing = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      dog: true,
      owner: { select: { name: true, email: true } },
      walker: { select: { name: true } },
    },
  })
  if (!existing) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  // Trigger refund if cancelling a paid booking
  let paymentStatus = existing.paymentStatus
  if (status === 'CANCELLED' && existing.paymentStatus === 'PAID' && existing.paymentId) {
    try {
      await razorpay.payments.refund(existing.paymentId, {
        amount: Math.round(existing.totalPrice * 100),
      })
      paymentStatus = 'REFUNDED'
    } catch (e) {
      console.error('Refund failed:', e)
    }
  }

  const booking = await prisma.booking.update({
    where: { id: params.id },
    data: { status, paymentStatus },
    include: {
      dog: true,
      owner: { select: { name: true, email: true } },
      walker: { select: { name: true } },
    },
  })

  // Send status emails
  if (status === 'ACCEPTED' || status === 'DECLINED') {
    try {
      await sendBookingStatusEmail({
        ownerEmail: booking.owner.email,
        ownerName: booking.owner.name,
        walkerName: booking.walker.name,
        dogName: booking.dog.name,
        date: booking.date,
        status,
      })
    } catch (_) {}
  }

  // Send refund confirmation email
  if (status === 'CANCELLED' && paymentStatus === 'REFUNDED') {
    try {
      await sendRefundEmail({
        ownerEmail: booking.owner.email,
        ownerName: booking.owner.name,
        dogName: booking.dog.name,
        date: booking.date,
        amount: booking.totalPrice,
      })
    } catch (_) {}
  }

  return NextResponse.json({ ...booking, paymentStatus })
}
