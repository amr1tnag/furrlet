'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  DECLINED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
}

export default function Bookings() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [bookings, setBookings] = useState<any[]>([])

  const load = () => fetch('/api/bookings').then(r => r.json()).then(d => setBookings(Array.isArray(d) ? d : []))
  useEffect(() => { if (session) load() }, [session])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    load()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Bookings</h1>
      <p className="text-gray-500 mb-8">{role === 'WALKER' ? 'Manage your walk requests' : 'Track your booking history'}</p>
      {bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📅</div>
          <p>No bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-gray-800 text-lg">{b.dog.name} the {b.dog.breed}</div>
                  <div className="text-gray-500 text-sm">
                    {role === 'OWNER' ? `Walker: ${b.walker?.name}` : `Owner: ${b.owner?.name}`}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[b.status]}`}>{b.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                <div><span className="font-medium">📅 Date:</span> {b.date}</div>
                <div><span className="font-medium">⏱ Duration:</span> {b.duration} min</div>
                <div><span className="font-medium">💰 Price:</span> ${b.totalPrice.toFixed(2)}</div>
              </div>
              {role === 'WALKER' && b.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(b.id, 'ACCEPTED')} className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-600 transition">Accept</button>
                  <button onClick={() => updateStatus(b.id, 'DECLINED')} className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-600 transition">Decline</button>
                </div>
              )}
              {role === 'WALKER' && b.status === 'ACCEPTED' && (
                <button onClick={() => updateStatus(b.id, 'COMPLETED')} className="bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-600 transition">Mark Completed</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
