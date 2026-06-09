'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Walkers() {
  const [walkers, setWalkers] = useState<any[]>([])
  useEffect(() => { fetch('/api/walkers').then(r => r.json()).then(d => setWalkers(Array.isArray(d) ? d : [])) }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Find a Walker</h1>
      <p className="text-gray-500 mb-8">Browse trusted dog walkers in your area</p>
      {walkers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No walkers available yet. Check back soon!</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {walkers.map(w => (
            <div key={w.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-amber-300 transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-xl">🦮</div>
                <div>
                  <div className="font-bold text-gray-800">{w.user.name}</div>
                  <div className="text-gray-500 text-sm">📍 {w.city}</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{w.bio}</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-amber-500 font-bold text-lg">${w.hourlyRate}/hr</div>
                  {w.rating > 0 && <div className="text-yellow-500 text-sm">{'⭐'.repeat(Math.round(w.rating))} {w.rating.toFixed(1)}</div>}
                </div>
                <Link href={`/walkers/${w.user.id}`} className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-600 transition">
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
