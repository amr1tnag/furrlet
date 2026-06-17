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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🐾</span>
            <span className="font-bold text-xl text-gray-900">Furrlet</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input type="email" required placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-[#FDF0E0] border border-[#F0D9B0] rounded-xl px-4 py-3 pr-11 text-sm text-[#3D2800] placeholder-[#A07840] focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
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
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-amber-600 font-semibold hover:text-amber-700">Create one free</Link>
        </p>
      </div>
    </div>
  )
}
