'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const statusStyles: Record<string, string> = {
  PENDING:   'bg-yellow-50 text-yellow-600 border border-yellow-100',
  ACCEPTED:  'bg-green-50 text-green-600 border border-green-100',
  COMPLETED: 'bg-blue-50 text-blue-600 border border-blue-100',
  DECLINED:  'bg-red-50 text-red-600 border border-red-100',
  CANCELLED: 'bg-gray-100 text-gray-500 border border-gray-200',
}

const statusLabel: Record<string, string> = {
  PENDING: 'Pending', ACCEPTED: 'Confirmed', COMPLETED: 'Completed',
  DECLINED: 'Declined', CANCELLED: 'Cancelled',
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const role = (session?.user as any)?.role
  const [bookings, setBookings] = useState<any[]>([])
  const [dogs, setDogs] = useState<any[]>([])
  const [walkers, setWalkers] = useState<any[]>([])

  useEffect(() => { if (status === 'unauthenticated') router.push('/auth/signin') }, [status, router])

  useEffect(() => {
    if (!session) return
    fetch('/api/bookings').then(r => r.json()).then(d => setBookings(Array.isArray(d) ? d : []))
    if (role === 'OWNER') {
      fetch('/api/dogs').then(r => r.json()).then(d => setDogs(Array.isArray(d) ? d : []))
      fetch('/api/walkers').then(r => r.json()).then(d => setWalkers(Array.isArray(d) ? d : []))
    }
  }, [session, role])

  if (status === 'loading') return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = session?.user?.name?.split(' ')[0] ?? ''

  const upcoming = bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'PENDING')
  const completed = bookings.filter(b => b.status === 'COMPLETED')
  const pending = bookings.filter(b => b.status === 'PENDING').length
  const totalEarnings = completed.reduce((s: number, b: any) => s + b.totalPrice, 0)

  const recentWalkers = completed
    .filter((b: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.walker?.id === b.walker?.id) === i)
    .slice(0, 3)

  const featuredWalkers = walkers.filter(w => w.verified).slice(0, 3).length
    ? walkers.filter(w => w.verified).slice(0, 3)
    : walkers.slice(0, 3)

  return (
    <div className="max-w-2xl mx-auto px-4 pb-8 pt-6">

      {/* Top greeting bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-400 text-sm">{greeting} 👋</p>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{firstName}</h1>
        </div>
        <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-amber-200">
          {session?.user?.name?.[0]?.toUpperCase()}
        </div>
      </div>

      {/* Hero action card */}
      {role === 'OWNER' ? (
        <Link href="/walkers" className="block mb-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 shadow-lg shadow-amber-200">
            <div className="relative z-10">
              <p className="text-amber-100 text-sm font-medium mb-1">Ready for a walk?</p>
              <h2 className="text-white text-xl font-black mb-3">Find a Walker Nearby</h2>
              <div className="inline-flex items-center gap-2 bg-white text-amber-600 font-bold text-sm px-4 py-2 rounded-xl shadow-sm">
                <span>Browse Walkers</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="absolute right-4 bottom-0 text-7xl opacity-20 select-none">🐾</div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          </div>
        </Link>
      ) : (
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 shadow-lg shadow-amber-200 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-amber-100 text-sm font-medium mb-1">Your earnings</p>
            <h2 className="text-white text-3xl font-black">₹{totalEarnings.toFixed(0)}</h2>
            <p className="text-amber-200 text-sm mt-1">{completed.length} walks completed</p>
            <div className="flex gap-3 mt-4">
              <Link href="/bookings" className="inline-flex items-center gap-1.5 bg-white text-amber-600 font-bold text-sm px-4 py-2 rounded-xl shadow-sm">
                View Bookings →
              </Link>
              {pending > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-white/20 text-white font-semibold text-sm px-3 py-2 rounded-xl">
                  {pending} pending
                </div>
              )}
            </div>
          </div>
          <div className="absolute right-4 bottom-0 text-7xl opacity-20 select-none">💰</div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
      )}

      {/* Quick action pills */}
      {role === 'OWNER' ? (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: '🔍', label: 'Find', href: '/walkers' },
            { icon: '📅', label: 'Bookings', href: '/bookings' },
            { icon: '🐕', label: 'My Dogs', href: '/profile/dogs' },
            { icon: '💬', label: 'Messages', href: '/messages' },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className="flex flex-col items-center gap-1.5 bg-white border border-gray-100 rounded-2xl py-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-amber-100 transition-all duration-200">
              <span className="text-xl">{a.icon}</span>
              <span className="text-xs font-semibold text-gray-600">{a.label}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: '📅', label: 'Bookings', href: '/bookings' },
            { icon: '💬', label: 'Messages', href: '/messages' },
            { icon: '✏️', label: 'Profile', href: '/profile/walker' },
            { icon: '🐕', label: 'Dogs', href: '/dogs' },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className="flex flex-col items-center gap-1.5 bg-white border border-gray-100 rounded-2xl py-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-amber-100 transition-all duration-200">
              <span className="text-xl">{a.icon}</span>
              <span className="text-xs font-semibold text-gray-600">{a.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Upcoming bookings */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Upcoming</h2>
          <Link href="/bookings" className="text-xs text-amber-500 font-semibold hover:text-amber-700 transition-colors">View all →</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-2">📅</div>
            <p className="text-gray-600 font-semibold text-sm">No upcoming walks</p>
            <p className="text-gray-400 text-xs mt-1 mb-4">
              {role === 'OWNER' ? 'Book your first walk in seconds' : 'Accept a booking request to get started'}
            </p>
            {role === 'OWNER' && (
              <Link href="/walkers" className="btn-primary text-sm py-2 px-4 inline-block">Find a walker</Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.slice(0, 3).map((b: any) => (
              <Link key={b.id} href="/bookings"
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-amber-100 hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-11 h-11 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  🐶
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm truncate">{b.dog.name}</div>
                  <div className="text-gray-400 text-xs mt-0.5">
                    {b.date} · {b.duration} min
                    {b.walker && <> · {b.walker.name}</>}
                    {b.owner && <> · {b.owner.name}</>}
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${statusStyles[b.status]}`}>
                  {statusLabel[b.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Book again / Walkers section */}
      {role === 'OWNER' && recentWalkers.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Book Again</h2>
            <Link href="/walkers" className="text-xs text-amber-500 font-semibold hover:text-amber-700">See all →</Link>
          </div>
          <div className="space-y-2">
            {recentWalkers.map((b: any) => (
              <Link key={b.id} href={`/walkers/${b.walker?.id}?dogId=${b.dog?.id}&duration=${b.duration}`}
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-amber-100 transition-all duration-200">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  🦮
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm">{b.walker?.name}</div>
                  <div className="text-gray-400 text-xs">Last walked {b.dog?.name}</div>
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2.5 py-1 rounded-xl">
                  🔁 Rebook
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Nearby / featured walkers for owners */}
      {role === 'OWNER' && featuredWalkers.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Top Walkers</h2>
            <Link href="/walkers" className="text-xs text-amber-500 font-semibold hover:text-amber-700">See all →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {featuredWalkers.map((w: any) => (
              <Link key={w.id} href={`/walkers/${w.user.id}`}
                className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-amber-100 hover:-translate-y-0.5 transition-all duration-200 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center text-2xl">
                  🦮
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-xs truncate w-full">{w.user.name.split(' ')[0]}</div>
                  {w.verified && <div className="text-blue-500 text-[10px] font-bold">✓ Verified</div>}
                  <div className="text-gray-400 text-[10px]">{w.city}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Walker: dogs needing walks */}
      {role === 'WALKER' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Recent Activity</h2>
            <Link href="/bookings" className="text-xs text-amber-500 font-semibold hover:text-amber-700">View all →</Link>
          </div>
          {bookings.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-2">🐾</div>
              <p className="text-gray-600 font-semibold text-sm">No bookings yet</p>
              <p className="text-gray-400 text-xs mt-1 mb-4">Complete your profile to attract more owners</p>
              <Link href="/profile/walker" className="btn-primary text-sm py-2 px-4 inline-block">Edit Profile</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {bookings.slice(0, 4).map((b: any) => (
                <div key={b.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="w-11 h-11 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    🐶
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm">{b.dog.name}
                      <span className="text-gray-400 font-normal"> · {b.owner?.name}</span>
                    </div>
                    <div className="text-gray-400 text-xs">{b.date} · {b.duration} min</div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${statusStyles[b.status]}`}>
                    {statusLabel[b.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
