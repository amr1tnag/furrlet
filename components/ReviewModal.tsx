'use client'
import { useState } from 'react'

interface Props {
  booking: { id: string; walker?: { name: string }; dog?: { name: string }; date: string }
  onClose: () => void
  onSubmitted: () => void
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-2 justify-center">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button"
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="text-4xl transition-transform active:scale-110">
          <span style={{ color: i <= (hover || value) ? '#F59E0B' : '#E5E7EB' }}>★</span>
        </button>
      ))}
    </div>
  )
}

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!']

export function ReviewModal({ booking, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!rating) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, rating, comment }),
      })
      if (!res.ok) { setError((await res.json()).error); return }
      onSubmitted()
    } catch { setError('Something went wrong') } finally { setSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Sheet */}
      <div className="relative w-full bg-[#FAF5EE] rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div className="pt-4 pb-2 px-6">
          <div className="w-10 h-1 bg-[#E8D5B0] rounded-full mx-auto" />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-2">⭐</div>
            <h2 className="text-xl font-black text-[#3D2800]">Rate your walk</h2>
            <p className="text-[#9B7B4F] text-sm mt-0.5">
              {booking.dog?.name} with {booking.walker?.name} · {booking.date}
            </p>
          </div>

          <StarPicker value={rating} onChange={setRating} />
          {rating > 0 && (
            <p className="text-center text-sm font-bold text-amber-600 mt-1">{ratingLabels[rating]}</p>
          )}

          <textarea
            rows={2}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience (optional)..."
            className="w-full mt-3 bg-white border border-[#F0D9B0] rounded-2xl px-4 py-3 text-sm text-[#3D2800] placeholder-[#A07840] resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
          />

          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </div>

        {/* Sticky buttons — always visible above bottom nav */}
        <div className="flex gap-3 px-6 pt-3 pb-24 border-t border-[#F0E4D0] bg-[#FAF5EE]">
          <button onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl border-2 border-[#F0D9B0] text-[#6B4F00] font-semibold text-sm">
            Skip
          </button>
          <button onClick={submit} disabled={!rating || submitting}
            className="flex-1 py-3.5 rounded-2xl bg-[#E8960A] hover:bg-[#C47C00] text-white font-bold text-sm disabled:opacity-50 transition-all active:scale-[0.98]">
            {submitting ? 'Submitting...' : 'Submit Review ⭐'}
          </button>
        </div>
      </div>
    </div>
  )
}
