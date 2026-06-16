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

const avatarColors = [
  { bg: '#FDE8C8', text: '#C4680A' },
  { bg: '#D6EAF8', text: '#1A6A9A' },
  { bg: '#E8D5F5', text: '#6B2FA0' },
  { bg: '#D5F5E3', text: '#1E8449' },
  { bg: '#FAD7D7', text: '#A93226' },
  { bg: '#FDE8C8', text: '#92400E' },
]

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
    <div style={{ backgroundColor: '#FAF5EE', minHeight: '100vh' }} className="flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E8960A', borderTopColor: 'transparent' }} />
    </div>
  )

  // Only show bookings that are not in DECLINED status
  const conversations = bookings.filter(b => b.status !== 'DECLINED')

  const getInitials = (name: string) => {
    if (!name) return '?'
    const parts = name.split(' ')
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0]
  }

  const formatTime = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } catch { return '' }
  }

  return (
    <div style={{ backgroundColor: '#FAF5EE', minHeight: '100vh' }} className="pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-black" style={{ color: '#3D2800' }}>Furrlet</span>
        </div>
        <h1 className="text-2xl font-black" style={{ color: '#3D2800' }}>Messages</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9B7B4F' }}>
          Chat with your {role === 'OWNER' ? 'walkers' : 'owners'}
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="mx-4 bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">💬</div>
          <p className="font-semibold" style={{ color: '#3D2800' }}>No conversations yet</p>
          <p className="text-sm mt-1" style={{ color: '#9B7B4F' }}>Messages appear here once you have bookings</p>
          {role === 'OWNER' && (
            <Link href="/walkers" className="inline-block mt-6 px-6 py-2.5 rounded-xl font-bold text-sm text-white" style={{ backgroundColor: '#E8960A' }}>
              Find a walker
            </Link>
          )}
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {conversations.map((b, i) => {
            const otherName = role === 'OWNER' ? b.walker?.name : b.owner?.name
            const lastMsg = b.messages?.[b.messages.length - 1]
            const color = avatarColors[i % avatarColors.length]
            const hasUnread = false // unread tracking placeholder

            return (
              <Link key={b.id} href={`/messages/${b.id}`}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                style={{ border: '1px solid #F0E4D0' }}>
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base"
                    style={{ backgroundColor: color.bg, color: color.text }}>
                    {getInitials(otherName || '')}
                  </div>
                  {hasUnread && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ backgroundColor: '#E8960A' }}>
                      1
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm truncate" style={{ color: '#3D2800' }}>{otherName}</span>
                    {lastMsg && (
                      <span className="text-xs flex-shrink-0" style={{ color: '#C4A882' }}>
                        {formatTime(lastMsg.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#C4A882' }}>
                    {b.dog?.name} · {b.date}
                  </div>
                  {lastMsg ? (
                    <p className="text-sm mt-0.5 truncate" style={{ color: '#9B7B4F' }}>
                      {lastMsg.sender.id === userId ? 'You: ' : ''}{lastMsg.body}
                    </p>
                  ) : (
                    <p className="text-sm mt-0.5 italic" style={{ color: '#C4A882' }}>No messages yet — say hi!</p>
                  )}
                </div>

                <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#D4B896' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
