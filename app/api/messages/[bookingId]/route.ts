import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { sendPushToUser } from '@/lib/push'

async function getAuthorizedBooking(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) return null
  if (booking.ownerId !== userId && booking.walkerId !== userId) return null
  return booking
}

async function getSessionUser() {
  const session = await getServerSession()
  if (!session?.user?.email) return null
  return prisma.user.findUnique({ where: { email: session.user.email } })
}

export async function GET(_req: NextRequest, { params }: { params: { bookingId: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = user.id
  const booking = await getAuthorizedBooking(params.bookingId, userId)
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const messages = await prisma.message.findMany({
    where: { bookingId: params.bookingId },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(messages)
}

export async function POST(req: NextRequest, { params }: { params: { bookingId: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = user.id
  const booking = await getAuthorizedBooking(params.bookingId, userId)
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { body } = await req.json()
  if (!body?.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 })

  const message = await prisma.message.create({
    data: { bookingId: params.bookingId, senderId: userId, body: body.trim() },
    include: { sender: { select: { id: true, name: true } } },
  })

  // Push to the other participant
  const recipientId = booking.ownerId === userId ? booking.walkerId : booking.ownerId
  try {
    await sendPushToUser(recipientId, {
      title: `New message from ${user.name}`,
      body: body.trim().length > 80 ? body.trim().slice(0, 80) + '…' : body.trim(),
      url: `/messages/${params.bookingId}`,
    })
  } catch (_) {}

  return NextResponse.json(message)
}
