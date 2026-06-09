'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Booking {
  id: string
  date: string
  status: string
  dog: { name: string }
  owner: { name: string }
  walker: { name: string }
  messages: { body: string; createdAt: string; sender: { id: string } }[]
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  ACCEPTED: 'bg-green-50 text-green-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
  DECLINED: 'bg-red-50 text-red-600',
  CANCELLED: 'bg-gray-100 text-gray-500',
  REFUNDED: 'bg-green-50 text-green-600',
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id
  const role = (session?.user as any)?.role
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    fetch('/api/bookings')
      .then(r => r.json())
      .then(data => { setBookings(Array.isArray(data) ? data : []); setLoading(false) })
  }, [session])

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</div>
  )

  // Only show bookings that are not in DECLINED status (messaging makes sense for active/completed ones)
  const conversations = bookings.filter(b => b.status !== 'DECLINED')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Messages</h1>
        <p className="text-gray-500 text-sm mt-1">Chat with your {role === 'OWNER' ? 'walkers' : 'owners'}</p>
      </div>

      {conversations.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-gray-600 font-semibold">No conversations yet</p>
          <p className="text-gray-400 text-sm mt-1">Messages appear here once you have bookings</p>
          {role === 'OWNER' && (
            <Link href="/walkers" className="btn-primary mt-6 inline-block">Find a walker</Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(b => {
            const otherName = role === 'OWNER' ? b.walker?.name : b.owner?.name
            const lastMsg = b.messages?.[b.messages.length - 1]
            const hasUnread = false // could implement unread tracking later

            return (
              <Link key={b.id} href={`/messages/${b.id}`}
                className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-all duration-200 cursor-pointer block">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-lg flex-shrink-0">
                  {otherName?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-900 truncate">{otherName}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg flex-shrink-0 ${statusColors[b.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {b.dog?.name} · {b.date}
                  </div>
                  {lastMsg ? (
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {lastMsg.sender.id === userId ? 'You: ' : ''}{lastMsg.body}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1 italic">No messages yet — say hi!</p>
                  )}
                </div>
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
