export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const walkers = await prisma.walkerProfile.findMany({
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  return NextResponse.json(walkers)
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const { bio, city, availability, photoUrl, upiId } = await req.json()
  const profile = await prisma.walkerProfile.upsert({
    where: { userId: user.id },
    update: { bio, city, availability, ...(photoUrl !== undefined && { photoUrl }), ...(upiId !== undefined && { upiId }) },
    create: { userId: user.id, bio, hourlyRate: 0, city, availability, photoUrl: photoUrl || '', upiId: upiId || '' },
  })
  return NextResponse.json(profile)
}
