'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

function SignUpForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: params.get('role') === 'walker' ? 'WALKER' : 'OWNER' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (!res.ok) { setError((await res.json()).error); setLoading(false); return }
    await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    router.push('/onboarding')
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🐾</span>
            <span className="font-bold text-xl text-gray-900">Furrlet</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Free forever. No credit card required.</p>
        </div>

        <div className="card p-8">
          <form onSubmit={submit} className="space-y-5">
            {/* Role picker */}
            <div>
              <label className="label">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {[['OWNER', '🐕', 'Dog Owner'], ['WALKER', '🦮', 'Dog Walker']].map(([val, icon, label]) => (
                  <button key={val} type="button" onClick={() => setForm(f => ({ ...f, role: val }))}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.role === val
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                    }`}>
                    <span className="text-lg block mb-0.5">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Full name</label>
              <input type="text" required placeholder="Alex Johnson" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" required placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" required placeholder="Min. 8 characters" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Creating account...' : 'Create free account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-amber-600 font-semibold hover:text-amber-700">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return <Suspense><SignUpForm /></Suspense>
}
