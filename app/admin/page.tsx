'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const ADMIN_EMAIL = 'amritnag2005@gmail.com'

const statusConfig: Record<string, { label: string; classes: string }> = {
  NONE:     { label: 'Not applied',  classes: 'bg-gray-100 text-gray-500' },
  PENDING:  { label: 'Pending',      classes: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  VERIFIED: { label: 'Verified',     classes: 'bg-green-50 text-green-700 border border-green-200' },
  REJECTED: { label: 'Rejected',     classes: 'bg-red-50 text-red-600 border border-red-200' },
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [walkers, setWalkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/signin'); return }
    if (status === 'authenticated' && session.user?.email !== ADMIN_EMAIL) { router.push('/'); return }
    if (status === 'authenticated') loadWalkers()
  }, [status, session])

  async function loadWalkers() {
    const res = await fetch('/api/admin/walkers')
    if (res.ok) setWalkers(await res.json())
    setLoading(false)
  }

  async function act(walkerId: string, action: 'approve' | 'reject') {
    setActing(walkerId + action)
    await fetch(`/api/verification/${walkerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setActing(null)
    loadWalkers()
  }

  const pending = walkers.filter(w => w.verificationStatus === 'PENDING')
  const others = walkers.filter(w => w.verificationStatus !== 'PENDING')

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Manage walker verification requests</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
          <span className="text-amber-600 text-sm font-bold">{pending.length} pending</span>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Action Required</h2>
          <div className="space-y-4">
            {pending.map(w => <WalkerRow key={w.id} w={w} acting={acting} act={act} />)}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">All Walkers</h2>
          <div className="space-y-3">
            {others.map(w => <WalkerRow key={w.id} w={w} acting={acting} act={act} />)}
          </div>
        </div>
      )}

      {walkers.length === 0 && (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🦮</div>
          <p className="text-gray-500 font-semibold">No walkers yet</p>
        </div>
      )}
    </div>
  )
}

function WalkerRow({ w, acting, act }: { w: any; acting: string | null; act: (id: string, action: 'approve' | 'reject') => void }) {
  const st = statusConfig[w.verificationStatus] ?? statusConfig.NONE
  const isPending = w.verificationStatus === 'PENDING'

  return (
    <div className={`card p-5 ${isPending ? 'border-amber-200 shadow-[0_0_0_2px_rgba(251,191,36,0.1)]' : ''}`}>
      {isPending && <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400 -mx-5 -mt-5 mb-4 rounded-t-2xl" />}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center text-xl">
          {w.photoUrl
            ? <Image src={w.photoUrl} alt={w.user.name} width={48} height={48} className="object-cover w-full h-full" />
            : '🦮'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900">{w.user.name}</span>
            {w.verified && <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">✓ Verified</span>}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${st.classes}`}>{st.label}</span>
          </div>
          <div className="text-sm text-gray-400 mt-0.5">{w.user.email} · {w.city}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            Joined {new Date(w.user.createdAt).toLocaleDateString('en-IN')} · ₹{w.hourlyRate}/hr · ⭐ {w.rating.toFixed(1)} ({w.reviewCount} reviews)
          </div>
          {w.aadhaarNumber && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="text-xs text-gray-400">Aadhaar</span>
              <span className="text-xs font-mono font-bold text-gray-700">
                XXXX XXXX {w.aadhaarNumber.slice(-4)}
              </span>
            </div>
          )}
        </div>

        {isPending && (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => act(w.userId, 'approve')}
              disabled={!!acting}
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50 shadow-sm">
              {acting === w.userId + 'approve' ? '...' : '✓ Verify'}
            </button>
            <button
              onClick={() => act(w.userId, 'reject')}
              disabled={!!acting}
              className="flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-500 border border-red-200 font-semibold py-2 px-4 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50">
              {acting === w.userId + 'reject' ? '...' : '✕ Reject'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
