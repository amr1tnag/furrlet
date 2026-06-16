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
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="font-bold text-[#3D2800] text-xl">Furrlet</span>
        </div>
        <Link href="/profile/dogs" className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm">
          P
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A07840]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Find walkers near you"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-[#F0D9B0] rounded-full pl-11 pr-4 py-3 text-sm text-[#3D2800] placeholder-[#A07840] focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
        />
      </div>

      {/* City filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
        {['All Cities', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'].map(city => {
          const active = city === 'All Cities' ? !search || search === '' : search.toLowerCase() === city.toLowerCase()
          return (
            <button
              key={city}
              onClick={() => setSearch(city === 'All Cities' ? '' : city)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                active
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white border border-[#F0D9B0] text-[#6B4F00] hover:border-amber-400'
              }`}>
              {city}
            </button>
          )
        })}
      </div>

      {/* Stats row */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 mb-6">
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {[
            { value: '500+', label: 'Happy Dogs' },
            { value: '200+', label: 'Walkers' },
            { value: '4.9★', label: 'Avg Rating' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center px-2">
              <div className="text-base font-black text-amber-500">{value}</div>
              <div className="text-xs text-[#6B4F00] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section heading */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#3D2800] text-lg">Top Rated Walkers</h2>
        {!loading && <span className="text-xs text-[#A07840]">{filtered.length} found</span>}
      </div>

      {/* Walker cards */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-[#3D2800] font-semibold">No walkers found</p>
          <p className="text-[#A07840] text-sm mt-1">Try a different city or clear your search</p>
          <button onClick={clearFilters} className="mt-4 bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-amber-600 transition-colors">Clear filters</button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((w, i) => (
            <div key={w.id} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 flex gap-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all duration-200">
              {/* Photo */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-xl bg-amber-100 overflow-hidden flex items-center justify-center text-3xl">
                  {w.photoUrl
                    ? <Image src={w.photoUrl} alt={w.user.name} width={80} height={80} className="object-cover w-full h-full" />
                    : '🦮'
                  }
                </div>
                {w.verified && (
                  <span className="absolute -top-1.5 -left-1.5 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">PRO</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#3D2800] text-base mb-0.5">{w.user.name}</div>

                {/* Rating */}
                {w.rating > 0 && (
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-amber-400 text-sm">★</span>
                    <span className="text-sm font-semibold text-[#3D2800]">{w.rating.toFixed(1)}</span>
                    <span className="text-xs text-[#A07840]">({w.reviewCount})</span>
                  </div>
                )}

                {/* City */}
                <div className="flex items-center gap-1 mb-1.5">
                  <svg className="w-3 h-3 text-[#A07840]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs text-[#6B4F00]">{w.city}</span>
                </div>

                {/* Verified badge */}
                {w.verified && (
                  <span className="inline-flex items-center gap-1 border border-gray-200 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                    ✓ ID Verified
                  </span>
                )}

                {/* Price + Book */}
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <span className="text-base font-black text-[#3D2800]">₹{w.hourlyRate}</span>
                    <span className="text-xs text-[#A07840]">/hr</span>
                  </div>
                  <Link href={`/walkers/${w.user.id}`}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-4 py-2 rounded-full transition-colors">
                    Book
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
