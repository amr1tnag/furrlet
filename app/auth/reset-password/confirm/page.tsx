'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/auth/reset-password/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    if (!res.ok) { setError((await res.json()).error); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/auth/signin'), 2000)
  }

  if (!token) return (
    <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-[#6B4F00] mb-4">Invalid reset link.</p>
        <Link href="/auth/reset-password" className="text-[#E8960A] font-semibold">Request a new one →</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-[#3D2800]">New Password</h1>
          <p className="text-[#6B4F00] text-sm mt-2">Choose a strong password for your account.</p>
        </div>
        {done ? (
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
            <h2 className="font-bold text-[#3D2800] text-lg">Password updated!</h2>
            <p className="text-[#6B4F00] text-sm mt-1">Redirecting you to sign in...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#3D2800] mb-1.5">New Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required placeholder="Min. 8 characters" value={password}
                    onChange={e => setPassword(e.target.value)} minLength={8}
                    className="w-full bg-[#FDF0E0] border border-[#F0D9B0] rounded-xl px-4 py-3 pr-11 text-sm text-[#3D2800] placeholder-[#A07840] focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A07840]">
                    {showPw ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"/></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#3D2800] mb-1.5">Confirm Password</label>
                <input type={showPw ? 'text' : 'password'} required placeholder="Repeat password" value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="w-full bg-[#FDF0E0] border border-[#F0D9B0] rounded-xl px-4 py-3 text-sm text-[#3D2800] placeholder-[#A07840] focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" />
              </div>
              {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full bg-[#E8960A] hover:bg-[#C47C00] text-white font-bold py-3.5 rounded-2xl text-base transition-all disabled:opacity-50">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return <Suspense><ConfirmForm /></Suspense>
}
