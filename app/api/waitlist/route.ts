import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { name, email, city, role, phone } = await req.json()

    if (!name?.trim() || !email?.trim() || !city?.trim() || !role?.trim()) {
      return NextResponse.json({ error: 'Name, email, city and role are required.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const validRoles = ['OWNER', 'WALKER', 'BOTH']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role selection.' }, { status: 400 })
    }

    const entry = await prisma.waitlistEntry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        city: city.trim(),
        role,
        phone: phone?.trim() || null,
      },
    })

    return NextResponse.json({ success: true, id: entry.id }, { status: 201 })
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'This email is already on the waitlist!' }, { status: 409 })
    }
    console.error('[waitlist POST]', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const count = await prisma.waitlistEntry.count()
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
