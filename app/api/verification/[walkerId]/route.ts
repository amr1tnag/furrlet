export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = 'amritnag2005@gmail.com'

// Admin approves or rejects
export async function PATCH(req: Request, { params }: { params: { walkerId: string } }) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.email !== ADMIN_EMAIL) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { action } = await req.json() // "approve" | "reject"
  const verified = action === 'approve'
  const verificationStatus = verified ? 'VERIFIED' : 'REJECTED'

  const profile = await prisma.walkerProfile.update({
    where: { userId: params.walkerId },
    data: { verified, verificationStatus },
    include: { user: { select: { name: true, email: true } } },
  })

  return NextResponse.json(profile)
}
