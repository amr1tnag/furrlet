export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: Request) {
  const { email, otp } = await req.json()
  if (!email || !otp) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (user.isVerified) return NextResponse.json({ success: true })

  if (!user.otpHash || !user.otpExpiry) {
    return NextResponse.json({ error: 'No OTP sent. Please request a new one.' }, { status: 400 })
  }

  if (new Date() > user.otpExpiry) {
    return NextResponse.json({ error: 'OTP expired. Please request a new one.' }, { status: 400 })
  }

  const hash = crypto.createHash('sha256').update(otp).digest('hex')
  if (hash !== user.otpHash) {
    return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 })
  }

  await prisma.user.update({
    where: { email },
    data: { isVerified: true, otpHash: null, otpExpiry: null },
  })

  try { await sendWelcomeEmail({ name: user.name, email, role: user.role }) } catch (_) {}

  return NextResponse.json({ success: true })
}
