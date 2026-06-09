'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const LiveTrackingMap = dynamic(() => import('@/components/LiveTrackingMap'), { ssr: false })

function useCountdown(walkStartedAt: string | null, durationMinutes: number) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const warnedRef = useRef(false)

  useEffect(() => {
    if (!walkStartedAt) { setSecondsLeft(null); warnedRef.current = false; return }
    function tick() {
      const startMs = new Date(walkStartedAt!).getTime()
      const totalMs = durationMinutes * 60 * 1000
      const remaining = Math.max(0, Math.floor((totalMs - (Date.now() - startMs)) / 1000))
      setSecondsLeft(remaining)
      if (remaining <= 600 && remaining > 594 && !warnedRef.current) {
        warnedRef.current = true
        if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 400])
        if (Notification.permission === 'granted')
          new Notification('🐾 Walk ending soon!', { body: '10 minutes left on this walk.', icon: '/favicon.ico' })
      }
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [walkStartedAt, durationMinutes])

  return secondsLeft
}

function CountdownDisplay({ secondsLeft, duration }: { secondsLeft: number; duration: number }) {
  const pct = Math.max(0, Math.min(100, (secondsLeft / (duration * 60)) * 100))
  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const isWarning = secondsLeft <= 600 && secondsLeft > 0
  const isOver = secondsLeft === 0
  const circumference = 2 * Math.PI * 40
  const strokeDash = (pct / 100) * circumference

  return (
    <div className={`rounded-2xl p-5 text-center transition-colors duration-500 ${
      isOver ? 'bg-blue-50 border border-blue-100' :
      isWarning ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-100'
    }`}>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
        {isOver ? 'Walk Completed' : isWarning ? '⚠️ Ending Soon' : 'Time Remaining'}
      </p>
      <div className="relative w-28 h-28 mx-auto mb-3">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <circle cx="50" cy="50" r="40" fill="none"
            stroke={isOver ? '#3b82f6' : isWarning ? '#f59e0b' : '#22c55e'}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference}`}
            className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isOver ? <span className="text-3xl">🏁</span> : (
            <>
              <span className={`text-2xl font-black tabular-nums ${isWarning ? 'text-amber-600' : 'text-gray-900'}`}>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
              <span className="text-xs text-gray-400 mt-0.5">left</span>
            </>
          )}
        </div>
      </div>
      {isWarning && !isOver && <p className="text-amber-600 font-semibold text-sm animate-pulse">Wrap up soon!</p>}
      {isOver && <p className="text-blue-600 font-semibold text-sm">Time&apos;s up — get the end OTP from your walker!</p>}
    </div>
  )
}

function OtpInput({ length = 4, onComplete }: { length?: number; onComplete: (otp: string) => void }) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''))
  const refs = useRef<(HTMLInputElement | null)[]>([])

  function handleChange(i: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = d
    setDigits(next)
    if (d && i < length - 1) refs.current[i + 1]?.focus()
    if (next.every(x => x)) onComplete(next.join(''))
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((d, i) => (
        <input key={i} ref={el => { refs.current[i] = el }}
          type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-14 h-14 text-center text-2xl font-black border-2 border-gray-200 rounded-2xl focus:border-amber-400 focus:outline-none transition-colors bg-white shadow-sm" />
      ))}
    </div>
  )
}

export default function BookingTracking() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [booking, setBooking] = useState<any>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number; trackingActive: boolean } | null>(null)
  const [walkStartedAt, setWalkStartedAt] = useState<string | null>(null)
  const [tracking, setTracking] = useState(false)
  const [geoError, setGeoError] = useState('')
  const watchIdRef = useRef<number | null>(null)

  // OTP states
  const [startOtpError, setStartOtpError] = useState('')
  const [startOtpVerified, setStartOtpVerified] = useState(false)
  const [endOtp, setEndOtp] = useState<string | null>(null)
  const [endOtpError, setEndOtpError] = useState('')
  const [endOtpVerifying, setEndOtpVerifying] = useState(false)
  const [walkCompleted, setWalkCompleted] = useState(false)

  const secondsLeft = useCountdown(walkStartedAt, booking?.duration ?? 30)

  const loadBooking = useCallback(() => {
    fetch(`/api/bookings/${id}`).then(r => r.json()).then(d => {
      setBooking(d)
      if (d.walkStartedAt) { setWalkStartedAt(d.walkStartedAt); setStartOtpVerified(true) }
      if (d.status === 'COMPLETED') setWalkCompleted(true)
    })
  }, [id])

  useEffect(() => { loadBooking() }, [loadBooking])

  // Walker GPS tracking
  function startGps() {
    if (!navigator.geolocation) { setGeoError('Geolocation not supported'); return }
    setTracking(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        setLocation({ lat, lng, trackingActive: true })
        fetch(`/api/bookings/${id}/location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng, active: true }),
        })
      },
      err => setGeoError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000 }
    )
  }

  function stopGps() {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    setTracking(false)
    fetch(`/api/bookings/${id}/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: null, lng: null, active: false }),
    })
  }

  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
  }, [])

  // Owner polls location
  const pollLocation = useCallback(() => {
    fetch(`/api/bookings/${id}/location`).then(r => r.json()).then(d => {
      if (d.lat && d.lng) setLocation({ lat: d.lat, lng: d.lng, trackingActive: d.trackingActive })
      if (d.walkStartedAt) { setWalkStartedAt(d.walkStartedAt); setStartOtpVerified(true) }
    })
  }, [id])

  useEffect(() => {
    if (role !== 'OWNER') return
    pollLocation()
    const iv = setInterval(pollLocation, 5000)
    return () => clearInterval(iv)
  }, [role, pollLocation])

  // Walker: verify start OTP
  async function verifyStartOtp(otp: string) {
    setStartOtpError('')
    const res = await fetch(`/api/bookings/${id}/otp`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'start', otp }),
    }).then(r => r.json())
    if (res.success) { setStartOtpVerified(true); setWalkStartedAt(new Date().toISOString()); startGps() }
    else setStartOtpError(res.error || 'Incorrect OTP — try again')
  }

  // Walker: generate end OTP
  async function generateEndOtp() {
    stopGps()
    const res = await fetch(`/api/bookings/${id}/otp`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'end' }),
    }).then(r => r.json())
    if (res.endOtp) setEndOtp(res.endOtp)
  }

  // Owner: verify end OTP
  async function verifyEndOtp(otp: string) {
    setEndOtpVerifying(true)
    setEndOtpError('')
    const res = await fetch(`/api/bookings/${id}/otp`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'end', otp }),
    }).then(r => r.json())
    setEndOtpVerifying(false)
    if (res.success) setWalkCompleted(true)
    else setEndOtpError(res.error || 'Incorrect OTP — try again')
  }

  if (!booking) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const walkerName = booking.walker?.name ?? 'Walker'
  const isAccepted = booking.status === 'ACCEPTED'

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link href="/bookings" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to bookings
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-amber-200">🐾</div>
        <div>
          <h1 className="text-xl font-black text-gray-900">Live Walk</h1>
          <p className="text-gray-400 text-sm">{booking.dog?.name} · {booking.date} · {booking.duration} min</p>
        </div>
        {startOtpVerified && !walkCompleted && (
          <span className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Walk in Progress
          </span>
        )}
        {walkCompleted && (
          <span className="ml-auto bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
            🏁 Completed
          </span>
        )}
      </div>

      {/* COMPLETED state */}
      {walkCompleted && (
        <div className="card p-8 text-center mb-5">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-xl font-black text-gray-900 mb-1">Walk Completed!</h2>
          <p className="text-gray-400 text-sm mb-5">Great walk! Don&apos;t forget to leave a review.</p>
          <Link href="/bookings" className="btn-primary inline-block">View Bookings →</Link>
        </div>
      )}

      {/* Countdown */}
      {!walkCompleted && walkStartedAt && secondsLeft !== null && (
        <div className="mb-5">
          <CountdownDisplay secondsLeft={secondsLeft} duration={booking.duration} />
        </div>
      )}

      {/* ─── WALKER FLOW ─────────────────────────────────────────────────── */}
      {role === 'WALKER' && !walkCompleted && isAccepted && (
        <div className="card p-6 mb-5">
          {/* Step 1: Enter start OTP */}
          {!startOtpVerified && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">🔐</div>
                <div>
                  <h2 className="font-bold text-gray-900">Enter Start OTP</h2>
                  <p className="text-gray-400 text-sm">Ask the owner for their 4-digit OTP to begin the walk</p>
                </div>
              </div>
              <OtpInput onComplete={verifyStartOtp} />
              {startOtpError && (
                <p className="text-red-500 text-sm text-center mt-3 font-medium">{startOtpError}</p>
              )}
            </>
          )}

          {/* Step 2: Walk in progress */}
          {startOtpVerified && !endOtp && (
            <>
              {geoError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{geoError}</div>
              )}
              {location && (
                <div className="mb-4">
                  <LiveTrackingMap lat={location.lat} lng={location.lng} walkerName={walkerName} />
                </div>
              )}
              <button onClick={generateEndOtp}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 rounded-xl shadow-md shadow-amber-200 hover:shadow-lg transition-all active:scale-95">
                End Walk & Get Completion OTP
              </button>
            </>
          )}

          {/* Step 3: Show end OTP to owner */}
          {endOtp && (
            <>
              <div className="text-center mb-5">
                <div className="text-3xl mb-2">🔑</div>
                <h2 className="font-bold text-gray-900 mb-1">Show this to the owner</h2>
                <p className="text-gray-400 text-sm">They&apos;ll enter this OTP to confirm the walk is done</p>
              </div>
              <div className="flex gap-3 justify-center mb-2">
                {endOtp.split('').map((d, i) => (
                  <div key={i} className="w-14 h-14 flex items-center justify-center text-2xl font-black bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-700 shadow-sm">
                    {d}
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">Waiting for owner to confirm…</p>
            </>
          )}
        </div>
      )}

      {/* ─── OWNER FLOW ──────────────────────────────────────────────────── */}
      {role === 'OWNER' && !walkCompleted && isAccepted && (
        <div className="space-y-5">
          {/* Show start OTP */}
          {!startOtpVerified && booking.startOtp && (
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">🔐</div>
                <div>
                  <h2 className="font-bold text-gray-900">Share this OTP with your walker</h2>
                  <p className="text-gray-400 text-sm">The walker will enter this code to start the walk</p>
                </div>
              </div>
              <div className="flex gap-3 justify-center mb-4">
                {booking.startOtp.split('').map((d: string, i: number) => (
                  <div key={i} className="w-14 h-14 flex items-center justify-center text-2xl font-black bg-amber-50 border-2 border-amber-400 rounded-2xl text-amber-700 shadow-sm">
                    {d}
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-gray-400">Waiting for walker to enter this OTP…</p>
            </div>
          )}

          {/* Walk in progress: show map */}
          {startOtpVerified && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Walker&apos;s Location</h2>
              </div>
              {location?.trackingActive && location.lat ? (
                <div>
                  <LiveTrackingMap lat={location.lat} lng={location.lng} walkerName={walkerName} />
                  <p className="text-gray-400 text-xs mt-3 text-center">Updates every 5 seconds</p>
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl h-40 flex items-center justify-center text-gray-400 text-sm">
                  Waiting for walker&apos;s location…
                </div>
              )}
            </div>
          )}

          {/* Enter end OTP */}
          {startOtpVerified && (
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">✅</div>
                <div>
                  <h2 className="font-bold text-gray-900">Enter End OTP</h2>
                  <p className="text-gray-400 text-sm">Ask the walker for their 4-digit code to confirm walk completion</p>
                </div>
              </div>
              <OtpInput onComplete={verifyEndOtp} />
              {endOtpVerifying && <p className="text-center text-gray-400 text-sm mt-3">Verifying…</p>}
              {endOtpError && <p className="text-red-500 text-sm text-center mt-3 font-medium">{endOtpError}</p>}
            </div>
          )}
        </div>
      )}

      {/* Walk details */}
      <div className="card p-5 mt-5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Walk Details</h3>
        <div className="space-y-3">
          {[
            { label: 'Dog', value: booking.dog?.name },
            { label: role === 'OWNER' ? 'Walker' : 'Owner', value: role === 'OWNER' ? walkerName : booking.owner?.name },
            { label: 'Date', value: booking.date },
            { label: 'Duration', value: `${booking.duration} min` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-gray-400 text-sm">{label}</span>
              <span className="font-semibold text-gray-800 text-sm">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
