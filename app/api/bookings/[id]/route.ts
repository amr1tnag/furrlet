export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionEmail } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendBookingStatusEmail, sendRefundEmail, sendReviewRequestEmail } from '@/lib/email'
import { sendPushToUser } from '@/lib/push'
import Razorpay from 'razorpay'
import crypto from 'crypto'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const email = await getSessionEmail(req)
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      dog: true,
      owner: { select: { id: true, name: true } },
      walker: { select: { id: true, name: true } },
    },
  })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (booking.ownerId !== user.id && booking.walkerId !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json({
    ...booking,
    startOtp: booking.ownerId === user.id ? booking.startOtp : undefined,
    endOtp: booking.walkerId === user.id ? booking.endOtp : undefined,
  })
}

function getRazorpay() {
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const email = await getSessionEmail(req)
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Payment confirmation flow
  if (body.paymentId) {
    const { paymentId, orderId, signature } = body
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')
    if (expectedSig !== signature) return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: { paymentId, paymentStatus: 'PAID' },
    })
    return NextResponse.json(booking)
  }

  const { status } = body

  const existing = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      dog: true,
      owner: { select: { name: true, email: true } },
      walker: { select: { name: true } },
    },
  })
  if (!existing) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  let paymentStatus = existing.paymentStatus
  if (status === 'CANCELLED' && existing.paymentStatus === 'PAID' && existing.paymentId) {
    try {
      await getRazorpay().payments.refund(existing.paymentId, {
        amount: Math.round(existing.totalPrice * 100),
      })
      paymentStatus = 'REFUNDED'
    } catch (e) {
      console.error('Refund failed:', e)
    }
  }

  const otp4 = () => String(Math.floor(1000 + Math.random() * 9000))

  const booking = await prisma.booking.update({
    where: { id: params.id },
    data: {
      status,
      paymentStatus,
      ...(status === 'ACCEPTED' ? { startOtp: otp4() } : {}),
    },
    include: {
      dog: true,
      owner: { select: { name: true, email: true } },
      walker: { select: { name: true } },
    },
  })

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
    try {
      await sendPushToUser(existing.ownerId, {
        title: status === 'ACCEPTED' ? 'Booking Accepted!' : 'Booking Declined',
        body: status === 'ACCEPTED'
          ? `${booking.walker.name} accepted the walk for ${booking.dog.name} on ${booking.date}`
          : `${booking.walker.name} declined the walk for ${booking.dog.name}. Find another walker.`,
        url: '/bookings',
      })
    } catch (_) {}
  }

  if (status === 'COMPLETED') {
    try {
      await sendReviewRequestEmail({
        ownerEmail: booking.owner.email,
        ownerName: booking.owner.name,
        walkerName: booking.walker.name,
        dogName: booking.dog.name,
        date: booking.date,
        bookingId: params.id,
      })
    } catch (_) {}
    try {
      await sendPushToUser(existing.ownerId, {
        title: 'Walk Completed!',
        body: `${booking.dog.name}'s walk is done. Leave a review for ${booking.walker.name}.`,
        url: '/bookings',
      })
    } catch (_) {}
  }

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
