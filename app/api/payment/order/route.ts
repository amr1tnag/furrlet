export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || user.role !== 'OWNER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { walkerId, dogId, date, duration } = await req.json()
  const walkerProfile = await prisma.walkerProfile.findFirst({ where: { userId: walkerId } })
  if (!walkerProfile) return NextResponse.json({ error: 'Walker not found' }, { status: 404 })

  const totalPrice = parseInt(duration) === 30 ? 99 : 199
  const amountPaise = Math.round(totalPrice * 100) // Razorpay uses paise

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt: `booking_${Date.now()}`,
    notes: { walkerId, dogId, ownerId: user.id, date, duration: String(duration) },
  })

  return NextResponse.json({
    orderId: order.id,
    amount: amountPaise,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID,
    walkerName: walkerProfile.city,
    totalPrice,
  })
}
