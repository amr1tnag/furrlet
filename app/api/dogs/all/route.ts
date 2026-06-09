import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const dogs = await prisma.dog.findMany({
    include: { owner: { select: { id: true, name: true, email: true } } },
  })
  return NextResponse.json(dogs)
}
