'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

function SkeletonCard() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 shimmer w-28" />
          <div className="h-3 shimmer w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 shimmer w-full" />
        <div className="h-3 shimmer w-4/5" />
        <div className="h-3 shimmer w-3/5" />
      </div>
      <div className="h-8 shimmer w-full" />
    </div>
  )
}

const gradients = [
  'from-amber-100 to-orange-100',
  'from-blue-100 to-cyan-100',
  'from-purple-100 to-pink-100',
  'from-green-100 to-emerald-100',
  'from-rose-100 to-pink-100',
  'from-indigo-100 to-purple-100',
]

export default function Walkers() {
  const [walkers, setWalkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/walkers').then(r => r.json()).then(d => {
      setWalkers(Array.isArray(d) ? d : [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Find a Walker</h1>
        <p className="text-gray-500 text-sm mt-1">Browse verified dog walkers in your area</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : walkers.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4 animate-bounce-soft inline-block">🦮</div>
          <p className="text-gray-600 font-semibold">No walkers available yet</p>
          <p className="text-gray-400 text-sm mt-1">Check back soon!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {walkers.map((w, i) => (
            <div key={w.id}
              className="card group relative overflow-hidden hover:shadow-card-hover hover:-translate-y-1.5 hover:border-amber-100 transition-all duration-300"
              style={{ animationDelay: `${i * 60}ms` }}>

              {/* Top gradient bar */}
              <div className={`h-1.5 bg-gradient-to-r ${gradients[i % gradients.length]} opacity-70 group-hover:opacity-100 transition-opacity`} />

              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${gradients[i % gradients.length]} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    🦮
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-gray-900 truncate text-base">{w.user.name}</div>
                    <div className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{w.city}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{w.bio}</p>

                {/* Rating */}
                {w.rating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={`text-sm transition-colors ${s <= Math.round(w.rating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-gray-800">{w.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{w.reviewCount} reviews</span>
                  </div>
                )}

                {/* Availability pill */}
                <div className="flex items-center gap-1.5 mb-5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-soft" />
                  <span className="text-xs text-gray-500 truncate">{w.availability}</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div>
                    <span className="text-xl font-black text-gray-900">${w.hourlyRate}</span>
                    <span className="text-gray-400 text-sm font-normal">/hr</span>
                  </div>
                  <Link href={`/walkers/${w.user.id}`}
                    className="btn-primary text-sm py-2 px-4 group-hover:shadow-amber-200">
                    View & Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
