'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  PENDING:   { label: 'Pending',   bg: '#FFF7E0', text: '#C47D00', icon: '🕐' },
  ACCEPTED:  { label: 'Confirmed', bg: '#F0FDF4', text: '#15803D', icon: '✅' },
  DECLINED:  { label: 'Declined',  bg: '#FEF2F2', text: '#DC2626', icon: '❌' },
  COMPLETED: { label: 'Completed', bg: '#F3F4F6', text: '#6B7280', icon: '🏁' },
  CANCELLED: { label: 'Cancelled', bg: '#F3F4F6', text: '#6B7280', icon: '🚫' },
  REFUNDED:  { label: 'Refunded',  bg: '#F0FDF4', text: '#15803D', icon: '↩️' },
}

const avatarColors = [
  { bg: '#FDE8C8', text: '#C4680A' },
  { bg: '#D6EAF8', text: '#1A6A9A' },
  { bg: '#E8D5F5', text: '#6B2FA0' },
  { bg: '#D5F5E3', text: '#1E8449' },
  { bg: '#FAD7D7', text: '#A93226' },
]

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="text-2xl transition-transform hover:scale-110"
          style={{ color: (hover || value) >= s ? '#F59E0B' : '#E5E7EB' }}>
          ★
        </button>
      ))}
    </div>
  )
}

export default function Bookings() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [bookings, setBookings] = useState<any[]>([])
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [acting, setActing] = useState<string | null>(null)

  const load = () => fetch('/api/bookings').then(r => r.json()).then(d => setBookings(Array.isArray(d) ? d : []))
  useEffect(() => { if (session) load() }, [session])

  async function updateStatus(id: string, status: string) {
    setActing(id + status)
    await fetch(`/api/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setActing(null)
    load()
  }

  async function submitReview(bookingId: string) {
    if (!reviewForm.rating) return
    setSubmitting(true)
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, ...reviewForm }),
    })
    setReviewing(null)
    setReviewForm({ rating: 0, comment: '' })
    setSubmitting(false)
    load()
  }

  const upcomingBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'ACCEPTED')
  const pastBookings = bookings.filter(b => b.status !== 'PENDING' && b.status !== 'ACCEPTED')
  const displayedBookings = tab === 'upcoming' ? upcomingBookings : pastBookings

  const getInitials = (name: string) => {
    if (!name) return '?'
    const parts = name.split(' ')
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0]
  }

  return (
    <div style={{ backgroundColor: '#FAF5EE', minHeight: '100vh' }} className="pb-28">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-black" style={{ color: '#3D2800' }}>My Bookings</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9B7B4F' }}>
          {role === 'WALKER' ? 'Manage your walk requests' : 'Track your booking history'}
        </p>
      </div>

      {/* Pill toggle tabs */}
      <div className="px-4 mb-5">
        <div className="flex bg-white rounded-2xl p-1 shadow-sm" style={{ border: '1px solid #F0E4D0' }}>
          {(['upcoming', 'past'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={tab === t
                ? { backgroundColor: '#E8960A', color: '#fff' }
                : { color: '#9B7B4F' }}
            >
              {t === 'upcoming' ? `Upcoming (${upcomingBookings.length})` : `Past (${pastBookings.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Booking cards */}
      <div className="px-4 space-y-4">
        {displayedBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-5xl mb-3">{tab === 'upcoming' ? '📅' : '🏁'}</div>
            <p className="font-semibold" style={{ color: '#3D2800' }}>
              {tab === 'upcoming' ? 'No upcoming walks' : 'No past walks'}
            </p>
            <p className="text-sm mt-1" style={{ color: '#9B7B4F' }}>
              {tab === 'upcoming' && role === 'OWNER' ? 'Book your first walk now!' : ''}
            </p>
            {tab === 'upcoming' && role === 'OWNER' && (
              <Link href="/walkers" className="inline-block mt-4 px-6 py-2.5 rounded-xl font-bold text-sm text-white" style={{ backgroundColor: '#E8960A' }}>
                Find a Walker
              </Link>
            )}
            {tab === 'upcoming' && role === 'WALKER' && (
              <Link href="/profile/walker" className="inline-block mt-4 px-6 py-2.5 rounded-xl font-bold text-sm text-white" style={{ backgroundColor: '#E8960A' }}>
                Complete My Profile
              </Link>
            )}
          </div>
        ) : (
          displayedBookings.map((b, i) => {
            const st = statusConfig[b.status] ?? statusConfig.PENDING
            const isPending = b.status === 'PENDING'
            const isUpcoming = tab === 'upcoming'
            const personName = role === 'OWNER' ? b.walker?.name : b.owner?.name
            const color = avatarColors[i % avatarColors.length]

            return (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {isPending && role === 'WALKER' && (
                  <div className="h-1" style={{ background: 'linear-gradient(to right, #E8960A, #F59E0B)' }} />
                )}
                <div className="p-4">
                  {/* Header: avatar + name + status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0"
                        style={{ backgroundColor: color.bg, color: color.text }}>
                        {getInitials(personName || '')}
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ color: '#3D2800' }}>{personName || '—'}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className="text-xs" style={{ color: '#F59E0B' }}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: st.bg, color: st.text }}>
                        {st.icon} {st.label}
                      </span>
                      {b.status === 'CANCELLED' && b.paymentStatus === 'REFUNDED' && (
                        <div className="text-xs font-semibold mt-1 text-right" style={{ color: '#15803D' }}>↩ Refunded</div>
                      )}
                    </div>
                  </div>

                  {/* Detail grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="rounded-xl p-2.5" style={{ backgroundColor: '#FDF0E0' }}>
                      <div className="text-xs mb-0.5" style={{ color: '#9B7B4F' }}>📅 Date</div>
                      <div className="text-sm font-semibold" style={{ color: '#3D2800' }}>{b.date}</div>
                    </div>
                    <div className="rounded-xl p-2.5" style={{ backgroundColor: '#FDF0E0' }}>
                      <div className="text-xs mb-0.5" style={{ color: '#9B7B4F' }}>⏱ Duration</div>
                      <div className="text-sm font-semibold" style={{ color: '#3D2800' }}>{b.duration} min</div>
                    </div>
                    <div className="rounded-xl p-2.5" style={{ backgroundColor: '#FDF0E0' }}>
                      <div className="text-xs mb-0.5" style={{ color: '#9B7B4F' }}>🐶 Dog</div>
                      <div className="text-sm font-semibold" style={{ color: '#3D2800' }}>{b.dog?.name}</div>
                    </div>
                    <div className="rounded-xl p-2.5" style={{ backgroundColor: '#FDF0E0' }}>
                      <div className="text-xs mb-0.5" style={{ color: '#9B7B4F' }}>💰 Total</div>
                      <div className="text-sm font-semibold" style={{ color: '#3D2800' }}>₹{b.totalPrice?.toFixed(0)}</div>
                    </div>
                  </div>

                  {/* Pickup address for walkers */}
                  {role === 'WALKER' && b.address && (
                    <div className="rounded-xl px-3 py-2.5 mb-4 flex items-start gap-2" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                      <span className="text-base mt-0.5">📍</span>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: '#1D4ED8' }}>Pickup address</div>
                        <div className="text-sm font-medium" style={{ color: '#1E3A8A' }}>{b.address}</div>
                      </div>
                    </div>
                  )}

                  {/* Upcoming action buttons */}
                  {isUpcoming && (
                    <div className="flex gap-2 pt-3 border-t" style={{ borderColor: '#F0E4D0' }}>
                      {(b.status === 'PENDING' || b.status === 'ACCEPTED') && (
                        <Link href={`/messages/${b.id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border"
                          style={{ borderColor: '#E8960A', color: '#E8960A', backgroundColor: '#FFF7E0' }}>
                          💬 Message
                        </Link>
                      )}
                      {role === 'OWNER' && b.status === 'ACCEPTED' && (
                        <Link href={`/bookings/${b.id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white"
                          style={{ backgroundColor: '#E8960A' }}>
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          Track Walk
                        </Link>
                      )}
                      {role === 'WALKER' && isPending && (
                        <>
                          <button
                            onClick={() => updateStatus(b.id, 'ACCEPTED')}
                            disabled={!!acting}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                            style={{ backgroundColor: '#22C55E' }}>
                            {acting === b.id + 'ACCEPTED' ? '...' : '✓ Accept'}
                          </button>
                          <button
                            onClick={() => updateStatus(b.id, 'DECLINED')}
                            disabled={!!acting}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold border disabled:opacity-50"
                            style={{ borderColor: '#FCA5A5', color: '#DC2626', backgroundColor: '#FEF2F2' }}>
                            {acting === b.id + 'DECLINED' ? '...' : '✕ Decline'}
                          </button>
                        </>
                      )}
                      {role === 'WALKER' && b.status === 'ACCEPTED' && (
                        <>
                          <Link href={`/bookings/${b.id}`}
                            className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-sm font-bold text-white"
                            style={{ backgroundColor: '#E8960A' }}>
                            📍 Share Location
                          </Link>
                          <button
                            onClick={() => updateStatus(b.id, 'COMPLETED')}
                            disabled={!!acting}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                            style={{ backgroundColor: '#3B82F6' }}>
                            {acting === b.id + 'COMPLETED' ? '...' : '🏁 Complete'}
                          </button>
                        </>
                      )}
                      {role === 'OWNER' && (b.status === 'PENDING' || b.status === 'ACCEPTED') && (
                        <button
                          onClick={() => { if (confirm('Cancel this booking?')) updateStatus(b.id, 'CANCELLED') }}
                          disabled={!!acting}
                          className="px-3 py-2.5 rounded-xl text-sm font-semibold border disabled:opacity-50"
                          style={{ borderColor: '#E5E7EB', color: '#9CA3AF' }}>
                          🚫
                        </button>
                      )}
                    </div>
                  )}

                  {/* Past booking actions */}
                  {!isUpcoming && (
                    <div className="pt-3 border-t" style={{ borderColor: '#F0E4D0' }}>
                      {role === 'OWNER' && b.status === 'COMPLETED' && (
                        <>
                          <div className="flex gap-2 mb-3">
                            <Link
                              href={`/walkers/${b.walker?.id}?dogId=${b.dog?.id}&duration=${b.duration}`}
                              className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold border"
                              style={{ borderColor: '#E8960A', color: '#E8960A', backgroundColor: '#FFF7E0' }}>
                              🔁 Reschedule
                            </Link>
                            <Link href={`/messages/${b.id}`}
                              className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold border"
                              style={{ borderColor: '#E5E7EB', color: '#6B7280', backgroundColor: '#F9FAFB' }}>
                              💬 Message
                            </Link>
                          </div>
                          {b.review ? (
                            <div className="rounded-xl p-3" style={{ backgroundColor: '#FFF7E0' }}>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="text-sm" style={{ color: '#F59E0B' }}>{'★'.repeat(b.review.rating)}{'☆'.repeat(5 - b.review.rating)}</div>
                                <span className="text-xs" style={{ color: '#9B7B4F' }}>Your review</span>
                              </div>
                              {b.review.comment && <p className="text-sm" style={{ color: '#7A5C3A' }}>{b.review.comment}</p>}
                            </div>
                          ) : reviewing === b.id ? (
                            <div className="rounded-xl p-4" style={{ backgroundColor: '#FFF7E0' }}>
                              <p className="text-sm font-semibold mb-3" style={{ color: '#3D2800' }}>How was the walk?</p>
                              <StarPicker value={reviewForm.rating} onChange={r => setReviewForm((f: any) => ({ ...f, rating: r }))} />
                              <textarea rows={2} value={reviewForm.comment}
                                onChange={e => setReviewForm((f: any) => ({ ...f, comment: e.target.value }))}
                                placeholder="Leave a comment (optional)..."
                                className="w-full mt-3 rounded-xl p-3 text-sm resize-none outline-none"
                                style={{ backgroundColor: '#FDF0E0', color: '#3D2800' }} />
                              <div className="flex gap-2 mt-3">
                                <button onClick={() => submitReview(b.id)} disabled={!reviewForm.rating || submitting}
                                  className="flex-1 py-2 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                                  style={{ backgroundColor: '#E8960A' }}>
                                  {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                                <button onClick={() => setReviewing(null)}
                                  className="px-4 py-2 rounded-xl font-semibold text-sm border"
                                  style={{ borderColor: '#E5E7EB', color: '#6B7280' }}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setReviewing(b.id)}
                              className="flex items-center gap-1.5 text-sm font-semibold"
                              style={{ color: '#E8960A' }}>
                              <span>⭐</span> Leave a review
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Orange FAB */}
      {role === 'OWNER' && (
        <Link href="/walkers"
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg z-40"
          style={{ backgroundColor: '#E8960A' }}>
          +
        </Link>
      )}
    </div>
  )
}
