'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

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

type SortOption = 'rating' | 'price-asc' | 'price-desc'

function WalkersInner() {
  const searchParams = useSearchParams()
  const cityParam = searchParams.get('city') || ''
  const [walkers, setWalkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(cityParam)
  const [maxPrice, setMaxPrice] = useState(100)
  const [sort, setSort] = useState<SortOption>('rating')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    fetch('/api/walkers').then(r => r.json()).then(d => {
      setWalkers(Array.isArray(d) ? d : [])
      setLoading(false)
    })
  }, [])

  const maxPossiblePrice = useMemo(() => {
    if (walkers.length === 0) return 100
    return Math.ceil(Math.max(...walkers.map(w => w.hourlyRate)) / 10) * 10
  }, [walkers])

  useEffect(() => {
    if (maxPossiblePrice > 0) setMaxPrice(maxPossiblePrice)
  }, [maxPossiblePrice])

  const filtered = useMemo(() => {
    let result = walkers.filter(w => {
      const q = search.toLowerCase()
      const matchesSearch = !q ||
        w.user.name.toLowerCase().includes(q) ||
        w.city.toLowerCase().includes(q) ||
        w.bio.toLowerCase().includes(q)
      const matchesPrice = w.hourlyRate <= maxPrice
      return matchesSearch && matchesPrice
    })

    if (sort === 'rating') result = [...result].sort((a, b) => b.rating - a.rating)
    if (sort === 'price-asc') result = [...result].sort((a, b) => a.hourlyRate - b.hourlyRate)
    if (sort === 'price-desc') result = [...result].sort((a, b) => b.hourlyRate - a.hourlyRate)

    return result
  }, [walkers, search, maxPrice, sort])

  const hasActiveFilters = search || maxPrice < maxPossiblePrice || sort !== 'rating'

  function clearFilters() {
    setSearch('')
    setMaxPrice(maxPossiblePrice)
    setSort('rating')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Find a Walker</h1>
        <p className="text-gray-500 text-sm mt-1">
          {cityParam ? <>Showing walkers in <span className="text-amber-600 font-semibold">{cityParam}</span></> : 'Browse verified dog walkers in your area'}
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="card p-3 sm:p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, city or keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-10 py-2.5"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            className="input py-2.5 sm:w-48 cursor-pointer"
          >
            <option value="rating">Sort: Top Rated</option>
            <option value="price-asc">Sort: Price Low → High</option>
            <option value="price-desc">Sort: Price High → Low</option>
          </select>

          {/* Filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
              filtersOpen || maxPrice < maxPossiblePrice
                ? 'border-amber-400 bg-amber-50 text-amber-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters
            {maxPrice < maxPossiblePrice && (
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Expanded filter panel */}
        {filtersOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-up">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">Max hourly rate</label>
              <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                Up to ₹{maxPrice}/hr
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={maxPossiblePrice}
              step={5}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>₹0/hr</span>
              <span>₹{maxPossiblePrice}/hr</span>
            </div>
          </div>
        )}
      </div>

      {/* Results bar */}
      {!loading && (
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            {filtered.length === 0
              ? 'No walkers found'
              : `Showing ${filtered.length} walker${filtered.length !== 1 ? 's' : ''}`}
            {search && <span className="text-gray-400"> for &quot;<span className="text-gray-600 font-medium">{search}</span>&quot;</span>}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-amber-600 font-semibold hover:text-amber-700 transition-colors flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Walker cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4 animate-bounce-soft inline-block">🔍</div>
          <p className="text-gray-600 font-semibold">No walkers match your search</p>
          <p className="text-gray-400 text-sm mt-1">Try different keywords or adjust your filters</p>
          <button onClick={clearFilters} className="btn-primary mt-4 mx-auto">Clear filters</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((w, i) => (
            <div key={w.id}
              className="card group relative overflow-hidden hover:shadow-card-hover hover:-translate-y-1.5 hover:border-amber-100 transition-all duration-300">
              <div className={`h-1.5 bg-gradient-to-r ${gradients[i % gradients.length]} opacity-70 group-hover:opacity-100 transition-opacity`} />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${gradients[i % gradients.length]} rounded-2xl flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300 overflow-hidden flex items-center justify-center text-2xl`}>
                    {w.photoUrl ? (
                      <Image src={w.photoUrl} alt={w.user.name} width={56} height={56} className="object-cover w-full h-full" />
                    ) : '🦮'}
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

                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{w.bio}</p>

                {w.rating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={`text-sm ${s <= Math.round(w.rating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-gray-800">{w.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{w.reviewCount} reviews</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 mb-5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-soft" />
                  <span className="text-xs text-gray-500 truncate">{w.availability}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div>
                    <span className="text-xl font-black text-gray-900">₹{w.hourlyRate}</span>
                    <span className="text-gray-400 text-sm font-normal">/hr</span>
                  </div>
                  <Link href={`/walkers/${w.user.id}`} className="btn-primary text-sm py-2 px-4">
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

export default function Walkers() {
  return (
    <Suspense>
      <WalkersInner />
    </Suspense>
  )
}
