import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const walker = await prisma.walkerProfile.findFirst({
    where: { userId: params.id },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  if (!walker) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(walker)
}
