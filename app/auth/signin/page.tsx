'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignIn() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    <div className="min-h-screen bg-[#FAF5EE] relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Decorative paw watermark */}
      <div className="absolute bottom-0 right-0 opacity-5 select-none pointer-events-none" style={{ fontSize: '280px', lineHeight: 1 }}>🐾</div>
      {/* Decorative top-left leaf */}
      <div className="absolute top-0 left-0 opacity-5 select-none pointer-events-none" style={{ fontSize: '200px', lineHeight: 1 }}>🌿</div>

      <div className="relative w-full max-w-sm">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🐾</div>
          <h1 className="text-2xl font-bold text-[#3D2800]">Welcome to Furrlet</h1>
          <p className="text-[#6B4F00] text-sm mt-2 leading-relaxed max-w-xs mx-auto">
            The cozy corner for every happy tail and wagging heart.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 mb-4">
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
              <input
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full bg-[#FDF0E0] border border-[#F0D9B0] rounded-xl px-4 py-3 text-sm text-[#3D2800] placeholder-[#A07840] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E8960A] hover:bg-[#C47C00] text-white font-bold py-3.5 rounded-2xl text-base transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm shadow-amber-200 mt-2">
              {loading ? 'Signing in...' : 'Continue →'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-sm text-[#6B4F00] mt-2">
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
