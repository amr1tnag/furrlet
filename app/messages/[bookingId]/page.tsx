'use client'
import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Message {
  id: string
  body: string
  createdAt: string
  sender: { id: string; name: string }
}

interface BookingInfo {
  id: string
  date: string
  dog: { name: string }
  owner: { name: string }
  walker: { name: string }
  status: string
}

export default function ChatPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string

  const [messages, setMessages] = useState<Message[]>([])
  const [booking, setBooking] = useState<BookingInfo | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const loadMessages = async () => {
    const res = await fetch(`/api/messages/${bookingId}`)
    if (res.ok) setMessages(await res.json())
  }

  const loadBooking = async () => {
    const res = await fetch(`/api/bookings/${bookingId}`)
    if (res.ok) setBooking(await res.json())
    else router.push('/bookings')
  }

  useEffect(() => {
    if (!session) return
    loadBooking()
    loadMessages()
  }, [session])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!session) return
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [session])

  async function send() {
    if (!text.trim() || sending) return
    setSending(true)
    const res = await fetch(`/api/messages/${bookingId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: text.trim() }),
    })
    if (res.ok) {
      const msg = await res.json()
      setMessages(prev => [...prev, msg])
      setText('')
      inputRef.current?.focus()
    }
    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const role = (session?.user as any)?.role
  const otherName = booking
    ? role === 'OWNER' ? booking.walker?.name : booking.owner?.name
    : ''

  function formatTime(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' +
      d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/messages" className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
          {otherName?.[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-gray-900">{otherName || '...'}</div>
          {booking && (
            <div className="text-xs text-gray-400">
              {booking.dog?.name} · {booking.date}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-16">
            <div className="text-4xl mb-3">💬</div>
            <p className="font-semibold text-gray-500">No messages yet</p>
            <p className="text-sm mt-1">Send a message to {otherName || 'the other party'}</p>
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.sender.id === userId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? 'bg-amber-500 text-white rounded-br-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                }`}>
                  {msg.body}
                </div>
                <span className="text-xs text-gray-400 px-1">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex items-end gap-2 bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 resize-none bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 px-2 py-1.5 max-h-32 leading-relaxed"
          style={{ fieldSizing: 'content' } as any}
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          className="w-9 h-9 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  )
}
