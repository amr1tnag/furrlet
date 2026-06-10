export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionEmail } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const email = await getSessionEmail(req)
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json([], { status: 200 })
  const dogs = await prisma.dog.findMany({ where: { ownerId: user.id } })
  return NextResponse.json(dogs)
}

export async function POST(req: NextRequest) {
  const email = await getSessionEmail(req)
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const { name, breed, size, notes } = await req.json()
  const dog = await prisma.dog.create({ data: { ownerId: user.id, name, breed, size, notes: notes || '' } })
  return NextResponse.json(dog)
}
