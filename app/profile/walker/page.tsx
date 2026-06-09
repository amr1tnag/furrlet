'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function WalkerProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [form, setForm] = useState({ bio: '', hourlyRate: '', city: '', availability: '' })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/signin'); return }
    const id = (session?.user as any)?.id
    if (!id) return
    fetch(`/api/walkers/${id}`).then(r => r.ok ? r.json() : null).then(p => {
      if (p) setForm({ bio: p.bio, hourlyRate: String(p.hourlyRate), city: p.city, availability: p.availability })
    })
  }, [session, status, router])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/walkers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaved(true)
    setLoading(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const fields: [string, string, string][] = [
    ['city', 'City', 'text'],
    ['hourlyRate', 'Hourly Rate ($)', 'number'],
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Walker Profile</h1>
      <p className="text-gray-500 mb-8">Set up your profile so dog owners can find and book you</p>
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <form onSubmit={submit} className="space-y-4">
          {fields.map(([field, label, type]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} required value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea required rows={4} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Tell dog owners about yourself, your experience, and why you love dogs..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
            <input type="text" required value={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}
              placeholder="e.g. Weekdays 8am-6pm, Weekends flexible"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-amber-500 text-white py-2.5 rounded-xl font-semibold hover:bg-amber-600 transition disabled:opacity-50">
            {saved ? '✅ Saved!' : loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
