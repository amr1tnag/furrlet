import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { decode } from 'next-auth/jwt'

export async function getSessionEmail(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) {
    const decoded = await decode({ token: auth.slice(7), secret: process.env.NEXTAUTH_SECRET! })
    return (decoded?.email as string) ?? null
  }
  const session = await getServerSession()
  return session?.user?.email ?? null
}
