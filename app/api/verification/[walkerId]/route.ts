export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionEmail } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = 'amritnag2005@gmail.com'

export async function PATCH(req: NextRequest, { params }: { params: { walkerId: string } }) {
  const email = await getSessionEmail(req)
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (email !== ADMIN_EMAIL) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { action } = await req.json()
  const verified = action === 'approve'
  const verificationStatus = verified ? 'VERIFIED' : 'REJECTED'

  const profile = await prisma.walkerProfile.update({
    where: { userId: params.walkerId },
    data: { verified, verificationStatus },
    include: { user: { select: { name: true, email: true } } },
  })

  return NextResponse.json(profile)
}
