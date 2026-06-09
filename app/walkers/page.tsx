'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Walkers() {
  const [walkers, setWalkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/walkers').then(r => r.json()).then(d => { setWalkers(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="page-title">Find a Walker</h1>
        <p className="page-subtitle">Browse verified dog walkers in your area</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : walkers.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-4xl mb-3">🦮</div>
          <p className="text-gray-500 font-medium">No walkers available yet</p>
          <p className="text-gray-400 text-sm mt-1">Check back soon!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {walkers.map(w => (
            <div key={w.id} className="card p-6 hover:border-amber-200 hover:shadow-md transition-all duration-200 flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                  🦮
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{w.user.name}</div>
                  <div className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {w.city}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{w.bio}</p>

              {/* Rating */}
              {w.rating > 0 && (
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-sm ${s <= Math.round(w.rating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{w.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({w.reviewCount} reviews)</span>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div>
                  <span className="text-lg font-bold text-gray-900">${w.hourlyRate}</span>
                  <span className="text-gray-400 text-sm">/hr</span>
                </div>
                <Link href={`/walkers/${w.user.id}`}
                  className="btn-primary py-2 px-4 text-sm">
                  View & Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
