import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json([], { status: 200 })
  const dogs = await prisma.dog.findMany({ where: { ownerId: user.id } })
  return NextResponse.json(dogs)
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const { name, breed, size, notes } = await req.json()
  const dog = await prisma.dog.create({ data: { ownerId: user.id, name, breed, size, notes: notes || '' } })
  return NextResponse.json(dog)
}
