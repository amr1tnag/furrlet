import { NextRequest, NextResponse } from 'next/server'
import { getSessionEmail } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const email = await getSessionEmail(req)
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const booking = await prisma.booking.findUnique({ where: { id: params.id } })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (booking.ownerId !== user.id && booking.walkerId !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json({
    trackingActive: booking.trackingActive,
    walkStartedAt: booking.walkStartedAt,
    lat: booking.lat,
    lng: booking.lng,
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const email = await getSessionEmail(req)
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const booking = await prisma.booking.findUnique({ where: { id: params.id } })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (booking.walkerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { lat, lng, active } = await req.json()

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: {
      lat: active ? lat : null,
      lng: active ? lng : null,
      trackingActive: active ?? true,
      ...(active && !booking.walkStartedAt ? { walkStartedAt: new Date() } : {}),
    },
  })

  return NextResponse.json({
    ok: true,
    trackingActive: updated.trackingActive,
    walkStartedAt: updated.walkStartedAt,
  })
}
