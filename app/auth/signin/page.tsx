'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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

export default function SignIn() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await signIn('credentials', { ...form, redirect: false })
    if (res?.error) { setError('Invalid email or password'); setLoading(false); return }
    const me = await fetch('/api/auth/me').then(r => r.json()).catch(() => null)
    if (me && !me.isVerified) {
      const qs = new URLSearchParams({ email: form.email, password: form.password })
      router.push(`/auth/verify?${qs.toString()}`)
      return
    }
    router.push('/dashboard')
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
        <Link href="/auth/signup"
          className="text-sm font-semibold text-[#E8960A] hover:text-[#C47C00] transition-colors">
          Sign up
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center px-5 pb-4 gap-4 relative">
        <div>
          <h1 className="text-2xl font-black text-[#3D2800]">Welcome back</h1>
          <p className="text-[#9B7B4F] text-sm mt-0.5">The cozy corner for every happy tail.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#3D2800] mb-1.5">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-[#FDF0E0] border border-[#F0D9B0] rounded-xl px-4 py-3 text-sm text-[#3D2800] placeholder-[#A07840] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#3D2800] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-[#FDF0E0] border border-[#F0D9B0] rounded-xl px-4 py-3 pr-11 text-sm text-[#3D2800] placeholder-[#A07840] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A07840] hover:text-[#6B4F00] transition-colors">
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <Link href="/auth/reset-password" className="text-xs text-[#E8960A] font-semibold hover:text-[#C47C00] mt-1 block text-right">
                Forgot password?
              </Link>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E8960A] hover:bg-[#C47C00] text-white font-bold py-3.5 rounded-2xl text-base transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm shadow-amber-200">
              {loading ? 'Signing in...' : 'Continue →'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-sm text-[#6B4F00]">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-bold text-[#E8960A] hover:text-[#C47C00] transition-colors">Sign up</Link>
          </p>
        </div>

        <p className="text-center text-xs text-[#A07840] leading-relaxed">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline">Terms &amp; Conditions</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
