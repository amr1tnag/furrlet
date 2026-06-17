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
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#6B4F00] mb-4">Invalid verification link.</p>
          <Link href="/auth/signup" className="text-[#E8960A] font-semibold">Back to sign up</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#FAF5EE] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-black text-[#3D2800]">Furrlet</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 pb-4 gap-5">
        <div className="text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 border border-amber-200">🔐</div>
          <h1 className="text-2xl font-black text-[#3D2800]">Verify your account</h1>
          <p className="text-[#9B7B4F] text-sm mt-1">One quick step to keep your account secure</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5">
          {!sent ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#3D2800] mb-3">How would you like to verify?</label>
                <div className="grid grid-cols-2 gap-3">
                  {([['email', '📧', 'Email OTP'], ['phone', '📱', 'Phone OTP']] as const).map(([val, icon, label]) => (
                    <button key={val} type="button" onClick={() => { setMethod(val); setError('') }}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                        method === val
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-[#F0D9B0] text-[#6B4F00] hover:border-amber-300 bg-white'
                      }`}>
                      <span className="text-lg block mb-0.5">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {method === 'email' ? (
                <div className="bg-[#FDF0E0] rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">📧</span>
                  <div>
                    <div className="text-xs text-[#A07840]">Sending code to</div>
                    <div className="font-semibold text-[#3D2800] text-sm">{email}</div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-[#3D2800] mb-1.5">Phone number</label>
                  <div className="flex gap-2 items-center bg-[#FDF0E0] border border-[#F0D9B0] rounded-xl px-3 py-3">
                    <span className="text-[#6B4F00] text-sm font-medium">+91</span>
                    <input
                      type="tel" placeholder="98765 43210" value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 outline-none bg-transparent text-sm text-[#3D2800] placeholder-[#A07840]"
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
                className="w-full bg-[#E8960A] hover:bg-[#C47C00] text-white font-bold py-3.5 rounded-2xl text-base transition-all active:scale-[0.98] disabled:opacity-50">
                {loading ? 'Sending...' : `Send OTP to ${method === 'email' ? 'email' : 'phone'}`}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <div className="text-4xl mb-3">{method === 'email' ? '📧' : '📱'}</div>
                <p className="text-[#3D2800] font-semibold">Enter the 6-digit code</p>
                <p className="text-[#A07840] text-sm mt-1">
                  Sent to <span className="font-medium text-[#6B4F00]">{method === 'email' ? email : `+91 ${phone}`}</span>
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpInput(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all ${
                      digit ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-[#F0D9B0] bg-[#FDF0E0] text-[#3D2800]'
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
                className="w-full bg-[#E8960A] hover:bg-[#C47C00] text-white font-bold py-3.5 rounded-2xl text-base transition-all active:scale-[0.98] disabled:opacity-50">
                {verifying ? 'Verifying...' : 'Verify account'}
              </button>

              <div className="text-center">
                {cooldown > 0 ? (
                  <p className="text-[#A07840] text-sm">Resend in {cooldown}s</p>
                ) : (
                  <button onClick={() => { setSent(false); setOtp(['', '', '', '', '', '']); setError('') }}
                    className="text-[#E8960A] text-sm font-semibold hover:text-[#C47C00]">
                    Resend code
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-[#A07840] mt-6">
          Wrong account?{' '}
          <Link href="/auth/signup" className="text-[#E8960A] font-semibold">Start over</Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return <Suspense><VerifyForm /></Suspense>
}
