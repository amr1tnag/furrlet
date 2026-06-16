'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const statusConfig: Record<string, { label: string; classes: string; icon: string }> = {
  PENDING:   { label: 'Pending',   classes: 'bg-yellow-50 text-yellow-700 border border-yellow-100', icon: '🕐' },
  ACCEPTED:  { label: 'Accepted',  classes: 'bg-green-50 text-green-700 border border-green-100',   icon: '✅' },
  DECLINED:  { label: 'Declined',  classes: 'bg-red-50 text-red-600 border border-red-100',          icon: '❌' },
  COMPLETED: { label: 'Completed', classes: 'bg-blue-50 text-blue-700 border border-blue-100',       icon: '🏁' },
  CANCELLED: { label: 'Cancelled', classes: 'bg-gray-100 text-gray-500 border border-gray-200',      icon: '🚫' },
  REFUNDED:  { label: 'Refunded',  classes: 'bg-green-50 text-green-600 border border-green-100',     icon: '↩️' },
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className={`text-2xl transition-transform hover:scale-110 ${(hover || value) >= s ? 'text-yellow-400' : 'text-gray-200'}`}>
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

  const pending = bookings.filter(b => b.status === 'PENDING')
  const others = bookings.filter(b => b.status !== 'PENDING')

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="font-bold text-[#3D2800] text-xl">Furrlet</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 bg-white border border-[#F0D9B0] rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-[#6B4F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm">P</div>
        </div>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#3D2800]">My Bookings</h1>
        <p className="text-[#6B4F00] text-sm mt-0.5">Manage your furry friends&apos; adventures.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="card p-12 text-center border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4" style={{ filter: 'grayscale(0)' }}>
            {role === 'WALKER' ? '🏃' : '📅'}
          </div>
          <p className="text-gray-800 font-bold text-lg mb-1">
            {role === 'WALKER' ? 'No bookings yet' : 'No walks booked yet'}
          </p>
          <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
            {role === 'WALKER'
              ? 'Booking requests from owners will show up here. Make sure your profile is complete!'
              : 'Your upcoming and past walks will appear here. Book your first walk in seconds!'}
          </p>
          {role === 'OWNER' && (
            <Link href="/walkers" className="btn-primary inline-block">Find a Walker</Link>
          )}
          {role === 'WALKER' && (
            <Link href="/profile/walker" className="btn-primary inline-block">Complete My Profile</Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending requests — shown first and highlighted for walkers */}
          {pending.length > 0 && (
            <div>
              {role === 'WALKER' && (
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Action Required</h2>
                  <span className="w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{pending.length}</span>
                </div>
              )}
              <div className="space-y-4">
                {pending.map(b => <BookingCard key={b.id} b={b} role={role} reviewing={reviewing} setReviewing={setReviewing} reviewForm={reviewForm} setReviewForm={setReviewForm} submitting={submitting} submitReview={submitReview} updateStatus={updateStatus} acting={acting} />)}
              </div>
            </div>
          )}

          {/* Other bookings */}
          {others.length > 0 && (
            <div>
              {pending.length > 0 && <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">History</h2>}
              <div className="space-y-4">
                {others.map(b => <BookingCard key={b.id} b={b} role={role} reviewing={reviewing} setReviewing={setReviewing} reviewForm={reviewForm} setReviewForm={setReviewForm} submitting={submitting} submitReview={submitReview} updateStatus={updateStatus} acting={acting} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      {role === 'OWNER' && (
        <Link href="/walkers" className="fixed bottom-24 right-4 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-200 text-2xl font-bold transition-all active:scale-95 z-40">
          +
        </Link>
      )}
    </div>
  )
}

function BookingCard({ b, role, reviewing, setReviewing, reviewForm, setReviewForm, submitting, submitReview, updateStatus, acting }: any) {
  const st = statusConfig[b.status] ?? statusConfig.PENDING
  const isPending = b.status === 'PENDING'

  return (
    <div className={`bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] ${role === 'WALKER' && isPending ? 'border border-amber-200' : ''}`}>
      {/* Top accent for pending walker bookings */}
      {role === 'WALKER' && isPending && (
        <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🐶</div>
            <div>
              <div className="font-bold text-gray-900">{b.dog.name}
                <span className="text-gray-400 font-normal text-sm"> · {b.dog.breed}</span>
              </div>
              <div className="text-gray-500 text-sm mt-0.5">
                {role === 'OWNER' ? `Walker: ${b.walker?.name}` : `Owner: ${b.owner?.name}`}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${st.classes}`}>
              <span>{st.icon}</span>{st.label}
            </span>
            {b.status === 'CANCELLED' && b.paymentStatus === 'REFUNDED' && (
              <span className="text-xs font-semibold text-green-600 flex items-center gap-1">↩ Refunded</span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          {[
            { icon: '📅', label: 'Date', value: b.date },
            { icon: '⏱', label: 'Duration', value: `${b.duration} min` },
            { icon: '💰', label: 'Total', value: `₹${b.totalPrice.toFixed(0)}` },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-2.5 sm:p-3">
              <div className="text-xs text-gray-400 mb-0.5">{icon} <span className="hidden sm:inline">{label}</span></div>
              <div className="font-semibold text-gray-800 text-xs sm:text-sm">{value}</div>
            </div>
          ))}
        </div>

        {/* Pickup address — shown to walkers so they know where to go */}
        {role === 'WALKER' && b.address && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 mb-4 flex items-start gap-2">
            <span className="text-base mt-0.5">📍</span>
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-0.5">Pickup address</div>
              <div className="text-sm text-blue-900 font-medium">{b.address}</div>
            </div>
          </div>
        )}

        {/* Message button — always visible for active bookings */}
        {(b.status === 'PENDING' || b.status === 'ACCEPTED' || b.status === 'COMPLETED') && (
          <div className={`pt-2 border-t border-gray-50 flex ${role === 'OWNER' && (b.status === 'PENDING' || b.status === 'ACCEPTED') ? 'justify-between' : 'justify-end'} items-center`}>
            <Link href={`/messages/${b.id}`}
              className="text-xs text-amber-500 hover:text-amber-700 font-semibold transition-colors flex items-center gap-1">
              💬 Message {role === 'OWNER' ? 'walker' : 'owner'}
            </Link>
            {role === 'OWNER' && b.status === 'ACCEPTED' && (
              <Link href={`/bookings/${b.id}`}
                className="text-xs text-green-600 hover:text-green-700 font-semibold transition-colors flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Track Live
              </Link>
            )}
            {role === 'OWNER' && (b.status === 'PENDING' || b.status === 'ACCEPTED') && (
              <button
                onClick={() => {
                  if (confirm('Cancel this booking?')) updateStatus(b.id, 'CANCELLED')
                }}
                disabled={!!acting}
                className="text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors flex items-center gap-1 disabled:opacity-50">
                🚫 Cancel
              </button>
            )}
          </div>
        )}


        {/* Walker actions */}
        {role === 'WALKER' && isPending && (
          <div className="flex gap-3 pt-2 border-t border-gray-50">
            <button
              onClick={() => updateStatus(b.id, 'ACCEPTED')}
              disabled={!!acting}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50 shadow-sm">
              {acting === b.id + 'ACCEPTED' ? '...' : '✓ Accept'}
            </button>
            <button
              onClick={() => updateStatus(b.id, 'DECLINED')}
              disabled={!!acting}
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-500 border border-red-200 font-semibold py-2.5 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50">
              {acting === b.id + 'DECLINED' ? '...' : '✕ Decline'}
            </button>
          </div>
        )}

        {role === 'WALKER' && b.status === 'ACCEPTED' && (
          <div className="pt-2 border-t border-gray-50 flex gap-2">
            <Link href={`/bookings/${b.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-all active:scale-95 shadow-sm">
              📍 Share Location
            </Link>
            <button
              onClick={() => updateStatus(b.id, 'COMPLETED')}
              disabled={!!acting}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50 shadow-sm">
              {acting === b.id + 'COMPLETED' ? '...' : '🏁 Complete'}
            </button>
          </div>
        )}

        {/* Book again */}
        {role === 'OWNER' && b.status === 'COMPLETED' && (
          <div className="pt-3 border-t border-gray-50 flex justify-end">
            <Link
              href={`/walkers/${b.walker?.id}?dogId=${b.dog?.id}&duration=${b.duration}`}
              className="text-xs text-amber-500 hover:text-amber-700 font-semibold transition-colors flex items-center gap-1">
              🔁 Book again
            </Link>
          </div>
        )}

        {/* Owner review */}
        {role === 'OWNER' && b.status === 'COMPLETED' && (
          b.review ? (
            <div className="pt-4 border-t border-gray-50">
              <div className="bg-amber-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-yellow-400 text-sm">{'★'.repeat(b.review.rating)}{'☆'.repeat(5 - b.review.rating)}</div>
                  <span className="text-xs text-gray-400 font-medium">Your review</span>
                </div>
                {b.review.comment && <p className="text-gray-600 text-sm">{b.review.comment}</p>}
              </div>
            </div>
          ) : reviewing === b.id ? (
            <div className="pt-4 border-t border-gray-50">
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">How was the walk?</p>
                <StarPicker value={reviewForm.rating} onChange={r => setReviewForm((f: any) => ({ ...f, rating: r }))} />
                <textarea rows={2} value={reviewForm.comment}
                  onChange={e => setReviewForm((f: any) => ({ ...f, comment: e.target.value }))}
                  placeholder="Leave a comment (optional)..."
                  className="input mt-3 resize-none text-sm" />
                <div className="flex gap-2 mt-3">
                  <button onClick={() => submitReview(b.id)} disabled={!reviewForm.rating || submitting}
                    className="btn-primary disabled:opacity-50 text-sm py-2">
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button onClick={() => setReviewing(null)} className="btn-secondary text-sm py-2">Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-3 border-t border-gray-50">
              <button onClick={() => setReviewing(b.id)}
                className="flex items-center gap-1.5 text-amber-500 text-sm font-semibold hover:text-amber-700 transition-colors">
                <span>⭐</span> Leave a review
              </button>
            </div>
          )
        )}
      </div>
    </div>
  )
}
