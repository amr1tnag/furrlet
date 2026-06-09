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
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🐾</div>
          <h1 className="text-2xl font-bold text-gray-800">Join Furrlet</h1>
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {[['OWNER', '🐕 Dog Owner'], ['WALKER', '🦮 Dog Walker']].map(([val, label]) => (
                <button key={val} type="button" onClick={() => setForm(f => ({ ...f, role: val }))}
                  className={`py-2 rounded-lg border-2 text-sm font-medium transition ${form.role === val ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-amber-300'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {[['name', 'Full Name', 'text'], ['email', 'Email', 'email'], ['password', 'Password', 'password']].map(([field, label, type]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} required value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-amber-500 text-white py-2.5 rounded-lg font-semibold hover:bg-amber-600 transition disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link href="/auth/signin" className="text-amber-500 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return <Suspense><SignUpForm /></Suspense>
}
