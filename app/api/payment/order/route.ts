export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionEmail } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Razorpay from 'razorpay'

function getRazorpay() {
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! })
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
  const amountPaise = Math.round(totalPrice * 100) // Razorpay uses paise

  let order
  try {
    order = await getRazorpay().orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `booking_${Date.now()}`,
      notes: { walkerId, dogId, ownerId: user.id, date, duration: String(duration), address: address || '' },
    })
  } catch (e: any) {
    console.error('Razorpay order creation error:', JSON.stringify(e))
    return NextResponse.json({ error: 'Payment gateway error', details: e?.error?.description || e?.message || String(e) }, { status: 500 })
  }

  return NextResponse.json({
    orderId: order.id,
    amount: amountPaise,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID,
    walkerName: walkerProfile.city,
    totalPrice,
  })
}
