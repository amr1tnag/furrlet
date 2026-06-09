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
      const elapsed = Date.now() - startMs
      const remaining = Math.max(0, Math.floor((totalMs - elapsed) / 1000))
      setSecondsLeft(remaining)

      // Buzz at 10 min mark (between 600 and 595 seconds remaining)
      if (remaining <= 600 && remaining > 594 && !warnedRef.current) {
        warnedRef.current = true
        // Vibrate: 3 pulses
        if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 400])
        // Browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('🐾 Walk ending soon!', {
            body: '10 minutes left on this walk.',
            icon: '/favicon.ico',
          })
        }
      }
    }

    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [walkStartedAt, durationMinutes])

  return secondsLeft
}

function CountdownDisplay({ secondsLeft, duration }: { secondsLeft: number; duration: number }) {
  const totalSeconds = duration * 60
  const pct = Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100))
  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const isWarning = secondsLeft <= 600 && secondsLeft > 0
  const isOver = secondsLeft === 0

  const circumference = 2 * Math.PI * 40
  const strokeDash = (pct / 100) * circumference

  return (
    <div className={`rounded-2xl p-5 text-center transition-colors duration-500 ${
      isOver ? 'bg-blue-50 border border-blue-100' :
      isWarning ? 'bg-amber-50 border border-amber-200' :
      'bg-gray-50 border border-gray-100'
    }`}>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
        {isOver ? 'Walk Completed' : isWarning ? '⚠️ Ending Soon' : 'Time Remaining'}
      </p>

      {/* Circular progress */}
      <div className="relative w-28 h-28 mx-auto mb-3">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={isOver ? '#3b82f6' : isWarning ? '#f59e0b' : '#22c55e'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isOver ? (
            <span className="text-3xl">🏁</span>
          ) : (
            <>
              <span className={`text-2xl font-black tabular-nums ${isWarning ? 'text-amber-600' : 'text-gray-900'}`}>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
              <span className="text-xs text-gray-400 mt-0.5">left</span>
            </>
          )}
        </div>
      </div>

      {isWarning && !isOver && (
        <p className="text-amber-600 font-semibold text-sm animate-pulse">
          10 minutes remaining — wrap up soon!
        </p>
      )}
      {isOver && (
        <p className="text-blue-600 font-semibold text-sm">
          Walk time is up! Mark as completed.
        </p>
      )}
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
  const [location, setLocation] = useState<{ lat: number; lng: number; trackingActive: boolean; walkStartedAt: string | null }>({
    lat: 0, lng: 0, trackingActive: false, walkStartedAt: null,
  })
  const [tracking, setTracking] = useState(false)
  const [walkStartedAt, setWalkStartedAt] = useState<string | null>(null)
  const [geoError, setGeoError] = useState('')
  const watchIdRef = useRef<number | null>(null)

  const secondsLeft = useCountdown(walkStartedAt, booking?.duration ?? 30)

  useEffect(() => {
    fetch(`/api/bookings/${id}`).then(r => r.json()).then(d => {
      setBooking(d)
      // Restore in-progress walk if walkStartedAt already set on server
      if (d.walkStartedAt) setWalkStartedAt(d.walkStartedAt)
    })
  }, [id])

  function startTracking() {
    if (!navigator.geolocation) { setGeoError('Geolocation not supported on this device'); return }
    setGeoError('')
    setTracking(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        setLocation(prev => ({ ...prev, lat, lng, trackingActive: true }))
        fetch(`/api/bookings/${id}/location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng, active: true }),
        })
          .then(r => r.json())
          .then(d => { if (d.walkStartedAt) setWalkStartedAt(d.walkStartedAt) })
      },
      err => setGeoError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000 }
    )
  }

  function stopTracking() {
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

  const pollLocation = useCallback(() => {
    fetch(`/api/bookings/${id}/location`)
      .then(r => r.json())
      .then(d => {
        setLocation({ lat: d.lat, lng: d.lng, trackingActive: d.trackingActive, walkStartedAt: d.walkStartedAt })
        if (d.walkStartedAt) setWalkStartedAt(d.walkStartedAt)
      })
  }, [id])

  useEffect(() => {
    if (role !== 'OWNER') return
    pollLocation()
    const iv = setInterval(pollLocation, 5000)
    return () => clearInterval(iv)
  }, [role, pollLocation])

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

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-amber-200">
          🐾
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">Live Walk</h1>
          <p className="text-gray-400 text-sm">{booking.dog?.name} · {booking.date} · {booking.duration} min</p>
        </div>
        {location.trackingActive && (
          <span className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Countdown timer — shown to both sides once walk starts */}
      {walkStartedAt && secondsLeft !== null && (
        <div className="mb-5">
          <CountdownDisplay secondsLeft={secondsLeft} duration={booking.duration} />
        </div>
      )}

      {/* Walker controls */}
      {role === 'WALKER' && (
        <div className="card p-6 mb-5">
          <h2 className="font-bold text-gray-900 mb-1">Share your location</h2>
          <p className="text-gray-400 text-sm mb-4">The owner can see your live location and walk timer.</p>

          {geoError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {geoError}
            </div>
          )}

          {!isAccepted ? (
            <div className="bg-gray-50 text-gray-400 text-sm rounded-xl px-4 py-3 text-center">
              Tracking is only available for accepted bookings
            </div>
          ) : tracking ? (
            <div>
              {location.lat !== 0 && (
                <div className="mb-4">
                  <LiveTrackingMap lat={location.lat} lng={location.lng} walkerName={walkerName} />
                </div>
              )}
              <button onClick={stopTracking}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors">
                Stop Sharing
              </button>
            </div>
          ) : (
            <button onClick={startTracking}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2">
              <span className="text-lg">📍</span>
              Start Walk & Share Location
            </button>
          )}
        </div>
      )}

      {/* Owner map view */}
      {role === 'OWNER' && (
        <div className="card p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Walker&apos;s Location</h2>
          </div>

          {location.trackingActive && location.lat ? (
            <div>
              <LiveTrackingMap lat={location.lat} lng={location.lng} walkerName={walkerName} />
              <p className="text-gray-400 text-xs mt-3 text-center">Updates every 5 seconds</p>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl h-48 flex flex-col items-center justify-center gap-3 text-center px-6">
              <span className="text-4xl">📍</span>
              <div>
                <p className="text-gray-600 font-semibold text-sm">Waiting for walker to start</p>
                <p className="text-gray-400 text-xs mt-1">Map and timer appear once {walkerName} begins</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Walk details */}
      <div className="card p-5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Walk Details</h3>
        <div className="space-y-3">
          {[
            { label: 'Dog', value: booking.dog?.name },
            { label: role === 'OWNER' ? 'Walker' : 'Owner', value: role === 'OWNER' ? walkerName : booking.owner?.name },
            { label: 'Date', value: booking.date },
            { label: 'Duration', value: `${booking.duration} min` },
            { label: 'Status', value: booking.status },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-gray-400 text-sm">{label}</span>
              <span className="font-semibold text-gray-800 text-sm">{value}</span>
            </div>
          ))}
        </div>

        {role === 'WALKER' && isAccepted && tracking && (
          <button
            onClick={() => { stopTracking(); router.push('/bookings') }}
            className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors">
            🏁 Mark as Completed
          </button>
        )}
      </div>
    </div>
  )
}
