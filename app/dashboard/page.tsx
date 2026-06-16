'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const statusStyles: Record<string, string> = {
  PENDING:   'bg-yellow-50 text-yellow-600',
  ACCEPTED:  'bg-green-50 text-green-600',
  COMPLETED: 'bg-gray-100 text-gray-500',
  DECLINED:  'bg-red-50 text-red-600',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

const statusLabel: Record<string, string> = {
  PENDING: 'Pending', ACCEPTED: 'Confirmed', COMPLETED: 'Completed',
  DECLINED: 'Declined', CANCELLED: 'Cancelled',
}

const avatarColors = [
  { bg: '#FDE8C8', text: '#C4680A' },
  { bg: '#D6EAF8', text: '#1A6A9A' },
  { bg: '#E8D5F5', text: '#6B2FA0' },
]

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
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#FAF5EE' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E8960A', borderTopColor: 'transparent' }} />
    </div>
  )

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = session?.user?.name?.split(' ')[0] ?? ''
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const upcoming = bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'PENDING')
  const completed = bookings.filter(b => b.status === 'COMPLETED')
  const pending = bookings.filter(b => b.status === 'PENDING').length
  const totalEarnings = completed.reduce((s: number, b: any) => s + b.totalPrice, 0)
  const monthlyGoal = 10000
  const progressPct = Math.min((totalEarnings / monthlyGoal) * 100, 100)

  const recentWalkers = completed
    .filter((b: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.walker?.id === b.walker?.id) === i)
    .slice(0, 3)

  const featuredWalkers = walkers.filter(w => w.verified).slice(0, 3).length
    ? walkers.filter(w => w.verified).slice(0, 3)
    : walkers.slice(0, 3)

  const getInitials = (name: string) => {
    if (!name) return '?'
    const parts = name.split(' ')
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0]
  }

  return (
    <div style={{ backgroundColor: '#FAF5EE', minHeight: '100vh' }} className="pb-28">
      {/* Greeting header */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: '#9B7B4F' }}>{today}</p>
          <h1 className="text-2xl font-black mt-0.5" style={{ color: '#3D2800' }}>
            {greeting}, {firstName}! 👋
          </h1>
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md"
          style={{ background: 'linear-gradient(135deg, #E8960A, #F59E0B)' }}>
          {session?.user?.name?.[0]?.toUpperCase()}
        </div>
      </div>

      {/* Earnings card (walker) or CTA card (owner) */}
      {role === 'WALKER' ? (
        <div className="mx-4 mb-5 rounded-2xl p-5 relative overflow-hidden shadow-lg"
          style={{ background: 'linear-gradient(135deg, #E8960A 0%, #F59E0B 100%)' }}>
          <div className="relative z-10">
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Total Earnings</p>
            <h2 className="text-3xl font-black text-white mt-1">₹{totalEarnings.toFixed(0)}</h2>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>{completed.length} walks completed</p>

            {/* Progress bar toward monthly goal */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <span>Monthly goal</span>
                <span>₹{totalEarnings.toFixed(0)} / ₹{monthlyGoal.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                <div className="h-2 rounded-full bg-white transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Link href="/bookings" className="inline-flex items-center gap-1.5 bg-white font-bold text-sm px-4 py-2 rounded-xl shadow-sm"
                style={{ color: '#E8960A' }}>
                View Bookings →
              </Link>
              {pending > 0 && (
                <div className="inline-flex items-center gap-1.5 font-semibold text-sm px-3 py-2 rounded-xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  {pending} pending
                </div>
              )}
            </div>
          </div>
          <div className="absolute right-4 bottom-0 text-7xl opacity-20 select-none">💰</div>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </div>
      ) : (
        <Link href="/walkers" className="block mx-4 mb-5">
          <div className="rounded-2xl p-5 relative overflow-hidden shadow-lg"
            style={{ background: 'linear-gradient(135deg, #E8960A 0%, #F59E0B 100%)' }}>
            <div className="relative z-10">
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Ready for a walk?</p>
              <h2 className="text-xl font-black text-white mt-1 mb-3">Find a Walker Nearby</h2>
              <div className="inline-flex items-center gap-2 bg-white font-bold text-sm px-4 py-2 rounded-xl shadow-sm"
                style={{ color: '#E8960A' }}>
                Browse Walkers
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="absolute right-4 bottom-0 text-7xl opacity-20 select-none">🐾</div>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
          </div>
        </Link>
      )}

      {/* Quick action pills */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-3">
          {(role === 'OWNER' ? [
            { icon: '🔍', label: 'Find', href: '/walkers' },
            { icon: '📅', label: 'Bookings', href: '/bookings' },
            { icon: '🐕', label: 'My Dogs', href: '/profile/dogs' },
            { icon: '💬', label: 'Messages', href: '/messages' },
          ] : [
            { icon: '📅', label: 'Bookings', href: '/bookings' },
            { icon: '💬', label: 'Messages', href: '/messages' },
            { icon: '✏️', label: 'Profile', href: '/profile/walker' },
            { icon: '🐕', label: 'Dogs', href: '/dogs' },
          ]).map(a => (
            <Link key={a.href} href={a.href}
              className="flex flex-col items-center gap-1.5 bg-white rounded-2xl py-3 shadow-sm hover:shadow-md transition-all"
              style={{ border: '1px solid #F0E4D0' }}>
              <span className="text-xl">{a.icon}</span>
              <span className="text-xs font-semibold" style={{ color: '#7A5C3A' }}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming bookings */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold" style={{ color: '#3D2800' }}>Upcoming Walks</h2>
          <Link href="/bookings" className="text-xs font-semibold" style={{ color: '#E8960A' }}>View all →</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm" style={{ border: '1px dashed #F0D9B0' }}>
            <div className="text-4xl mb-2">📅</div>
            <p className="font-semibold text-sm" style={{ color: '#3D2800' }}>No upcoming walks</p>
            <p className="text-xs mt-1" style={{ color: '#9B7B4F' }}>
              {role === 'OWNER' ? 'Book your first walk in seconds' : 'Accept a booking request to get started'}
            </p>
            {role === 'OWNER' && (
              <Link href="/walkers" className="inline-block mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: '#E8960A' }}>
                Find a walker
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.slice(0, 3).map((b: any, i: number) => (
              <Link key={b.id} href="/bookings"
                className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                style={{ border: '1px solid #F0E4D0' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: avatarColors[i % avatarColors.length].bg }}>
                  🐶
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate" style={{ color: '#3D2800' }}>{b.dog.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#9B7B4F' }}>
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

      {/* Book again / recent walkers for owners */}
      {role === 'OWNER' && recentWalkers.length > 0 && (
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold" style={{ color: '#3D2800' }}>Book Again</h2>
            <Link href="/walkers" className="text-xs font-semibold" style={{ color: '#E8960A' }}>See all →</Link>
          </div>
          <div className="space-y-2">
            {recentWalkers.map((b: any, i: number) => (
              <Link key={b.id} href={`/walkers/${b.walker?.id}?dogId=${b.dog?.id}&duration=${b.duration}`}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                style={{ border: '1px solid #F0E4D0' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0"
                  style={{ backgroundColor: avatarColors[i % avatarColors.length].bg, color: avatarColors[i % avatarColors.length].text }}>
                  {getInitials(b.walker?.name || '')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: '#3D2800' }}>{b.walker?.name}</div>
                  <div className="text-xs" style={{ color: '#9B7B4F' }}>Last walked {b.dog?.name}</div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl"
                  style={{ color: '#E8960A', backgroundColor: '#FFF7E0' }}>
                  🔁 Rebook
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured walkers for owners */}
      {role === 'OWNER' && featuredWalkers.length > 0 && (
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold" style={{ color: '#3D2800' }}>Top Walkers</h2>
            <Link href="/walkers" className="text-xs font-semibold" style={{ color: '#E8960A' }}>See all →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {featuredWalkers.map((w: any, i: number) => (
              <Link key={w.id} href={`/walkers/${w.user.id}`}
                className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-center"
                style={{ border: '1px solid #F0E4D0' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg"
                  style={{ backgroundColor: avatarColors[i % avatarColors.length].bg, color: avatarColors[i % avatarColors.length].text }}>
                  {getInitials(w.user.name)}
                </div>
                <div>
                  <div className="font-semibold text-xs truncate w-full" style={{ color: '#3D2800' }}>{w.user.name.split(' ')[0]}</div>
                  {w.verified && <div className="text-blue-500 text-[10px] font-bold">✓ Verified</div>}
                  <div className="text-[10px]" style={{ color: '#9B7B4F' }}>{w.city}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Walker: recent activity */}
      {role === 'WALKER' && (
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold" style={{ color: '#3D2800' }}>Recent Activity</h2>
            <Link href="/bookings" className="text-xs font-semibold" style={{ color: '#E8960A' }}>View all →</Link>
          </div>
          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm" style={{ border: '1px dashed #F0D9B0' }}>
              <div className="text-4xl mb-2">🐾</div>
              <p className="font-semibold text-sm" style={{ color: '#3D2800' }}>No bookings yet</p>
              <p className="text-xs mt-1" style={{ color: '#9B7B4F' }}>Complete your profile to attract more owners</p>
              <Link href="/profile/walker" className="inline-block mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: '#E8960A' }}>
                Edit Profile
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {bookings.slice(0, 4).map((b: any) => (
                <div key={b.id} className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm"
                  style={{ border: '1px solid #F0E4D0' }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: '#FDE8C8' }}>
                    🐶
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm" style={{ color: '#3D2800' }}>{b.dog.name}
                      <span style={{ color: '#9B7B4F' }} className="font-normal"> · {b.owner?.name}</span>
                    </div>
                    <div className="text-xs" style={{ color: '#9B7B4F' }}>{b.date} · {b.duration} min</div>
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
