import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

async function getUser() {
  const session = await getServerSession()
  if (!session?.user?.email) return null
  return prisma.user.findUnique({ where: { email: session.user.email } })
}

const otp4 = () => String(Math.floor(1000 + Math.random() * 9000))

// POST { type: 'start' | 'end', otp?: string }
// type=start + otp → walker verifies start OTP to begin walk
// type=end         → walker requests end OTP (generated + returned)
// type=end  + otp  → owner verifies end OTP to complete walk
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const booking = await prisma.booking.findUnique({ where: { id: params.id } })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (booking.ownerId !== user.id && booking.walkerId !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { type, otp } = await req.json()

  // ── Walker submits start OTP ─────────────────────────────────────────────
  if (type === 'start' && otp) {
    if (booking.walkerId !== user.id) return NextResponse.json({ error: 'Only the walker can verify the start OTP' }, { status: 403 })
    if (booking.startOtp !== otp) return NextResponse.json({ success: false, error: 'Incorrect OTP' })
    await prisma.booking.update({
      where: { id: params.id },
      data: { walkStartedAt: new Date(), trackingActive: true },
    })
    return NextResponse.json({ success: true })
  }

  // ── Walker generates end OTP ─────────────────────────────────────────────
  if (type === 'end' && !otp) {
    if (booking.walkerId !== user.id) return NextResponse.json({ error: 'Only the walker can generate the end OTP' }, { status: 403 })
    const endOtp = otp4()
    await prisma.booking.update({ where: { id: params.id }, data: { endOtp } })
    return NextResponse.json({ success: true, endOtp })
  }

  // ── Owner verifies end OTP to complete walk ───────────────────────────────
  if (type === 'end' && otp) {
    if (booking.ownerId !== user.id) return NextResponse.json({ error: 'Only the owner can verify the end OTP' }, { status: 403 })
    if (booking.endOtp !== otp) return NextResponse.json({ success: false, error: 'Incorrect OTP' })
    await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'COMPLETED', trackingActive: false, endOtp: null },
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
