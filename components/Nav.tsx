'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export function Nav() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-amber-500">
          🐾 Furrlet
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {session ? (
            <>
              {role === 'OWNER' && <Link href="/walkers" className="text-gray-600 hover:text-amber-500">Find Walkers</Link>}
              {role === 'OWNER' && <Link href="/profile/dogs" className="text-gray-600 hover:text-amber-500">My Dogs</Link>}
              {role === 'WALKER' && <Link href="/dogs" className="text-gray-600 hover:text-amber-500">Browse Dogs</Link>}
              {role === 'WALKER' && <Link href="/profile/walker" className="text-gray-600 hover:text-amber-500">My Profile</Link>}
              <Link href="/bookings" className="text-gray-600 hover:text-amber-500">Bookings</Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-amber-500">Dashboard</Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="text-gray-600 hover:text-amber-500">Sign In</Link>
              <Link href="/auth/signup" className="bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
