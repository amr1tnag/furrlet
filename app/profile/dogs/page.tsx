'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const sizeOptions = [['SMALL', 'Small'], ['MEDIUM', 'Medium'], ['LARGE', 'Large']]

export default function ManageDogs() {
  const { data: session } = useSession()
  const [dogs, setDogs] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', breed: '', size: 'MEDIUM', notes: '' })
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(false)

  const load = () => fetch('/api/dogs').then(r => r.json()).then(d => setDogs(Array.isArray(d) ? d : []))
  useEffect(() => { if (session) load() }, [session])

  async function addDog(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/dogs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setForm({ name: '', breed: '', size: 'MEDIUM', notes: '' })
    setAdding(false)
    setLoading(false)
    load()
  }

  async function deleteDog(id: string) {
    await fetch(`/api/dogs/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Dogs</h1>
          <p className="text-gray-500">Manage your dogs to book walks</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="bg-amber-500 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition font-medium">
          {adding ? 'Cancel' : '+ Add Dog'}
        </button>
      </div>

      {adding && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-200 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">Add a New Dog</h2>
          <form onSubmit={addDog} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <input required value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <div className="grid grid-cols-3 gap-2">
                {sizeOptions.map(([val, label]) => (
                  <button key={val} type="button" onClick={() => setForm(f => ({ ...f, size: val }))}
                    className={`py-2 rounded-lg border-2 text-sm font-medium transition ${form.size === val ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Notes (optional)</label>
              <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Any allergies, special needs, or things walkers should know..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <button type="submit" disabled={loading}
              className="bg-amber-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-amber-600 transition disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Dog'}
            </button>
          </form>
        </div>
      )}

      {dogs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🐶</div>
          <p>No dogs added yet. Add your first dog to start booking walks!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {dogs.map(d => (
            <div key={d.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">🐶</div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{d.name}</div>
                  <div className="text-gray-500 text-sm">{d.breed} · {d.size.toLowerCase()}</div>
                </div>
                <button onClick={() => deleteDog(d.id)} className="text-red-400 hover:text-red-600 transition text-sm">Remove</button>
              </div>
              {d.notes && <p className="text-gray-500 text-sm">{d.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
