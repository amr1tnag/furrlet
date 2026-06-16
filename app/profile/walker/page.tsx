'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const SUGGESTED_AREAS = ['Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Jayanagar', 'BTM Layout']

interface TimeSlot {
  from: string
  to: string
}

export default function WalkerProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Basic profile
  const [bio, setBio] = useState('')
  const [upiId, setUpiId] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Verification
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null)
  const [aadhaarPreview, setAadhaarPreview] = useState('')
  const aadhaarRef = useRef<HTMLInputElement>(null)

  // Service area
  const [areaSearch, setAreaSearch] = useState('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const filteredSuggested = SUGGESTED_AREAS.filter(a => !selectedAreas.includes(a))

  // Availability
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([{ from: '08:00', to: '18:00' }])

  // Existing profile data
  const [verificationStatus, setVerificationStatus] = useState('NONE')
  const [verified, setVerified] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [togglingActive, setTogglingActive] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/signin'); return }
    const role = (session?.user as any)?.role
    if (status === 'authenticated' && role !== 'WALKER') { router.push('/dashboard'); return }
    const id = (session?.user as any)?.id
    if (!id) return
    fetch(`/api/walkers/${id}`).then(r => r.ok ? r.json() : null).then(p => {
      if (p) {
        setBio(p.bio || '')
        setUpiId(p.upiId || '')
        setPhotoUrl(p.photoUrl || '')
        setVerificationStatus(p.verificationStatus ?? 'NONE')
        setVerified(p.verified ?? false)
        setIsActive(p.isActive ?? true)
        if (p.city) setSelectedAreas([p.city])
      }
    })
    fetch(`/api/reviews/${id}`).then(r => r.ok ? r.json() : []).then(d => setReviews(Array.isArray(d) ? d : []))
  }, [session, status, router])

  async function uploadPhoto(file: File) {
    setUploading(true)
    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: data })
    const json = await res.json()
    setPhotoUrl(json.secure_url)
    setUploading(false)
  }

  function handleAadhaarFile(file: File) {
    setAadhaarFile(file)
    const url = URL.createObjectURL(file)
    setAadhaarPreview(url)
  }

  function addArea(area: string) {
    if (!selectedAreas.includes(area)) setSelectedAreas(s => [...s, area])
    setAreaSearch('')
  }

  function removeArea(area: string) {
    setSelectedAreas(s => s.filter(a => a !== area))
  }

  function toggleDay(day: string) {
    setSelectedDays(s => s.includes(day) ? s.filter(d => d !== day) : [...s, day])
  }

  function addTimeSlot() {
    setTimeSlots(s => [...s, { from: '09:00', to: '17:00' }])
  }

  function updateSlot(idx: number, field: 'from' | 'to', value: string) {
    setTimeSlots(s => s.map((slot, i) => i === idx ? { ...slot, [field]: value } : slot))
  }

  function removeSlot(idx: number) {
    setTimeSlots(s => s.filter((_, i) => i !== idx))
  }

  async function toggleActive() {
    setTogglingActive(true)
    const next = !isActive
    await fetch('/api/walkers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: next }),
    })
    setIsActive(next)
    setTogglingActive(false)
  }

  async function handleSave() {
    setSaving(true)
    const city = selectedAreas[0] || ''
    const availability = `${selectedDays.join(', ')} · ${timeSlots.map(s => `${s.from}–${s.to}`).join(', ')}`

    // Submit verification if file provided
    if (aadhaarFile && verificationStatus === 'NONE') {
      await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaarNumber: 'FILE_UPLOAD' }),
      })
      setVerificationStatus('PENDING')
    }

    await fetch('/api/walkers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio, city, availability, photoUrl, upiId }),
    })

    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2500)
  }

  if (status === 'loading') return (
    <div style={{ backgroundColor: '#FAF5EE' }} className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E8960A', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div style={{ backgroundColor: '#FAF5EE', minHeight: '100vh' }} className="pb-28">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="font-black text-xl" style={{ color: '#3D2800' }}>Furrlet</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden">
          {session?.user?.image ? (
            <Image src={session.user.image} alt="You" width={40} height={40} className="object-cover w-full h-full" />
          ) : (
            <span className="text-lg font-bold" style={{ color: '#E8960A' }}>{session?.user?.name?.[0]?.toUpperCase() ?? '?'}</span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="px-4 mb-6">
        <h1 className="text-2xl font-black" style={{ color: '#3D2800' }}>Complete Your Profile</h1>
        <p className="text-sm mt-1" style={{ color: '#3D2800', opacity: 0.6 }}>Finish setup to start accepting dog walking requests</p>
      </div>

      {/* Status banners */}
      {verified && (
        <div className="mx-4 mb-4 rounded-2xl px-4 py-3 flex items-center gap-3 bg-green-50 border border-green-200">
          <span className="text-xl">✅</span>
          <div>
            <div className="font-bold text-green-800 text-sm">You&apos;re verified!</div>
            <div className="text-green-700 text-xs">Your profile shows a verified badge to dog owners.</div>
          </div>
        </div>
      )}
      {verificationStatus === 'PENDING' && (
        <div className="mx-4 mb-4 rounded-2xl px-4 py-3 flex items-center gap-3 bg-yellow-50 border border-yellow-200">
          <span className="text-xl">🕐</span>
          <div>
            <div className="font-bold text-yellow-800 text-sm">Verification pending</div>
            <div className="text-yellow-700 text-xs">We&apos;ll review your documents and verify your account shortly.</div>
          </div>
        </div>
      )}

      {/* Step 1: ID Verification */}
      <div className="px-4 mb-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0" style={{ backgroundColor: '#E8960A' }}>
              1
            </div>
            <div>
              <h2 className="font-black text-base" style={{ color: '#3D2800' }}>ID Verification (Aadhaar)</h2>
              <p className="text-xs" style={{ color: '#3D2800', opacity: 0.55 }}>Upload your Aadhaar card to get verified</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => aadhaarRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed py-8 flex flex-col items-center gap-2 transition-colors"
            style={aadhaarPreview ? { borderColor: '#E8960A', backgroundColor: '#FDF0E0' } : { borderColor: '#d1d5db', backgroundColor: '#fafafa' }}
          >
            {aadhaarPreview ? (
              <div className="relative w-full max-w-xs mx-auto">
                <Image src={aadhaarPreview} alt="Aadhaar preview" width={320} height={180} className="rounded-xl object-cover w-full" />
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FDF0E0' }}>
                  <svg className="w-6 h-6" style={{ color: '#E8960A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-center" style={{ color: '#3D2800' }}>UPLOAD CARD IMAGE</p>
                  <p className="text-xs text-center mt-0.5" style={{ color: '#3D2800', opacity: 0.55 }}>Front &amp; Back (Max 5MB)</p>
                </div>
              </>
            )}
          </button>
          <input
            ref={aadhaarRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleAadhaarFile(f) }}
          />
          {aadhaarPreview && (
            <button
              type="button"
              onClick={() => { setAadhaarFile(null); setAadhaarPreview('') }}
              className="mt-2 text-xs font-semibold w-full text-center"
              style={{ color: '#E8960A' }}
            >
              Remove &amp; re-upload
            </button>
          )}
        </div>
      </div>

      {/* Step 2: Service Area */}
      <div className="px-4 mb-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0" style={{ backgroundColor: '#E8960A' }}>
              2
            </div>
            <div>
              <h2 className="font-black text-base" style={{ color: '#3D2800' }}>Service Area</h2>
              <p className="text-xs" style={{ color: '#3D2800', opacity: 0.55 }}>Select the areas where you&apos;ll walk dogs</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#3D2800', opacity: 0.4 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search areas..."
              value={areaSearch}
              onChange={e => setAreaSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && areaSearch.trim()) { addArea(areaSearch.trim()); e.preventDefault() } }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-none outline-none text-sm font-medium"
              style={{ backgroundColor: '#FDF0E0', color: '#3D2800' }}
            />
          </div>

          {/* Selected areas */}
          {selectedAreas.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedAreas.map(area => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full text-white"
                  style={{ backgroundColor: '#E8960A' }}
                >
                  {area}
                  <button onClick={() => removeArea(area)} className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/50">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Suggested areas */}
          {filteredSuggested.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: '#3D2800', opacity: 0.5 }}>Suggested</p>
              <div className="flex flex-wrap gap-2">
                {filteredSuggested
                  .filter(a => !areaSearch || a.toLowerCase().includes(areaSearch.toLowerCase()))
                  .map(area => (
                    <button
                      key={area}
                      onClick={() => addArea(area)}
                      className="text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-colors"
                      style={{ borderColor: '#E8960A', color: '#E8960A' }}
                    >
                      + {area}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Availability */}
      <div className="px-4 mb-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0" style={{ backgroundColor: '#E8960A' }}>
              3
            </div>
            <div>
              <h2 className="font-black text-base" style={{ color: '#3D2800' }}>Availability</h2>
              <p className="text-xs" style={{ color: '#3D2800', opacity: 0.55 }}>Choose your working days and hours</p>
            </div>
          </div>

          {/* Day picker */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {DAYS.map(day => {
              const active = selectedDays.includes(day)
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className="px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-1"
                  style={active ? { backgroundColor: '#E8960A', borderColor: '#E8960A', color: 'white' } : { borderColor: '#e5e7eb', color: '#3D2800' }}
                >
                  {active && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {day}
                </button>
              )
            })}
          </div>

          {/* Time slots */}
          <div className="space-y-3">
            {timeSlots.map((slot, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 rounded-xl p-3" style={{ backgroundColor: '#FDF0E0' }}>
                  <span className="text-xs font-semibold" style={{ color: '#3D2800', opacity: 0.6 }}>From</span>
                  <input
                    type="time"
                    value={slot.from}
                    onChange={e => updateSlot(idx, 'from', e.target.value)}
                    className="flex-1 bg-transparent text-sm font-bold outline-none"
                    style={{ color: '#3D2800' }}
                  />
                  <span className="text-xs font-semibold" style={{ color: '#3D2800', opacity: 0.6 }}>To</span>
                  <input
                    type="time"
                    value={slot.to}
                    onChange={e => updateSlot(idx, 'to', e.target.value)}
                    className="flex-1 bg-transparent text-sm font-bold outline-none"
                    style={{ color: '#3D2800' }}
                  />
                </div>
                {timeSlots.length > 1 && (
                  <button
                    onClick={() => removeSlot(idx)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-100 flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add another slot */}
          <button
            onClick={addTimeSlot}
            className="mt-3 w-full py-3 rounded-xl border-2 border-dashed text-sm font-bold transition-colors"
            style={{ borderColor: '#E8960A', color: '#E8960A' }}
          >
            + ADD ANOTHER SLOT
          </button>
        </div>
      </div>

      {/* Bio & UPI (optional extra) */}
      <div className="px-4 mb-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-black text-base mb-4" style={{ color: '#3D2800' }}>Profile Details</h2>

          {/* Photo upload */}
          <div className="flex items-center gap-4 mb-5">
            <button
              onClick={() => fileRef.current?.click()}
              className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-dashed"
              style={photoUrl ? { borderColor: '#E8960A' } : { borderColor: '#d1d5db', backgroundColor: '#FDF0E0' }}
            >
              {photoUrl ? (
                <Image src={photoUrl} alt="Profile" fill className="object-cover" />
              ) : uploading ? (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E8960A', borderTopColor: 'transparent' }} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full gap-0.5">
                  <span className="text-xl">📷</span>
                </div>
              )}
            </button>
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-sm font-bold block"
                style={{ color: '#E8960A' }}
              >
                {uploading ? 'Uploading...' : photoUrl ? 'Change photo' : 'Add profile photo'}
              </button>
              <p className="text-xs mt-0.5" style={{ color: '#3D2800', opacity: 0.5 }}>JPG or PNG, max 5MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f) }} />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3D2800' }}>Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell dog owners about yourself, your experience with dogs..."
              className="w-full px-4 py-3 rounded-xl border-none outline-none text-sm font-medium resize-none"
              style={{ backgroundColor: '#FDF0E0', color: '#3D2800' }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3D2800' }}>UPI ID <span style={{ opacity: 0.5, fontWeight: 400 }}>(for receiving payments)</span></label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">💸</span>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-none outline-none text-sm font-medium"
                style={{ backgroundColor: '#FDF0E0', color: '#3D2800' }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: '#3D2800', opacity: 0.5 }}>Payouts will be sent here after each completed walk (85% of booking value).</p>
          </div>
        </div>
      </div>

      {/* Pause / resume profile */}
      <div className="px-4 mb-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl ${isActive ? 'bg-green-50' : 'bg-gray-100'}`}>
                {isActive ? '✅' : '⏸️'}
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: '#3D2800' }}>{isActive ? 'Profile is live' : 'Profile is paused'}</div>
                <div className="text-xs mt-0.5" style={{ color: '#3D2800', opacity: 0.5 }}>
                  {isActive ? 'Dog owners can find and book you.' : 'You are hidden from search. No new bookings.'}
                </div>
              </div>
            </div>
            <button
              onClick={toggleActive}
              disabled={togglingActive}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={isActive ? { backgroundColor: '#f3f4f6', color: '#374151' } : { backgroundColor: '#22c55e', color: 'white' }}
            >
              {togglingActive ? '...' : isActive ? '⏸ Pause' : '▶ Go Live'}
            </button>
          </div>
        </div>
      </div>

      {/* My reviews */}
      {reviews.length > 0 && (
        <div className="px-4 mb-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-black" style={{ color: '#3D2800' }}>My Reviews</h2>
                <p className="text-xs mt-0.5" style={{ color: '#3D2800', opacity: 0.5 }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ backgroundColor: '#FDF0E0' }}>
                <span style={{ color: '#E8960A' }}>★</span>
                <span className="font-black text-sm" style={{ color: '#3D2800' }}>
                  {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                </span>
                <span className="text-xs" style={{ color: '#3D2800', opacity: 0.5 }}>avg</span>
              </div>
            </div>
            <div className="space-y-4">
              {reviews.map((r: any) => (
                <div key={r.id} className="border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: '#f3f4f6' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm" style={{ color: '#3D2800' }}>{r.booking?.owner?.name ?? 'Dog Owner'}</span>
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className="text-sm" style={{ color: s <= r.rating ? '#E8960A' : '#e5e7eb' }}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs mb-1.5" style={{ color: '#3D2800', opacity: 0.5 }}>
                    Walked {r.booking?.dog?.name ?? 'a dog'} · {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {r.comment && <p className="text-sm leading-relaxed" style={{ color: '#3D2800', opacity: 0.7 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Save button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3" style={{ backgroundColor: '#FAF5EE' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-full font-black text-white text-base shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
          style={{ backgroundColor: '#E8960A' }}
        >
          {saved ? '✅ Saved!' : saving ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
          ) : (
            <>Save &amp; Go Online ⚡</>
          )}
        </button>
      </div>
    </div>
  )
}
