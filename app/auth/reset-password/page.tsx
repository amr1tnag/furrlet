'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-[#3D2800]">Reset Password</h1>
          <p className="text-[#6B4F00] text-sm mt-2">Enter your email and we&apos;ll send you a reset link.</p>
        </div>
        {sent ? (
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
            <h2 className="font-bold text-[#3D2800] text-lg mb-1">Check your inbox</h2>
            <p className="text-[#6B4F00] text-sm">We sent a password reset link to <strong>{email}</strong>. It expires in 1 hour.</p>
            <Link href="/auth/signin" className="mt-6 block w-full text-center border-2 border-[#E8960A] text-[#E8960A] font-semibold py-3 rounded-2xl hover:bg-amber-50 transition-all">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#3D2800] mb-1.5">Email address</label>
                <input type="email" required placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#FDF0E0] border border-[#F0D9B0] rounded-xl px-4 py-3 text-sm text-[#3D2800] placeholder-[#A07840] focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#E8960A] hover:bg-[#C47C00] text-white font-bold py-3.5 rounded-2xl text-base transition-all disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Reset Link →'}
              </button>
            </form>
            <Link href="/auth/signin" className="block text-center text-sm text-[#6B4F00] mt-4 hover:text-[#3D2800]">← Back to Sign In</Link>
          </div>
        )}
      </div>
    </div>
  )
}
