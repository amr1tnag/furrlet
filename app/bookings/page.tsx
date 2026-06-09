'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  DECLINED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className={`text-2xl transition ${(hover || value) >= s ? 'text-yellow-400' : 'text-gray-300'}`}>
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

  const load = () => fetch('/api/bookings').then(r => r.json()).then(d => setBookings(Array.isArray(d) ? d : []))
  useEffect(() => { if (session) load() }, [session])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
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

              {/* Walker actions */}
              {role === 'WALKER' && b.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(b.id, 'ACCEPTED')} className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-600 transition">Accept</button>
                  <button onClick={() => updateStatus(b.id, 'DECLINED')} className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-600 transition">Decline</button>
                </div>
              )}
              {role === 'WALKER' && b.status === 'ACCEPTED' && (
                <button onClick={() => updateStatus(b.id, 'COMPLETED')} className="bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-600 transition">Mark Completed</button>
              )}

              {/* Owner review */}
              {role === 'OWNER' && b.status === 'COMPLETED' && (
                b.review ? (
                  <div className="mt-3 bg-yellow-50 rounded-xl p-3">
                    <div className="text-yellow-500 text-sm font-medium mb-1">
                      {'★'.repeat(b.review.rating)}{'☆'.repeat(5 - b.review.rating)} Your review
                    </div>
                    {b.review.comment && <p className="text-gray-600 text-sm">{b.review.comment}</p>}
                  </div>
                ) : reviewing === b.id ? (
                  <div className="mt-3 bg-amber-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Rate your experience</p>
                    <StarPicker value={reviewForm.rating} onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
                    <textarea rows={2} value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      placeholder="Leave a comment (optional)..."
                      className="w-full mt-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => submitReview(b.id)} disabled={!reviewForm.rating || submitting}
                        className="bg-amber-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-amber-600 transition disabled:opacity-50">
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                      <button onClick={() => setReviewing(null)} className="text-gray-500 text-sm hover:text-gray-700">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setReviewing(b.id)} className="mt-2 text-amber-500 text-sm font-medium hover:text-amber-600 transition">
                    ⭐ Leave a review
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
