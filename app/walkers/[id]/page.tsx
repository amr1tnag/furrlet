'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WalkerDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [walker, setWalker] = useState<any>(null)
  const [dogs, setDogs] = useState<any[]>([])
  const [form, setForm] = useState({ dogId: '', date: '', duration: '60' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/walkers/${params.id}`).then(r => r.json()).then(setWalker)
    fetch('/api/dogs').then(r => r.json()).then(d => setDogs(Array.isArray(d) ? d : []))
  }, [params.id])

  async function book(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walkerId: params.id, ...form }),
    })
    if (res.ok) { setSuccess(true); setTimeout(() => router.push('/bookings'), 1500) }
    setLoading(false)
  }

  if (!walker) return <div className="flex justify-center py-20 text-gray-500">Loading...</div>

  const price = ((walker.hourlyRate * parseInt(form.duration)) / 60).toFixed(2)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-3xl">🦮</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{walker.user.name}</h1>
            <p className="text-gray-500">📍 {walker.city}</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-2xl font-bold text-amber-500">${walker.hourlyRate}/hr</div>
            {walker.rating > 0 && <div className="text-yellow-500">⭐ {walker.rating.toFixed(1)}</div>}
          </div>
        </div>
        <div className="mb-4">
          <h2 className="font-semibold text-gray-700 mb-1">About</h2>
          <p className="text-gray-600">{walker.bio}</p>
        </div>
        <div>
          <h2 className="font-semibold text-gray-700 mb-1">Availability</h2>
          <p className="text-gray-600">{walker.availability}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Book a Walk</h2>
        {success ? (
          <div className="text-center py-8 text-green-600 font-semibold">✅ Booking request sent! Redirecting...</div>
        ) : (
          <form onSubmit={book} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Dog</label>
              <select required value={form.dogId} onChange={e => setForm(f => ({ ...f, dogId: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="">Choose a dog...</option>
                {dogs.map((d: any) => <option key={d.id} value={d.id}>{d.name} ({d.breed})</option>)}
              </select>
              {dogs.length === 0 && <p className="text-xs text-gray-400 mt-1">No dogs added yet. <a href="/profile/dogs" className="text-amber-500">Add a dog first.</a></p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                {[['30', '30 minutes'], ['60', '1 hour'], ['90', '1.5 hours'], ['120', '2 hours']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 flex justify-between items-center">
              <span className="text-gray-700 font-medium">Estimated total</span>
              <span className="text-2xl font-bold text-amber-600">${price}</span>
            </div>
            <button type="submit" disabled={loading || dogs.length === 0}
              className="w-full bg-amber-500 text-white py-3 rounded-xl font-semibold hover:bg-amber-600 transition disabled:opacity-50">
              {loading ? 'Booking...' : 'Request Booking'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
