export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionEmail } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const email = await getSessionEmail(req)
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json([], { status: 200 })

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ ownerId: user.id }, { walkerId: user.id }],
      messages: { some: {} },
    },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: { select: { name: true } } },
      },
      owner: { select: { id: true, name: true } },
      walker: { select: { id: true, name: true } },
      dog: { select: { name: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(bookings)
}
