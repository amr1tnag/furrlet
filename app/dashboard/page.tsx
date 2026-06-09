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

  if (status === 'loading') return <div className="flex justify-center py-20"><div className="text-gray-500">Loading...</div></div>

  const pending = bookings.filter(b => b.status === 'PENDING').length
  const completed = bookings.filter(b => b.status === 'COMPLETED').length
  const earnings = bookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + b.totalPrice, 0)

  const cards: [string, string, string | number, string][] = role === 'OWNER' ? [
    ['🐕', 'My Dogs', dogs.length, '/profile/dogs'],
    ['📅', 'Pending Bookings', pending, '/bookings'],
    ['✅', 'Completed Walks', completed, '/bookings'],
  ] : [
    ['📅', 'Pending Requests', pending, '/bookings'],
    ['✅', 'Completed Walks', completed, '/bookings'],
    ['💰', 'Total Earned', `$${earnings.toFixed(2)}`, '/bookings'],
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {session?.user?.name} 👋</h1>
      <p className="text-gray-500 mb-8">{role === 'OWNER' ? 'Manage your dogs and bookings' : 'Manage your walks and earnings'}</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {cards.map(([icon, label, val, href]) => (
          <Link key={label} href={href} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-amber-300 transition">
            <div className="text-3xl mb-2">{icon}</div>
            <div className="text-2xl font-bold text-gray-800">{val}</div>
            <div className="text-gray-500 text-sm">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {role === 'OWNER' ? (
          <>
            <Link href="/walkers" className="bg-amber-500 text-white rounded-2xl p-6 hover:bg-amber-600 transition">
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-bold text-lg">Find a Walker</div>
              <div className="text-amber-100 text-sm">Browse available dog walkers near you</div>
            </Link>
            <Link href="/profile/dogs" className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-amber-300 transition">
              <div className="text-2xl mb-2">➕</div>
              <div className="font-bold text-lg text-gray-800">Add a Dog</div>
              <div className="text-gray-500 text-sm">Register your dog to book walks</div>
            </Link>
          </>
        ) : (
          <>
            <Link href="/profile/walker" className="bg-amber-500 text-white rounded-2xl p-6 hover:bg-amber-600 transition">
              <div className="text-2xl mb-2">✏️</div>
              <div className="font-bold text-lg">Edit Profile</div>
              <div className="text-amber-100 text-sm">Update your walker profile and rates</div>
            </Link>
            <Link href="/dogs" className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-amber-300 transition">
              <div className="text-2xl mb-2">🐕</div>
              <div className="font-bold text-lg text-gray-800">Browse Dogs</div>
              <div className="text-gray-500 text-sm">See dogs that need walks</div>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
