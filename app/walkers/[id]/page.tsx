'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

declare global {
  interface Window { Razorpay: any }
}

export default function WalkerDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [walker, setWalker] = useState<any>(null)
  const [dogs, setDogs] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [form, setForm] = useState({ dogId: '', date: '', duration: '60' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [repeatBanner, setRepeatBanner] = useState(false)

  useEffect(() => {
    fetch(`/api/walkers/${params.id}`).then(r => r.json()).then(setWalker)
    fetch('/api/dogs').then(r => r.json()).then(d => {
      setDogs(Array.isArray(d) ? d : [])
      const dogId = searchParams.get('dogId')
      const duration = searchParams.get('duration')
      if (dogId || duration) {
        setForm(f => ({ ...f, dogId: dogId || f.dogId, duration: duration || f.duration }))
        setRepeatBanner(true)
        setTimeout(() => document.getElementById('book-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
      }
    })
    fetch(`/api/reviews/${params.id}`).then(r => r.json()).then(d => setReviews(Array.isArray(d) ? d : []))
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [params.id])

  async function book(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      // Step 1: Create Razorpay order
      const orderRes = await fetch('/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walkerId: params.id, ...form }),
      })
      const order = await orderRes.json()
      if (!orderRes.ok) throw new Error(order.error)

      // Step 2: Open Razorpay checkout
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Furrlet',
        description: `Dog walk booking`,
        image: 'https://furrlet.in/favicon.ico',
        order_id: order.orderId,
        handler: async (response: any) => {
          // Step 3: Verify payment & create booking
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              walkerId: params.id,
              ...form,
            }),
          })
          if (verifyRes.ok) {
            setSuccess(true)
            setTimeout(() => router.push('/bookings'), 2000)
          }
        },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#f59e0b' },
        modal: { ondismiss: () => setLoading(false) },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      setLoading(false)
    }
  }

  if (!walker) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const priceINR = Math.round((walker.hourlyRate * parseInt(form.duration)) / 60)
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(walker.city)}&zoom=13`

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Walker info card */}
      <div className="card p-5 sm:p-8 mb-6">
        <div className="flex items-start gap-3 sm:gap-4 mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl overflow-hidden flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0 shadow-sm">
            {walker.photoUrl
              ? <Image src={walker.photoUrl} alt={walker.user.name} width={80} height={80} className="object-cover w-full h-full" />
              : '🦮'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-gray-900">{walker.user.name}</h1>
              {walker.verified && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold px-2 py-1 rounded-lg">
                  ✓ Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-0.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {walker.city}
            </div>
            {walker.rating > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={`text-sm ${s <= Math.round(walker.rating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-700">{walker.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({walker.reviewCount} reviews)</span>
              </div>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-black text-gray-900">₹{walker.hourlyRate}</div>
            <div className="text-gray-400 text-sm">/hr</div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">About</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{walker.bio}</p>
          </div>
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Availability</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-soft" />
              <p className="text-gray-600 text-sm">{walker.availability}</p>
            </div>
          </div>
        </div>

        {/* Map */}
        {mapsKey && (
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Location</h2>
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <iframe src={mapSrc} width="100%" height="240" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
        )}
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="card p-5 sm:p-6 mb-6">
          <h2 className="font-black text-gray-900 mb-4">Reviews <span className="text-gray-400 font-normal text-sm">({reviews.length})</span></h2>
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-800 text-sm">{r.booking.owner.name}</span>
                  <span className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">Walked {r.booking.dog.name} · {new Date(r.createdAt).toLocaleDateString()}</p>
                {r.comment && <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking form */}
      <div className="card p-8" id="book-form">
        {repeatBanner && (
          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <span>🔁</span>
            <p className="text-amber-800 text-sm font-semibold">Pre-filled from your last booking — just pick a new date!</p>
          </div>
        )}
        <h2 className="font-black text-gray-900 text-xl mb-6">Book a Walk</h2>
        {success ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-green-600 font-bold text-lg">Payment successful!</p>
            <p className="text-gray-400 text-sm mt-1">Booking request sent. Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={book} className="space-y-5">
            <div>
              <label className="label">Select Dog</label>
              <select required value={form.dogId} onChange={e => setForm(f => ({ ...f, dogId: e.target.value }))} className="input">
                <option value="">Choose a dog...</option>
                {dogs.map((d: any) => <option key={d.id} value={d.id}>{d.name} ({d.breed})</option>)}
              </select>
              {dogs.length === 0 && (
                <p className="text-xs text-gray-400 mt-1.5">No dogs added yet. <a href="/profile/dogs" className="text-amber-500 font-medium">Add a dog first →</a></p>
              )}
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" required value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="input" />
            </div>
            <div>
              <label className="label">Duration</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[['30', '30 min'], ['60', '1 hr'], ['90', '1.5 hr'], ['120', '2 hr']].map(([v, l]) => (
                  <button key={v} type="button" onClick={() => setForm(f => ({ ...f, duration: v }))}
                    className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.duration === v ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Total to pay</div>
                  <div className="text-3xl font-black text-gray-900 mt-0.5">₹{priceINR}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{form.duration} min walk · secured by Razorpay</div>
                </div>
                <div className="text-4xl">🔒</div>
              </div>
            </div>

            <button type="submit" disabled={loading || dogs.length === 0}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
              ) : (
                <>Pay ₹{priceINR} & Book</>
              )}
            </button>
            <p className="text-center text-xs text-gray-400">UPI · Cards · Netbanking · Wallets accepted</p>
          </form>
        )}
      </div>
    </div>
  )
}
