'use client'
import { useEffect, useState } from 'react'

const sizeLabel: Record<string, string> = { SMALL: '🐩 Small', MEDIUM: '🐕 Medium', LARGE: '🦮 Large' }

export default function DogsPage() {
  const [dogs, setDogs] = useState<any[]>([])
  useEffect(() => { fetch('/api/dogs/all').then(r => r.json()).then(d => setDogs(Array.isArray(d) ? d : [])) }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Dogs Looking for Walks</h1>
      <p className="text-gray-500 mb-8">These pups are waiting for a great walker like you</p>
      {dogs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No dogs listed yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dogs.map(d => (
            <div key={d.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">🐶</div>
                <div>
                  <div className="font-bold text-gray-800">{d.name}</div>
                  <div className="text-gray-500 text-sm">{d.breed}</div>
                </div>
                <div className="ml-auto text-sm bg-amber-100 text-amber-700 px-2 py-1 rounded-full">{sizeLabel[d.size]}</div>
              </div>
              {d.notes && <p className="text-gray-600 text-sm mb-3">{d.notes}</p>}
              <div className="text-gray-500 text-sm">Owner: {d.owner.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
