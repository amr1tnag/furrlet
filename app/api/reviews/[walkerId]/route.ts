export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { walkerId: string } }) {
  const reviews = await prisma.review.findMany({
    where: { walkerId: params.walkerId },
    include: { booking: { include: { owner: { select: { name: true } }, dog: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(reviews)
}
