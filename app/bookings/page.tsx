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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">{role === 'WALKER' ? 'Manage your walk requests' : 'Track your booking history'}</p>
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
    </div>
  )
}

function BookingCard({ b, role, reviewing, setReviewing, reviewForm, setReviewForm, submitting, submitReview, updateStatus, acting }: any) {
  const st = statusConfig[b.status] ?? statusConfig.PENDING
  const isPending = b.status === 'PENDING'

  return (
    <div className={`card overflow-hidden transition-all duration-200 hover:shadow-card-hover ${role === 'WALKER' && isPending ? 'border-amber-200 shadow-[0_0_0_2px_rgba(251,191,36,0.15)]' : ''}`}>
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
            { icon: '💰', label: 'Total', value: `₹${b.totalPrice.toFixed(2)}` },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-2.5 sm:p-3">
              <div className="text-xs text-gray-400 mb-0.5">{icon} <span className="hidden sm:inline">{label}</span></div>
              <div className="font-semibold text-gray-800 text-xs sm:text-sm">{value}</div>
            </div>
          ))}
        </div>

        {/* Message button — always visible for active bookings */}
        {(b.status === 'PENDING' || b.status === 'ACCEPTED' || b.status === 'COMPLETED') && (
          <div className={`pt-2 border-t border-gray-50 flex ${role === 'OWNER' && (b.status === 'PENDING' || b.status === 'ACCEPTED') ? 'justify-between' : 'justify-end'} items-center`}>
            <Link href={`/messages/${b.id}`}
              className="text-xs text-amber-500 hover:text-amber-700 font-semibold transition-colors flex items-center gap-1">
              💬 Message {role === 'OWNER' ? 'walker' : 'owner'}
            </Link>
            {role === 'OWNER' && (b.status === 'PENDING' || b.status === 'ACCEPTED') && (
              <button
                onClick={() => {
                  if (confirm('Cancel this booking?')) updateStatus(b.id, 'CANCELLED')
                }}
                disabled={!!acting}
                className="text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors flex items-center gap-1 disabled:opacity-50">
                🚫 Cancel booking
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
          <div className="pt-2 border-t border-gray-50">
            <button
              onClick={() => updateStatus(b.id, 'COMPLETED')}
              disabled={!!acting}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50 shadow-sm">
              {acting === b.id + 'COMPLETED' ? 'Updating...' : '🏁 Mark as Completed'}
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
