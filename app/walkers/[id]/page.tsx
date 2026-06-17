'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

declare global {
  interface Window { Razorpay: any }
}

const TIERS = [
  { duration: '30', label: '30 Min', price: 99, tier: 'LITE', featured: false },
  { duration: '45', label: '45 Min', price: 149, tier: 'POPULAR', featured: true },
  { duration: '60', label: '60 Min', price: 199, tier: 'PRO', featured: false },
]

const SKILL_TAGS = ['LABRADOR SPECIALIST', '5+ YEARS EXP', 'FIRST AID CERTIFIED']

export default function WalkerDetail({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [walker, setWalker] = useState<any>(null)
  const [dogs, setDogs] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [selectedDuration, setSelectedDuration] = useState('45')
  const [loading, setLoading] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null)
  const [showBookModal, setShowBookModal] = useState(false)
  const [form, setForm] = useState({ dogId: '', date: '', address: '' })
  const [repeatBanner, setRepeatBanner] = useState(false)

  useEffect(() => {
    fetch(`/api/walkers/${params.id}`).then(r => r.json()).then(setWalker)
    fetch('/api/dogs').then(r => r.json()).then(d => {
      setDogs(Array.isArray(d) ? d : [])
      const dogId = searchParams.get('dogId')
      const duration = searchParams.get('duration')
      if (dogId || duration) {
        setForm(f => ({ ...f, dogId: dogId || f.dogId }))
        if (duration) setSelectedDuration(duration)
        setRepeatBanner(true)
      }
    })
    fetch(`/api/reviews/${params.id}`).then(r => r.json()).then(d => setReviews(Array.isArray(d) ? d : []))
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
      const orderRes = await fetch('/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walkerId: params.id, ...form, duration: selectedDuration }),
      })
      const order = await orderRes.json()
      if (!orderRes.ok) throw new Error(order.error)

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Furrlet',
        description: `Dog walk booking`,
        image: 'https://furrlet.in/favicon.ico',
        order_id: order.orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, walkerId: params.id, ...form, duration: selectedDuration }),
          })
          if (verifyRes.ok) {
            const booking = await verifyRes.json()
            setConfirmedBooking(booking)
            setShowBookModal(false)
          }
        },
        prefill: { name: session?.user?.name || '', email: session?.user?.email || '', contact: '' },
        theme: { color: '#E8960A' },
        modal: { ondismiss: () => setLoading(false) },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      setLoading(false)
    }
  }

  if (!walker) return (
    <div style={{ backgroundColor: '#FAF5EE' }} className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E8960A', borderTopColor: 'transparent' }} />
    </div>
  )

  const priceINR = TIERS.find(t => t.duration === selectedDuration)?.price ?? 149

  return (
    <div style={{ backgroundColor: '#FAF5EE', minHeight: '100vh' }} className="pb-40 sm:pb-28">
      {/* Top nav */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
        >
          <svg className="w-5 h-5" style={{ color: '#3D2800' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden">
          {session?.user?.image ? (
            <Image src={session.user.image} alt="You" width={40} height={40} className="object-cover w-full h-full" />
          ) : (
            <span className="text-lg font-bold" style={{ color: '#E8960A' }}>{session?.user?.name?.[0]?.toUpperCase() ?? '?'}</span>
          )}
        </div>
      </div>

      {/* Profile hero */}
      <div className="flex flex-col items-center px-4 pt-2 pb-6">
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden flex items-center justify-center text-5xl shadow-md">
            {walker.photoUrl
              ? <Image src={walker.photoUrl} alt={walker.user.name} width={112} height={112} className="object-cover w-full h-full" />
              : '🦮'}
          </div>
          {walker.verified && (
            <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-sm border-2 border-white">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-black mb-1" style={{ color: '#3D2800' }}>{walker.user.name}</h1>

        <div className="flex items-center gap-1 text-sm mb-3" style={{ color: '#3D2800', opacity: 0.6 }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {walker.city}
        </div>

        {walker.rating > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2" style={{ borderColor: '#E8960A' }}>
            <span style={{ color: '#E8960A' }}>★</span>
            <span className="font-bold text-sm" style={{ color: '#3D2800' }}>{walker.rating.toFixed(1)} ({walker.reviewCount} reviews)</span>
          </div>
        )}
      </div>

      {/* Walking Tiers */}
      <div className="px-4 mb-6">
        <h2 className="text-base font-black mb-3" style={{ color: '#3D2800' }}>Walking Tiers</h2>
        <div className="grid grid-cols-3 gap-3">
          {TIERS.map(tier => (
            <button
              key={tier.duration}
              onClick={() => setSelectedDuration(tier.duration)}
              className="rounded-2xl py-4 px-2 flex flex-col items-center gap-1 border-2 transition-all"
              style={
                tier.featured
                  ? { backgroundColor: '#E8960A', borderColor: '#E8960A' }
                  : selectedDuration === tier.duration
                  ? { backgroundColor: '#FDF0E0', borderColor: '#E8960A', color: '#3D2800' }
                  : { backgroundColor: 'white', borderColor: '#e5e7eb' }
              }
            >
              <span className="text-sm font-bold" style={{ color: tier.featured ? 'white' : '#3D2800' }}>{tier.label}</span>
              <span className="text-lg font-black" style={{ color: tier.featured ? 'white' : '#E8960A' }}>₹{tier.price}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={
                  tier.featured
                    ? { backgroundColor: 'rgba(255,255,255,0.25)', color: 'white' }
                    : { backgroundColor: '#FDF0E0', color: '#E8960A' }
                }
              >
                {tier.tier}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* About section */}
      <div className="px-4 mb-6">
        <h2 className="text-base font-black mb-3" style={{ color: '#3D2800' }}>About {walker.user.name.split(' ')[0]}</h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#3D2800', opacity: 0.75 }}>
            {walker.bio || `${walker.user.name} is a passionate dog lover with years of experience walking and caring for dogs of all breeds.`}
          </p>
          <div className="flex flex-wrap gap-2">
            {SKILL_TAGS.map(tag => (
              <span key={tag} className="text-xs font-bold px-3 py-1.5 rounded-full border-2" style={{ borderColor: '#E8960A', color: '#E8960A' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      {reviews.length > 0 && (
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black" style={{ color: '#3D2800' }}>Recent Reviews</h2>
            <button className="text-sm font-semibold" style={{ color: '#E8960A' }}>View All</button>
          </div>
          <div className="space-y-3">
            {reviews.slice(0, 3).map(r => (
              <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center font-bold text-sm" style={{ color: '#E8960A' }}>
                    {r.booking?.owner?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm" style={{ color: '#3D2800' }}>{r.booking?.owner?.name ?? 'Dog Owner'}</div>
                    <div className="text-xs" style={{ color: '#3D2800', opacity: 0.5 }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className="text-sm" style={{ color: s <= r.rating ? '#E8960A' : '#e5e7eb' }}>★</span>
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm leading-relaxed" style={{ color: '#3D2800', opacity: 0.7 }}>&ldquo;{r.comment}&rdquo;</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmed booking state */}
      {confirmedBooking && (
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">✅</div>
              <h3 className="font-black text-xl" style={{ color: '#3D2800' }}>Booking Confirmed!</h3>
              <p className="text-sm mt-1" style={{ color: '#3D2800', opacity: 0.6 }}>Your booking has been sent to {walker.user.name}.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/bookings" className="flex-1 text-center py-3 text-sm font-bold rounded-2xl text-white" style={{ backgroundColor: '#E8960A' }}>
                View Bookings
              </Link>
              <Link href={`/messages/${confirmedBooking.id}`} className="flex-1 text-center py-3 text-sm font-bold rounded-2xl border-2" style={{ borderColor: '#E8960A', color: '#E8960A' }}>
                Message Walker
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Book modal overlay */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10">
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />
            <h2 className="font-black text-xl mb-5" style={{ color: '#3D2800' }}>Book {walker.user.name}</h2>

            {repeatBanner && (
              <div className="mb-4 rounded-xl px-4 py-3 flex items-center gap-2" style={{ backgroundColor: '#FDF0E0' }}>
                <span>🔁</span>
                <p className="text-sm font-semibold" style={{ color: '#E8960A' }}>Pre-filled from your last booking — just pick a new date!</p>
              </div>
            )}

            <form onSubmit={book} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3D2800' }}>Select Dog</label>
                <select
                  required
                  value={form.dogId}
                  onChange={e => setForm(f => ({ ...f, dogId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-none outline-none text-sm font-medium"
                  style={{ backgroundColor: '#FDF0E0', color: '#3D2800' }}
                >
                  <option value="">Choose a dog...</option>
                  {dogs.map((d: any) => <option key={d.id} value={d.id}>{d.name} ({d.breed})</option>)}
                </select>
                {dogs.length === 0 && (
                  <p className="text-xs mt-1" style={{ color: '#E8960A' }}>No dogs added yet. <a href="/profile/dogs">Add a dog first →</a></p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3D2800' }}>Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl border-none outline-none text-sm font-medium"
                  style={{ backgroundColor: '#FDF0E0', color: '#3D2800' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3D2800' }}>Pickup Address</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Flat 4B, Sunshine Apartments, MG Road"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-none outline-none text-sm font-medium resize-none"
                  style={{ backgroundColor: '#FDF0E0', color: '#3D2800' }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="flex-1 py-3.5 rounded-2xl border-2 font-bold text-sm"
                  style={{ borderColor: '#e5e7eb', color: '#3D2800' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || dogs.length === 0}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: '#E8960A' }}
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                  ) : (
                    <>Pay ₹{priceINR} &amp; Book</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sticky Book Now — mobile: above bottom nav, desktop: at page bottom */}
      {!confirmedBooking && (
        <>
          <div className="sm:hidden fixed bottom-[72px] left-0 right-0 px-4 py-2" style={{ backgroundColor: '#FAF5EE' }}>
            <button onClick={() => setShowBookModal(true)}
              className="w-full py-4 rounded-full font-black text-white text-base shadow-lg"
              style={{ backgroundColor: '#E8960A' }}>
              Book Now 📅
            </button>
          </div>
          <div className="hidden sm:block fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3" style={{ backgroundColor: '#FAF5EE' }}>
            <button onClick={() => setShowBookModal(true)}
              className="w-full py-4 rounded-full font-black text-white text-base shadow-lg"
              style={{ backgroundColor: '#E8960A' }}>
              Book Now 📅
            </button>
          </div>
        </>
      )}
    </div>
  )
}
