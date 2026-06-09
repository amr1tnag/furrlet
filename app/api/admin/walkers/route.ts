export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = 'amritnag2005@gmail.com'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.email !== ADMIN_EMAIL) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const walkers = await prisma.walkerProfile.findMany({
    include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
    orderBy: { verificationStatus: 'asc' },
  })

  return NextResponse.json(walkers)
}
