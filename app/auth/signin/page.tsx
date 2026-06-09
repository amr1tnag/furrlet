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
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🐾</div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {[['email', 'Email', 'email'], ['password', 'Password', 'password']].map(([field, label, type]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} required value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-amber-500 text-white py-2.5 rounded-lg font-semibold hover:bg-amber-600 transition disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          No account? <Link href="/auth/signup" className="text-amber-500 font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
