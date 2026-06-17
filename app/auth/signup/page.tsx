'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

function EyeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"/>
    </svg>
  )
}

function SignUpForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: params.get('role') === 'walker' ? 'WALKER' : 'OWNER' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  // Step 2 OTP state
  const [step, setStep] = useState<1 | 2>(1)
  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [phone, setPhone] = useState('')
  const [showPhoneInput, setShowPhoneInput] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [cooldown])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (!res.ok) { setError((await res.json()).error); setLoading(false); return }
    // Auto-send email OTP
    await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, method: 'email' }),
    })
    setCooldown(60)
    setStep(2)
    setLoading(false)
    setTimeout(() => inputRefs.current[0]?.focus(), 100)
  }

  async function sendOtp() {
    setOtpError('')
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, method, phone: method === 'phone' ? phone : undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setOtpError(data.error); return }
      setCooldown(60)
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch {
      setOtpError('Something went wrong. Please try again.')
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
    setOtpError('')
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: finalOtp }),
      })
      const data = await res.json()
      if (!res.ok) { setOtpError(data.error); setOtp(['', '', '', '', '', '']); inputRefs.current[0]?.focus(); return }
      await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      router.push('/onboarding')
    } catch {
      setOtpError('Something went wrong. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  if (step === 2) {
    return (
      <div className="h-screen bg-[#FAF5EE] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-black text-[#3D2800]">Furrlet</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            <span className="text-xs font-semibold text-amber-700">Step 2 of 2</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-5 pb-4 gap-5">
          <div className="text-center">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 border border-amber-200">📧</div>
            <h1 className="text-2xl font-black text-[#3D2800]">Check your email</h1>
            <p className="text-[#9B7B4F] text-sm mt-1">
              6-digit code sent to <span className="font-semibold text-[#6B4F00]">{form.email}</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 space-y-4">
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

            {otpError && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl text-center">{otpError}</div>
            )}

            <button
              onClick={() => verifyOtp()}
              disabled={verifying || otp.join('').length < 6}
              className="w-full bg-[#E8960A] hover:bg-[#C47C00] text-white font-bold py-3.5 rounded-2xl text-base transition-all active:scale-[0.98] disabled:opacity-50">
              {verifying ? 'Verifying...' : 'Verify & continue →'}
            </button>

            <div className="text-center space-y-2">
              {cooldown > 0 ? (
                <p className="text-[#A07840] text-sm">Resend in {cooldown}s</p>
              ) : (
                <button onClick={() => { setOtp(['', '', '', '', '', '']); setOtpError(''); sendOtp() }}
                  className="text-[#E8960A] text-sm font-semibold hover:text-[#C47C00]">
                  Resend code
                </button>
              )}

              {!showPhoneInput ? (
                <button type="button" onClick={() => { setShowPhoneInput(true); setMethod('phone') }}
                  className="block w-full text-xs text-[#6B4F00] hover:text-[#3D2800] underline">
                  Verify with phone instead
                </button>
              ) : (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-2 items-center bg-[#FDF0E0] border border-[#F0D9B0] rounded-xl px-3 py-2">
                    <span className="text-[#6B4F00] text-sm font-medium">+91</span>
                    <input type="tel" placeholder="98765 43210" value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 outline-none bg-transparent text-sm text-[#3D2800] placeholder-[#A07840]"
                      maxLength={10} />
                  </div>
                  <button type="button" onClick={() => sendOtp()} disabled={phone.length < 10}
                    className="w-full text-sm text-[#E8960A] font-semibold hover:text-[#C47C00] disabled:opacity-50">
                    Send code to phone
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#FAF5EE] flex flex-col overflow-hidden relative">
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-100 rounded-full blur-3xl opacity-60 translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-black text-[#3D2800]">Furrlet</span>
        </div>
        <Link href="/auth/signin" className="text-sm font-semibold text-[#E8960A] hover:text-[#C47C00] transition-colors">
          Sign in
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 pb-4 gap-4 relative">
        <div>
          <h1 className="text-2xl font-black text-[#3D2800]">Create account</h1>
          <p className="text-[#9B7B4F] text-sm mt-0.5">Free forever. No credit card required.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5">
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-[#3D2800] mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-2">
                {[['OWNER', '🐕', 'Dog Owner'], ['WALKER', '🦮', 'Dog Walker']].map(([val, icon, label]) => (
                  <button key={val} type="button" onClick={() => setForm(f => ({ ...f, role: val }))}
                    className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.role === val
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-[#F0D9B0] text-[#6B4F00] hover:border-amber-300 bg-white'
                    }`}>
                    <span className="text-base block mb-0.5">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3D2800] mb-1.5">Full name</label>
              <input type="text" required placeholder="Alex Johnson" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-[#FDF0E0] border border-[#F0D9B0] rounded-xl px-4 py-3 text-sm text-[#3D2800] placeholder-[#A07840] focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#3D2800] mb-1.5">Email address</label>
              <input type="email" required placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-[#FDF0E0] border border-[#F0D9B0] rounded-xl px-4 py-3 text-sm text-[#3D2800] placeholder-[#A07840] focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#3D2800] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required placeholder="Min. 8 characters"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-[#FDF0E0] border border-[#F0D9B0] rounded-xl px-4 py-3 pr-11 text-sm text-[#3D2800] placeholder-[#A07840] focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A07840] hover:text-[#6B4F00] transition-colors">
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#E8960A] hover:bg-[#C47C00] text-white font-bold py-3.5 rounded-2xl text-base transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm shadow-amber-200">
              {loading ? 'Creating account...' : 'Continue →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#A07840]">
          Already have an account?{' '}
          <Link href="/auth/signin" className="font-bold text-[#E8960A] hover:text-[#C47C00]">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return <Suspense><SignUpForm /></Suspense>
}
