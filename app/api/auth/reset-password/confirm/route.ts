export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { token, password } = await req.json()
  if (!token || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpiry: { gt: new Date() },
    },
  })

  if (!user) return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })

  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, passwordResetToken: null, passwordResetExpiry: null },
  })

  return NextResponse.json({ success: true })
}
