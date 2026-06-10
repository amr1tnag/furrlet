export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { decode } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  let email: string | null | undefined = null

  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) {
    const raw = auth.slice(7)
    const decoded = await decode({ token: raw, secret: process.env.NEXTAUTH_SECRET! })
    email = decoded?.email as string | undefined
  } else {
    const session = await getServerSession()
    email = session?.user?.email
  }

  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, isVerified: true },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}
