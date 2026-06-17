import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF5EE] flex flex-col items-center justify-center px-5 py-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative w-full max-w-sm flex flex-col items-center">
        {/* Logo */}
        <div className="relative mb-5">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[28px] flex items-center justify-center shadow-xl shadow-amber-200 rotate-3">
            <span className="text-4xl -rotate-3">🐾</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Brand */}
        <h1 className="text-[2.2rem] font-black text-[#3D2800] tracking-tight leading-tight">Furrlet</h1>
        <p className="text-[#9B7B4F] text-sm text-center mt-1 mb-2">Trusted dog walking, near you</p>

        {/* Trust pill */}
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-8">
          <div className="flex -space-x-1.5">
            {['🐩','🐕','🦮'].map((dog, i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-amber-100 border border-white flex items-center justify-center text-[10px]">{dog}</div>
            ))}
          </div>
          <span className="text-xs font-semibold text-amber-700">500+ happy pups this month</span>
        </div>

        {/* Role cards */}
        <div className="w-full space-y-3 mb-4">
          <Link href="/auth/signup?role=owner"
            className="group flex items-center gap-4 bg-white rounded-2xl p-4 border border-[#F0E4D0] shadow-[0_2px_16px_rgba(232,150,10,0.08)] hover:shadow-[0_4px_24px_rgba(232,150,10,0.16)] hover:border-amber-300 active:scale-[0.98] transition-all duration-200">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">🐕</div>
            <div className="flex-1">
              <div className="font-bold text-[#3D2800] text-[15px]">I&apos;m a Dog Parent</div>
              <div className="text-[#9B7B4F] text-xs mt-0.5">Book trusted local walkers</div>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">GPS tracked</span>
                <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Verified walkers</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-50 group-hover:bg-amber-500 flex items-center justify-center transition-colors duration-200 flex-shrink-0">
              <svg className="w-4 h-4 text-amber-400 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link href="/auth/signup?role=walker"
            className="group flex items-center gap-4 bg-white rounded-2xl p-4 border border-[#F0E4D0] shadow-[0_2px_16px_rgba(232,150,10,0.08)] hover:shadow-[0_4px_24px_rgba(232,150,10,0.16)] hover:border-amber-300 active:scale-[0.98] transition-all duration-200">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">🦮</div>
            <div className="flex-1">
              <div className="font-bold text-[#3D2800] text-[15px]">I&apos;m a Walker</div>
              <div className="text-[#9B7B4F] text-xs mt-0.5">Earn on your own schedule</div>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">₹200–500/hr</span>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">Flexible hours</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-50 group-hover:bg-amber-500 flex items-center justify-center transition-colors duration-200 flex-shrink-0">
              <svg className="w-4 h-4 text-amber-400 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Sign in */}
        <Link href="/auth/signin"
          className="w-full text-center text-[#E8960A] font-semibold py-3 text-sm hover:text-[#C47C00] transition-colors">
          Already have an account? <span className="underline underline-offset-2">Sign in</span>
        </Link>

        {/* Stats */}
        <div className="w-full mt-8 bg-white rounded-2xl border border-[#F0E4D0] p-4 grid grid-cols-3 divide-x divide-[#F0E4D0]">
          {[
            { value: '500+', label: 'Happy dogs', icon: '🐶' },
            { value: '200+', label: 'Walkers', icon: '🏃' },
            { value: '4.9★', label: 'Avg rating', icon: '⭐' },
          ].map(({ value, label, icon }) => (
            <div key={label} className="text-center px-2">
              <div className="text-base">{icon}</div>
              <div className="text-base font-black text-[#E8960A] leading-tight">{value}</div>
              <div className="text-[10px] text-[#9B7B4F] mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Features strip */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {[
            { icon: '📍', text: 'Live GPS' },
            { icon: '🛡️', text: 'ID Verified' },
            { icon: '💬', text: 'In-app chat' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-1 text-[#9B7B4F]">
              <span className="text-sm">{icon}</span>
              <span className="text-[11px] font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
