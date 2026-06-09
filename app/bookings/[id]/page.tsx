'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const LiveTrackingMap = dynamic(() => import('@/components/LiveTrackingMap'), { ssr: false })

export default function BookingTracking() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [booking, setBooking] = useState<any>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number; trackingActive: boolean } | null>(null)
  const [tracking, setTracking] = useState(false)
  const [geoError, setGeoError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const watchIdRef = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Load booking info
  useEffect(() => {
    fetch(`/api/bookings/${id}`).then(r => r.json()).then(d => setBooking(d))
  }, [id])

  // Walker: start sharing location
  function startTracking() {
    if (!navigator.geolocation) { setGeoError('Geolocation not supported on this device'); return }
    setGeoError('')
    setTracking(true)
    startTimeRef.current = Date.now()

    // Start elapsed timer
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current!) / 1000))
    }, 1000)

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

  function stopTracking() {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    setTracking(false)
    fetch(`/api/bookings/${id}/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: null, lng: null, active: false }),
    })
  }

  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  // Owner: poll for walker location every 5s
  const pollLocation = useCallback(() => {
    fetch(`/api/bookings/${id}/location`)
      .then(r => r.json())
      .then(d => {
        if (d.lat && d.lng) setLocation({ lat: d.lat, lng: d.lng, trackingActive: d.trackingActive })
        else setLocation(prev => prev ? { ...prev, trackingActive: d.trackingActive } : null)
      })
  }, [id])

  useEffect(() => {
    if (role !== 'OWNER') return
    pollLocation()
    const iv = setInterval(pollLocation, 5000)
    return () => clearInterval(iv)
  }, [role, pollLocation])

  function formatElapsed(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
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
      {/* Back */}
      <Link href="/bookings" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to bookings
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-amber-200">
          🐾
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">Live Walk Tracking</h1>
          <p className="text-gray-400 text-sm">{booking.dog?.name} · {booking.date} · {booking.duration} min</p>
        </div>
      </div>

      {/* Walker controls */}
      {role === 'WALKER' && (
        <div className="card p-6 mb-5">
          <h2 className="font-bold text-gray-900 mb-1">Share your location</h2>
          <p className="text-gray-400 text-sm mb-4">The owner can see your live location while you walk their dog.</p>

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
              {/* Live indicator */}
              <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-3 mb-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-700 font-semibold text-sm">Sharing live location</span>
                </span>
                <span className="ml-auto text-green-600 font-mono text-sm font-bold">{formatElapsed(elapsed)}</span>
              </div>

              {location && (
                <div className="mb-4">
                  <LiveTrackingMap lat={location.lat} lng={location.lng} walkerName={walkerName} />
                </div>
              )}

              <button onClick={stopTracking} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors">
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

      {/* Owner view */}
      {role === 'OWNER' && (
        <div className="card p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Walker&apos;s Location</h2>
            {location?.trackingActive ? (
              <span className="flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                Not sharing yet
              </span>
            )}
          </div>

          {location?.trackingActive && location.lat && location.lng ? (
            <div>
              <LiveTrackingMap lat={location.lat} lng={location.lng} walkerName={walkerName} />
              <p className="text-gray-400 text-xs mt-3 text-center">Updates every 5 seconds · Powered by GPS</p>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl h-48 flex flex-col items-center justify-center gap-3 text-center px-6">
              <span className="text-4xl">📍</span>
              <div>
                <p className="text-gray-600 font-semibold text-sm">Waiting for walker to start</p>
                <p className="text-gray-400 text-xs mt-1">The map will appear automatically once {walkerName} begins sharing</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Booking details */}
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
      </div>
    </div>
  )
}
