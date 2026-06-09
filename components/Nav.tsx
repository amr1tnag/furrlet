'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export function Nav() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-bold text-lg tracking-tight text-gray-900">Furrlet</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            {session ? (
              <>
                {role === 'OWNER' && (
                  <>
                    <Link href="/walkers" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition font-medium">Find Walkers</Link>
                    <Link href="/profile/dogs" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition font-medium">My Dogs</Link>
                  </>
                )}
                {role === 'WALKER' && (
                  <>
                    <Link href="/dogs" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition font-medium">Browse Dogs</Link>
                    <Link href="/profile/walker" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition font-medium">My Profile</Link>
                  </>
                )}
                <Link href="/bookings" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition font-medium">Bookings</Link>
                <Link href="/messages" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition font-medium">Messages</Link>
                <Link href="/dashboard" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition font-medium">Dashboard</Link>
                <div className="ml-2 flex items-center gap-2 pl-2 border-l border-gray-100">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-semibold text-sm">
                    {session.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <button onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-sm text-gray-500 hover:text-gray-800 font-medium transition">
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition">Sign in</Link>
                <Link href="/auth/signup" className="ml-1 btn-primary">Get started</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden pb-4 space-y-1 border-t border-gray-100 pt-3">
            {session ? (
              <>
                {role === 'OWNER' && <Link href="/walkers" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Find Walkers</Link>}
                {role === 'OWNER' && <Link href="/profile/dogs" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>My Dogs</Link>}
                {role === 'WALKER' && <Link href="/dogs" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Browse Dogs</Link>}
                {role === 'WALKER' && <Link href="/profile/walker" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>My Profile</Link>}
                <Link href="/bookings" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Bookings</Link>
                <Link href="/messages" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Messages</Link>
                <Link href="/dashboard" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link href="/auth/signup" className="block px-3 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50 rounded-lg" onClick={() => setMenuOpen(false)}>Get started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
