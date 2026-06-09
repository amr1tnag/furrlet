'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function WalkerProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [form, setForm] = useState({ bio: '', hourlyRate: '', city: '', availability: '', photoUrl: '' })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/signin'); return }
    const role = (session?.user as any)?.role
    if (status === 'authenticated' && role !== 'WALKER') { router.push('/dashboard'); return }
    const id = (session?.user as any)?.id
    if (!id) return
    fetch(`/api/walkers/${id}`).then(r => r.ok ? r.json() : null).then(p => {
      if (p) setForm({ bio: p.bio, hourlyRate: String(p.hourlyRate), city: p.city, availability: p.availability, photoUrl: p.photoUrl || '' })
    })
  }, [session, status, router])

  async function uploadPhoto(file: File) {
    setUploading(true)
    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: data,
    })
    const json = await res.json()
    setForm(f => ({ ...f, photoUrl: json.secure_url }))
    setUploading(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/walkers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaved(true)
    setLoading(false)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Walker Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Set up your profile so dog owners can find and book you</p>
      </div>

      <div className="card p-8">
        {/* Photo upload */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="relative w-28 h-28 rounded-3xl overflow-hidden cursor-pointer group border-2 border-dashed border-gray-200 hover:border-amber-400 transition-colors bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center"
          >
            {form.photoUrl ? (
              <>
                <Image src={form.photoUrl} alt="Profile" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">Change</span>
                </div>
              </>
            ) : (
              <div className="text-center">
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  <>
                    <div className="text-3xl mb-1">📷</div>
                    <div className="text-xs text-gray-400 font-medium">Upload photo</div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : form.photoUrl ? 'Change photo' : 'Add profile photo'}
            </button>
            <p className="text-xs text-gray-400 mt-0.5">JPG or PNG, max 5MB</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f) }}
          />
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">City</label>
              <input type="text" required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="input" placeholder="Mumbai" />
            </div>
            <div>
              <label className="label">Hourly Rate (₹)</label>
              <input type="number" required min={1} value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))} className="input" placeholder="500" />
            </div>
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea required rows={4} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Tell dog owners about yourself, your experience, and why you love dogs..."
              className="input resize-none" />
          </div>
          <div>
            <label className="label">Availability</label>
            <input type="text" required value={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}
              placeholder="e.g. Weekdays 8am-6pm, Weekends flexible"
              className="input" />
          </div>
          <button type="submit" disabled={loading || uploading} className="btn-primary w-full py-3 text-base">
            {saved ? '✅ Saved!' : loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
