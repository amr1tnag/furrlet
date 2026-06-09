'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const role = (session?.user as any)?.role
  const [bookings, setBookings] = useState<any[]>([])
  const [dogs, setDogs] = useState<any[]>([])

  useEffect(() => { if (status === 'unauthenticated') router.push('/auth/signin') }, [status, router])
  useEffect(() => {
    if (!session) return
    fetch('/api/bookings').then(r => r.json()).then(d => setBookings(Array.isArray(d) ? d : []))
    if (role === 'OWNER') fetch('/api/dogs').then(r => r.json()).then(d => setDogs(Array.isArray(d) ? d : []))
  }, [session, role])

  if (status === 'loading') return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const pending = bookings.filter(b => b.status === 'PENDING').length
  const completed = bookings.filter(b => b.status === 'COMPLETED').length
  const earnings = bookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + b.totalPrice, 0)

  const stats: [string, string, string | number, string][] = role === 'OWNER' ? [
    ['🐕', 'My Dogs', dogs.length, '/profile/dogs'],
    ['🕐', 'Pending Bookings', pending, '/bookings'],
    ['✅', 'Completed Walks', completed, '/bookings'],
  ] : [
    ['🕐', 'Pending Requests', pending, '/bookings'],
    ['✅', 'Completed Walks', completed, '/bookings'],
    ['💰', 'Total Earned', `$${earnings.toFixed(2)}`, '/bookings'],
  ]

  const recentBookings = bookings.slice(0, 3)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {session?.user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {role === 'OWNER' ? 'Manage your dogs and upcoming walks' : 'Manage your walks and earnings'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(([icon, label, val, href]) => (
          <Link key={label} href={href}
            className="card p-5 hover:border-amber-200 hover:shadow-md transition-all duration-200 group">
            <div className="text-2xl mb-3">{icon}</div>
            <div className="text-2xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{val}</div>
            <div className="text-gray-500 text-xs mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
          <div className="space-y-2">
            {role === 'OWNER' ? (
              <>
                <Link href="/walkers" className="flex items-center gap-4 card p-4 hover:border-amber-200 hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl group-hover:bg-amber-100 transition-colors">🔍</div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">Find a walker</div>
                    <div className="text-gray-400 text-xs">Browse available walkers near you</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 ml-auto group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
                <Link href="/profile/dogs" className="flex items-center gap-4 card p-4 hover:border-amber-200 hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl group-hover:bg-amber-100 transition-colors">➕</div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">Manage my dogs</div>
                    <div className="text-gray-400 text-xs">Add or edit your dog profiles</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 ml-auto group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </>
            ) : (
              <>
                <Link href="/profile/walker" className="flex items-center gap-4 card p-4 hover:border-amber-200 hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl group-hover:bg-amber-100 transition-colors">✏️</div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">Edit my profile</div>
                    <div className="text-gray-400 text-xs">Update your rates and availability</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 ml-auto group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
                <Link href="/dogs" className="flex items-center gap-4 card p-4 hover:border-amber-200 hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl group-hover:bg-amber-100 transition-colors">🐕</div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">Browse dogs</div>
                    <div className="text-gray-400 text-xs">Find dogs that need walks</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 ml-auto group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Recent bookings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent Bookings</h2>
            <Link href="/bookings" className="text-xs text-amber-600 font-medium hover:text-amber-700">View all →</Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="card p-6 text-center text-gray-400 text-sm">No bookings yet</div>
          ) : (
            <div className="space-y-2">
              {recentBookings.map(b => (
                <div key={b.id} className="card p-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-lg">🐶</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 text-sm truncate">{b.dog.name}</div>
                    <div className="text-gray-400 text-xs">{b.date}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    b.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' :
                    b.status === 'ACCEPTED' ? 'bg-green-50 text-green-600' :
                    b.status === 'COMPLETED' ? 'bg-blue-50 text-blue-600' :
                    'bg-red-50 text-red-600'
                  }`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
