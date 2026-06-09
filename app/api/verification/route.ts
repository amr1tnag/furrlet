export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { sendVerificationRequestEmail } from '@/lib/email'

// Walker submits verification request
export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || user.role !== 'WALKER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { aadhaarNumber } = await req.json()
  if (!aadhaarNumber || aadhaarNumber.replace(/\s/g, '').length !== 12)
    return NextResponse.json({ error: 'Invalid Aadhaar number' }, { status: 400 })

  const profile = await prisma.walkerProfile.update({
    where: { userId: user.id },
    data: { aadhaarNumber: aadhaarNumber.replace(/\s/g, ''), verificationStatus: 'PENDING' },
  })

  try {
    await sendVerificationRequestEmail({ walkerName: user.name, walkerEmail: user.email, aadhaarNumber: aadhaarNumber.replace(/\s/g, '') })
  } catch (_) {}

  return NextResponse.json(profile)
}
