import Link from 'next/link'

export default function MvpHome() {
  return (
    <div className="h-screen bg-[#FAF5EE] flex flex-col overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-100 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-black text-[#3D2800]">Furrlet</span>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">MVP</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-sm text-[#9B7B4F] font-medium hover:text-[#3D2800] transition-colors">Home</Link>
          <Link href="/auth/signin"
            className="bg-amber-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-sm shadow-amber-200 active:scale-95 transition-transform">
            Sign in
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col items-center justify-evenly px-5 pb-4">

        {/* Logo + tagline */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[22px] flex items-center justify-center shadow-lg shadow-amber-200 rotate-3">
              <span className="text-3xl -rotate-3">🐾</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-[#FAF5EE] flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[#9B7B4F] text-sm">Trusted dog walking, near you</p>
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mt-1.5">
              <div className="flex -space-x-1">
                {['🐩','🐕','🦮'].map((dog, i) => (
                  <div key={i} className="w-4 h-4 rounded-full bg-amber-100 border border-white flex items-center justify-center text-[9px]">{dog}</div>
                ))}
              </div>
              <span className="text-[11px] font-semibold text-amber-700">500+ happy pups this month</span>
            </div>
          </div>
        </div>

        {/* Role cards */}
        <div className="w-full space-y-3">
          <Link href="/auth/signup?role=owner"
            className="group flex items-center gap-3 bg-white rounded-2xl p-3.5 border border-[#F0E4D0] shadow-[0_2px_12px_rgba(232,150,10,0.08)] hover:border-amber-300 active:scale-[0.98] transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🐕</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[#3D2800] text-[15px]">I&apos;m a Dog Parent</div>
              <div className="text-[#9B7B4F] text-xs mt-0.5">Book trusted local walkers</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">GPS tracked</span>
                <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Verified walkers</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-amber-50 group-hover:bg-amber-500 flex items-center justify-center transition-colors duration-200 flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-amber-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link href="/auth/signup?role=walker"
            className="group flex items-center gap-3 bg-white rounded-2xl p-3.5 border border-[#F0E4D0] shadow-[0_2px_12px_rgba(232,150,10,0.08)] hover:border-amber-300 active:scale-[0.98] transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🦮</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[#3D2800] text-[15px]">I&apos;m a Walker</div>
              <div className="text-[#9B7B4F] text-xs mt-0.5">Earn on your own schedule</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">₹200–500/hr</span>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">Flexible hours</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-amber-50 group-hover:bg-amber-500 flex items-center justify-center transition-colors duration-200 flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-amber-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="w-full bg-white rounded-2xl border border-[#F0E4D0] px-4 py-3 grid grid-cols-3 divide-x divide-[#F0E4D0]">
          {[
            { value: '500+', label: 'Happy dogs', icon: '🐶' },
            { value: '200+', label: 'Walkers', icon: '🏃' },
            { value: '4.9★', label: 'Avg rating', icon: '⭐' },
          ].map(({ value, label, icon }) => (
            <div key={label} className="text-center px-2">
              <div className="text-sm">{icon}</div>
              <div className="text-sm font-black text-[#E8960A] leading-tight">{value}</div>
              <div className="text-[10px] text-[#9B7B4F]">{label}</div>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-5">
          {[
            { icon: '📍', text: 'Live GPS' },
            { icon: '🛡️', text: 'ID Verified' },
            { icon: '💬', text: 'In-app chat' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-1 text-[#9B7B4F]">
              <span className="text-xs">{icon}</span>
              <span className="text-[11px] font-medium">{text}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
