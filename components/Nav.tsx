'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { usePushNotifications } from '@/hooks/usePushNotifications'

export function Nav() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const pathname = usePathname()
  const { permission, subscribed, subscribe } = usePushNotifications()

  // Hide nav on landing + auth pages — they have their own headers
  if (pathname === '/' || pathname.startsWith('/auth')) return null

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-black text-lg tracking-tight text-gray-900">Furrlet</span>
          </Link>

          {/* Desktop nav links */}
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

                {/* Bell */}
                {permission !== 'denied' && !subscribed && (
                  <button onClick={subscribe} title="Enable notifications"
                    className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition relative">
                    <BellIcon />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
                  </button>
                )}
                {subscribed && (
                  <div title="Notifications enabled" className="p-2 text-green-500"><BellIcon /></div>
                )}

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

          {/* Mobile right side — bell + avatar/signout */}
          <div className="sm:hidden flex items-center gap-2">
            {session ? (
              <>
                {permission !== 'denied' && !subscribed && (
                  <button onClick={subscribe} className="p-2 rounded-lg text-gray-400 hover:text-amber-500 relative">
                    <BellIcon />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
                  </button>
                )}
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm">
                  {session.user?.name?.[0]?.toUpperCase()}
                </div>
                <button onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-xs text-gray-400 font-medium">
                  Out
                </button>
              </>
            ) : (
              <Link href="/auth/signin" className="btn-primary text-sm py-2 px-4">Sign in</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}
