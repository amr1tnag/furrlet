'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const statusStyles: Record<string, string> = {
  PENDING:   'bg-yellow-50 text-yellow-600 border border-yellow-100',
  ACCEPTED:  'bg-green-50 text-green-600 border border-green-100',
  COMPLETED: 'bg-blue-50 text-blue-600 border border-blue-100',
  DECLINED:  'bg-red-50 text-red-600 border border-red-100',
  CANCELLED: 'bg-gray-100 text-gray-500 border border-gray-200',
}

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
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const pending = bookings.filter(b => b.status === 'PENDING').length
  const accepted = bookings.filter(b => b.status === 'ACCEPTED').length
  const completed = bookings.filter(b => b.status === 'COMPLETED')
  const completedCount = completed.length
  const totalEarnings = completed.reduce((s, b) => s + b.totalPrice, 0)

  const now = new Date()
  const thisMonth = completed.filter(b => {
    const d = new Date(b.createdAt || b.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const thisMonthEarnings = thisMonth.reduce((s, b) => s + b.totalPrice, 0)

  const lastMonth = completed.filter(b => {
    const d = new Date(b.createdAt || b.date)
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
  })
  const lastMonthEarnings = lastMonth.reduce((s, b) => s + b.totalPrice, 0)

  const earningsGrowth = lastMonthEarnings > 0
    ? Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100)
    : null

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const stats = role === 'OWNER'
    ? [
        { icon: '🐕', label: 'My Dogs', value: dogs.length, href: '/profile/dogs', color: 'from-amber-400 to-orange-400' },
        { icon: '🕐', label: 'Pending', value: pending, href: '/bookings', color: 'from-yellow-400 to-amber-400' },
        { icon: '✅', label: 'Completed', value: completedCount, href: '/bookings', color: 'from-green-400 to-emerald-400' },
      ]
    : [
        { icon: '🕐', label: 'Pending', value: pending, href: '/bookings', color: 'from-yellow-400 to-amber-400' },
        { icon: '🏃', label: 'Active', value: accepted, href: '/bookings', color: 'from-green-400 to-emerald-400' },
        { icon: '✅', label: 'Completed', value: completedCount, href: '/bookings', color: 'from-blue-400 to-indigo-400' },
      ]

  const actions = role === 'OWNER'
    ? [
        { icon: '🔍', title: 'Find a walker', desc: 'Browse verified walkers near you', href: '/walkers' },
        { icon: '➕', title: 'Manage my dogs', desc: 'Add or edit your dog profiles', href: '/profile/dogs' },
        { icon: '📅', title: 'View bookings', desc: 'Track all your walk requests', href: '/bookings' },
      ]
    : [
        { icon: '✏️', title: 'Edit my profile', desc: 'Update your rates and availability', href: '/profile/walker' },
        { icon: '🐕', title: 'Browse dogs', desc: 'Find dogs that need walks', href: '/dogs' },
        { icon: '📅', title: 'View bookings', desc: 'Manage your walk requests', href: '/bookings' },
      ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-amber-200">
            {session?.user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{greeting}, {session?.user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-gray-400 text-sm">{role === 'OWNER' ? 'Dog Owner' : 'Dog Walker'} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {stats.map((s, i) => (
          <Link key={s.label} href={s.href}
            className="card group relative overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            style={{ animationDelay: `${i * 100}ms` }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl group-hover:scale-110 transition-transform duration-200">{s.icon}</div>
                <svg className="w-4 h-4 text-gray-200 group-hover:text-amber-400 transition-colors mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="text-xl sm:text-2xl font-black text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5 truncate">{s.label}</div>
            </div>
            <div className={`h-0.5 bg-gradient-to-r ${s.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
          </Link>
        ))}
      </div>

      {/* Walker earnings panel */}
      {role === 'WALKER' && (
        <div className="card overflow-hidden mb-6">
          <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-400" />
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Earnings</h2>
              <span className="text-xs text-gray-400">{now.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            </div>

            {/* Earnings stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4">
                <div className="text-xs text-gray-500 mb-1">Total Earned</div>
                <div className="text-xl sm:text-2xl font-black text-gray-900">₹{totalEarnings.toFixed(0)}</div>
                <div className="text-xs text-gray-400 mt-0.5">{completedCount} walks</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4">
                <div className="text-xs text-gray-500 mb-1">This Month</div>
                <div className="text-xl sm:text-2xl font-black text-gray-900">₹{thisMonthEarnings.toFixed(0)}</div>
                {earningsGrowth !== null && (
                  <div className={`text-xs mt-0.5 font-semibold ${earningsGrowth >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                    {earningsGrowth >= 0 ? '↑' : '↓'} {Math.abs(earningsGrowth)}% vs last month
                  </div>
                )}
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4">
                <div className="text-xs text-gray-500 mb-1">Last Month</div>
                <div className="text-xl sm:text-2xl font-black text-gray-900">₹{lastMonthEarnings.toFixed(0)}</div>
                <div className="text-xs text-gray-400 mt-0.5">{lastMonth.length} walks</div>
              </div>
            </div>

            {/* Recent completed walks */}
            {completed.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">💰</div>
                <p className="text-gray-400 text-sm">No earnings yet — complete walks to get paid</p>
              </div>
            ) : (
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recent Payments</div>
                <div className="space-y-2">
                  {completed.slice(0, 5).map(b => (
                    <div key={b.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                      <div className="w-9 h-9 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center text-base flex-shrink-0">🐶</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-sm truncate">{b.dog.name}
                          <span className="text-gray-400 font-normal"> · {b.owner?.name}</span>
                        </div>
                        <div className="text-gray-400 text-xs">{b.date} · {b.duration} min</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-green-600 text-sm">+₹{b.totalPrice.toFixed(0)}</div>
                        <div className="text-xs text-gray-400">{b.paymentStatus === 'PAID' ? '✓ Paid' : 'Offline'}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {completed.length > 5 && (
                  <Link href="/bookings" className="block text-center text-xs text-amber-500 font-semibold mt-3 hover:text-amber-700 transition-colors">
                    View all {completed.length} completed walks →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-5 gap-4 sm:gap-6">
        {/* Quick actions */}
        <div className="sm:col-span-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {actions.map((a, i) => (
              <Link key={a.href} href={a.href}
                className="flex items-center gap-4 card p-4 group hover:shadow-md hover:-translate-y-0.5 hover:border-amber-100 transition-all duration-200"
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className="w-11 h-11 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 group-hover:shadow-sm transition-all duration-200">
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm group-hover:text-amber-600 transition-colors">{a.title}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{a.desc}</div>
                </div>
                <svg className="w-4 h-4 text-gray-200 group-hover:text-amber-400 transition-all duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent bookings */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent</h2>
            <Link href="/bookings" className="text-xs text-amber-500 font-semibold hover:text-amber-700 transition-colors">View all →</Link>
          </div>
          {bookings.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-gray-400 text-sm">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookings.slice(0, 4).map(b => (
                <div key={b.id} className="card p-3.5 flex items-center gap-3 hover:border-amber-100 hover:shadow-sm transition-all duration-200">
                  <div className="w-9 h-9 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center text-base flex-shrink-0">🐶</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm truncate">{b.dog.name}</div>
                    <div className="text-gray-400 text-xs">{b.date}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${statusStyles[b.status] ?? statusStyles.PENDING}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
