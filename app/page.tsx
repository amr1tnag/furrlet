import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF5EE] flex flex-col items-center justify-center px-4 py-16">
      {/* Logo circle */}
      <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-amber-200">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <ellipse cx="10" cy="14" rx="4" ry="5" fill="white" opacity="0.9"/>
          <ellipse cx="34" cy="14" rx="4" ry="5" fill="white" opacity="0.9"/>
          <ellipse cx="18" cy="8" rx="4" ry="5" fill="white" opacity="0.9"/>
          <ellipse cx="26" cy="8" rx="4" ry="5" fill="white" opacity="0.9"/>
          <path d="M8 22c0-7.732 6.268-14 14-14s14 6.268 14 14c0 5.5-2 9-6 11l-8 3-8-3c-4-2-6-5.5-6-11z" fill="white"/>
        </svg>
      </div>

      {/* Brand name */}
      <h1 className="text-4xl font-bold text-[#3D2800] mb-2 tracking-tight">Furrlet</h1>
      <p className="text-[#6B4F00] text-base text-center mb-10 max-w-xs leading-relaxed">
        Every tail deserves a happy walk
      </p>

      {/* Role cards */}
      <div className="w-full max-w-sm space-y-4 mb-8">
        {/* Dog Parent card */}
        <Link href="/auth/signup?role=owner"
          className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] active:scale-[0.98] transition-all duration-200">
          <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">🐕</div>
          <div className="flex-1">
            <div className="font-bold text-[#3D2800] text-base">I&apos;m a Dog Parent</div>
            <div className="text-[#6B4F00] text-sm mt-0.5">Find the perfect walker for your pup</div>
          </div>
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Walker card */}
        <Link href="/auth/signup?role=walker"
          className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] active:scale-[0.98] transition-all duration-200">
          <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">🦮</div>
          <div className="flex-1">
            <div className="font-bold text-[#3D2800] text-base">I&apos;m a Walker</div>
            <div className="text-[#6B4F00] text-sm mt-0.5">Earn by spending time with dogs</div>
          </div>
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Sign in link */}
      <Link href="/auth/signin"
        className="w-full max-w-sm text-center border-2 border-[#E8960A] text-[#E8960A] font-semibold py-3 rounded-2xl hover:bg-amber-50 active:scale-[0.98] transition-all duration-200">
        Already have an account? Sign in
      </Link>

      {/* Trust badges */}
      <div className="flex items-center gap-6 mt-12 text-[#6B4F00]">
        <div className="text-center">
          <div className="text-lg font-black text-[#E8960A]">500+</div>
          <div className="text-xs">Happy Dogs</div>
        </div>
        <div className="w-px h-8 bg-[#E8D5B0]" />
        <div className="text-center">
          <div className="text-lg font-black text-[#E8960A]">200+</div>
          <div className="text-xs">Walkers</div>
        </div>
        <div className="w-px h-8 bg-[#E8D5B0]" />
        <div className="text-center">
          <div className="text-lg font-black text-[#E8960A]">4.9★</div>
          <div className="text-xs">Avg Rating</div>
        </div>
      </div>
    </div>
  )
}
