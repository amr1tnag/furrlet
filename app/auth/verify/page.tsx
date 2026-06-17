'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

function VerifyForm() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') || ''
  const password = params.get('password') || ''

  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [cooldown])

  // Auto-send email OTP on mount for signin flow
  useEffect(() => {
    if (email) {
      fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, method: 'email' }),
      }).then(() => {
        setSent(true)
        setCooldown(60)
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
      }).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function sendOtp() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, method, phone: method === 'phone' ? phone : undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSent(true)
      setCooldown(60)
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleOtpInput(i: number, val: string) {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) inputRefs.current[i + 1]?.focus()
    if (next.every(d => d) && next.join('').length === 6) verifyOtp(next.join(''))
  }

  function handleOtpKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }

  async function verifyOtp(code?: string) {
    const finalOtp = code || otp.join('')
    if (finalOtp.length < 6) return
    setVerifying(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: finalOtp }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setOtp(['', '', '', '', '', '']); inputRefs.current[0]?.focus(); return }
      await signIn('credentials', { email, password, redirect: false })
      router.push('/onboarding')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  if (!email) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Invalid verification link.</p>
          <Link href="/auth/signup" className="text-amber-600 font-semibold">Back to sign up</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🐾</span>
            <span className="font-bold text-xl text-gray-900">Furrlet</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Verify your account</h1>
          <p className="text-gray-500 text-sm mt-1">One quick step to keep your account secure</p>
        </div>

        <div className="card p-8">
          {!sent ? (
            <div className="space-y-6">
              {/* Method picker */}
              <div>
                <label className="label mb-3">How would you like to verify?</label>
                <div className="grid grid-cols-2 gap-3">
                  {([['email', '📧', 'Email OTP'], ['phone', '📱', 'Phone OTP']] as const).map(([val, icon, label]) => (
                    <button key={val} type="button" onClick={() => { setMethod(val); setError('') }}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                        method === val
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                      }`}>
                      <span className="text-lg block mb-0.5">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {method === 'email' ? (
                <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">📧</span>
                  <div>
                    <div className="text-xs text-gray-400">Sending code to</div>
                    <div className="font-semibold text-gray-800 text-sm">{email}</div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="label">Phone number</label>
                  <div className="flex gap-2 items-center input px-3">
                    <span className="text-gray-500 text-sm font-medium">+91</span>
                    <input
                      type="tel" placeholder="98765 43210" value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 outline-none bg-transparent text-sm"
                      maxLength={10}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}

              <button
                onClick={sendOtp}
                disabled={loading || (method === 'phone' && phone.length < 10)}
                className="btn-primary w-full py-3 text-base disabled:opacity-50">
                {loading ? 'Sending...' : `Send OTP to ${method === 'email' ? 'email' : 'phone'}`}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-3">{method === 'email' ? '📧' : '📱'}</div>
                <p className="text-gray-700 font-semibold">Enter the 6-digit code</p>
                <p className="text-gray-400 text-sm mt-1">
                  Sent to <span className="font-medium text-gray-600">{method === 'email' ? email : `+91 ${phone}`}</span>
                </p>
              </div>

              {/* OTP boxes */}
              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpInput(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all ${
                      digit ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-900'
                    } focus:border-amber-400`}
                  />
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl text-center">{error}</div>
              )}

              <button
                onClick={() => verifyOtp()}
                disabled={verifying || otp.join('').length < 6}
                className="btn-primary w-full py-3 text-base disabled:opacity-50">
                {verifying ? 'Verifying...' : 'Verify account'}
              </button>

              <div className="text-center">
                {cooldown > 0 ? (
                  <p className="text-gray-400 text-sm">Resend in {cooldown}s</p>
                ) : (
                  <button onClick={() => { setSent(false); setOtp(['', '', '', '', '', '']); setError('') }}
                    className="text-amber-600 text-sm font-semibold hover:text-amber-700">
                    Resend code
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Wrong account?{' '}
          <Link href="/auth/signup" className="text-amber-600 font-semibold">Start over</Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return <Suspense><VerifyForm /></Suspense>
}
