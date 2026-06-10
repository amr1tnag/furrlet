export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendOtpEmail } from '@/lib/email'
import { sendOtpSms } from '@/lib/sms'

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(req: Request) {
  const { email, method, phone } = await req.json()
  if (!email || !method) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (user.isVerified) return NextResponse.json({ error: 'Already verified' }, { status: 400 })

  const otp = generateOtp()
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex')
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await prisma.user.update({
    where: { email },
    data: { otpHash, otpExpiry, ...(phone ? { phone } : {}) },
  })

  if (method === 'email') {
    await sendOtpEmail({ name: user.name, email, otp })
  } else if (method === 'phone') {
    if (!phone) return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
    await sendOtpSms({ phone, otp })
  } else {
    return NextResponse.json({ error: 'Invalid method' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
