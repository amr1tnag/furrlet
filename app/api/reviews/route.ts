export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || user.role !== 'OWNER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { bookingId, rating, comment } = await req.json()
  if (!bookingId || !rating) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking || booking.ownerId !== user.id || booking.status !== 'COMPLETED') {
    return NextResponse.json({ error: 'Invalid booking' }, { status: 400 })
  }

  const existing = await prisma.review.findUnique({ where: { bookingId } })
  if (existing) return NextResponse.json({ error: 'Already reviewed' }, { status: 400 })

  const review = await prisma.review.create({
    data: { bookingId, walkerId: booking.walkerId, ownerId: user.id, rating, comment: comment || '' },
  })

  // Update walker's average rating
  const reviews = await prisma.review.findMany({ where: { walkerId: booking.walkerId } })
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  await prisma.walkerProfile.update({
    where: { userId: booking.walkerId },
    data: { rating: Math.round(avg * 10) / 10, reviewCount: reviews.length },
  })

  return NextResponse.json(review)
}
