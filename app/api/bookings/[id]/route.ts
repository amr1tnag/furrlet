export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { sendBookingStatusEmail } from '@/lib/email'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { status } = await req.json()
  const booking = await prisma.booking.update({
    where: { id: params.id },
    data: { status },
    include: {
      dog: true,
      owner: { select: { name: true, email: true } },
      walker: { select: { name: true } },
    },
  })
  if (status === 'ACCEPTED' || status === 'DECLINED') {
    try {
      await sendBookingStatusEmail({
        ownerEmail: booking.owner.email,
        ownerName: booking.owner.name,
        walkerName: booking.walker.name,
        dogName: booking.dog.name,
        date: booking.date,
        status,
      })
    } catch (_) {}
  }
  return NextResponse.json(booking)
}
