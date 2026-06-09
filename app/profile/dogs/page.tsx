'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const sizeOptions: [string, string, string][] = [
  ['SMALL', '🐩', 'Small'],
  ['MEDIUM', '🐕', 'Medium'],
  ['LARGE', '🦮', 'Large'],
]

function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 shimmer rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 shimmer w-20" />
          <div className="h-3 shimmer w-32" />
        </div>
        <div className="h-6 shimmer w-14 rounded-lg" />
      </div>
    </div>
  )
}

export default function ManageDogs() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dogs, setDogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', breed: '', size: 'MEDIUM', notes: '' })
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  const load = () => {
    fetch('/api/dogs').then(r => r.json()).then(d => {
      setDogs(Array.isArray(d) ? d : [])
      setLoading(false)
    })
  }
  useEffect(() => { if (session) load() }, [session])

  async function addDog(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/dogs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setForm({ name: '', breed: '', size: 'MEDIUM', notes: '' })
    setAdding(false)
    setSaving(false)
    load()
  }

  async function deleteDog(id: string) {
    if (!confirm('Remove this dog?')) return
    setDeleting(id)
    await fetch(`/api/dogs/${id}`, { method: 'DELETE' })
    setDeleting(null)
    load()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Dogs</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your dogs to book walks</p>
        </div>
        <button onClick={() => setAdding(!adding)}
          className={adding ? 'btn-secondary' : 'btn-primary'}>
          {adding ? 'Cancel' : '+ Add Dog'}
        </button>
      </div>

      {/* Add dog form */}
      {adding && (
        <div className="card p-6 mb-6 border-amber-200">
          <h2 className="font-bold text-gray-900 mb-5">Add a New Dog</h2>
          <form onSubmit={addDog} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Name</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Buddy" className="input" />
              </div>
              <div>
                <label className="label">Breed</label>
                <input required value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
                  placeholder="Golden Retriever" className="input" />
              </div>
            </div>
            <div>
              <label className="label">Size</label>
              <div className="grid grid-cols-3 gap-2">
                {sizeOptions.map(([val, emoji, label]) => (
                  <button key={val} type="button" onClick={() => setForm(f => ({ ...f, size: val }))}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
                      form.size === val ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    <span className="text-xl">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Special Notes <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Allergies, special needs, things walkers should know..."
                className="input resize-none" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full py-3">
              {saving ? 'Adding...' : 'Add Dog'}
            </button>
          </form>
        </div>
      )}

      {/* Dog list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : dogs.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🐶</div>
          <p className="text-gray-600 font-semibold">No dogs added yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first dog to start booking walks</p>
          <button onClick={() => setAdding(true)} className="btn-primary mt-4 mx-auto">+ Add Dog</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {dogs.map(d => (
            <div key={d.id} className="card p-5 group hover:shadow-card-hover hover:-translate-y-0.5 hover:border-amber-100 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                  🐶
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900">{d.name}</div>
                  <div className="text-gray-400 text-sm">{d.breed} · {d.size.charAt(0) + d.size.slice(1).toLowerCase()}</div>
                </div>
                <button onClick={() => deleteDog(d.id)} disabled={deleting === d.id}
                  className="text-gray-300 hover:text-red-400 transition-colors text-sm font-medium disabled:opacity-50">
                  {deleting === d.id ? '...' : 'Remove'}
                </button>
              </div>
              {d.notes && <p className="text-gray-500 text-sm mt-3 leading-relaxed">{d.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
