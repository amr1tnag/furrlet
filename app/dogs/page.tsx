'use client'
import { useEffect, useState } from 'react'

const sizeConfig: Record<string, { label: string; color: string }> = {
  SMALL:  { label: 'Small',  color: 'bg-blue-50 text-blue-600' },
  MEDIUM: { label: 'Medium', color: 'bg-amber-50 text-amber-600' },
  LARGE:  { label: 'Large',  color: 'bg-purple-50 text-purple-600' },
}

const dogEmojis = ['🐶', '🐩', '🦮', '🐕', '🐕‍🦺']

function SkeletonCard() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 shimmer rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 shimmer w-24" />
          <div className="h-3 shimmer w-32" />
        </div>
        <div className="h-6 shimmer w-16 rounded-full" />
      </div>
      <div className="h-3 shimmer w-3/4" />
      <div className="h-3 shimmer w-1/2" />
    </div>
  )
}

export default function DogsPage() {
  const [dogs, setDogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dogs/all').then(r => r.json()).then(d => {
      setDogs(Array.isArray(d) ? d : [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dogs Looking for Walks</h1>
        <p className="text-gray-500 text-sm mt-1">These pups are waiting for a great walker like you</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : dogs.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🐶</div>
          <p className="text-gray-600 font-semibold">No dogs listed yet</p>
          <p className="text-gray-400 text-sm mt-1">Check back soon!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dogs.map((d, i) => {
            const size = sizeConfig[d.size] ?? sizeConfig.MEDIUM
            return (
              <div key={d.id} className="card group hover:shadow-card-hover hover:-translate-y-1 hover:border-amber-100 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      {dogEmojis[i % dogEmojis.length]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 truncate">{d.name}</div>
                      <div className="text-gray-400 text-sm truncate">{d.breed}</div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${size.color}`}>
                      {size.label}
                    </span>
                  </div>
                  {d.notes && (
                    <p className="text-gray-500 text-sm leading-relaxed mb-3 line-clamp-2">{d.notes}</p>
                  )}
                  <div className="flex items-center gap-1.5 pt-3 border-t border-gray-50">
                    <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {d.owner.name[0].toUpperCase()}
                    </div>
                    <span className="text-gray-500 text-xs">Owned by <span className="font-medium text-gray-700">{d.owner.name}</span></span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
