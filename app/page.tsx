import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50 -z-10" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span>🐾</span> Trusted by dog lovers across India
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
            Every tail deserves<br />
            <span className="text-amber-500">a great walk</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with trusted, vetted dog walkers near you — or earn money doing what you love.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup?role=owner"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 text-white px-8 py-4 rounded-2xl text-base font-semibold hover:bg-amber-600 active:scale-95 transition-all shadow-lg shadow-amber-200">
              🐕 Find a walker
            </Link>
            <Link href="/auth/signup?role=walker"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-200 px-8 py-4 rounded-2xl text-base font-semibold hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
              🦮 Become a walker
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-3 gap-8 text-center">
          {[['500+', 'Happy dogs walked'], ['200+', 'Verified walkers'], ['4.9 / 5', 'Average rating']].map(([num, label]) => (
            <div key={label}>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{num}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">How Furrlet works</h2>
          <p className="text-gray-500 mt-3 text-lg">Simple, safe, and stress-free</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', icon: '📋', title: 'Create your profile', desc: 'Sign up as a dog owner or a walker. Add your dog\'s details or your walking experience in minutes.' },
            { step: '02', icon: '🔍', title: 'Find your match', desc: 'Browse walkers by location and price, read reviews, and pick the perfect fit for your pup.' },
            { step: '03', icon: '✅', title: 'Book & relax', desc: 'Request a booking, get confirmed, and enjoy peace of mind knowing your dog is in great hands.' },
          ].map(f => (
            <div key={f.step} className="card p-7 relative overflow-hidden group hover:border-amber-200 hover:shadow-md transition-all duration-200">
              <div className="absolute top-5 right-5 text-5xl font-black text-gray-50 group-hover:text-amber-50 transition-colors select-none">{f.step}</div>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Why dog owners love Furrlet</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🛡️', title: 'Verified walkers', desc: 'Every walker is reviewed and rated by real dog owners.' },
              { icon: '⭐', title: 'Honest reviews', desc: 'Read genuine reviews from other owners before booking.' },
              { icon: '📍', title: 'Local walkers', desc: 'Find walkers right in your neighbourhood.' },
              { icon: '💬', title: 'Easy booking', desc: 'Book a walk in under 2 minutes, any time of day.' },
              { icon: '💰', title: 'Fair pricing', desc: 'Transparent hourly rates, no hidden fees.' },
              { icon: '🐶', title: 'Happy dogs', desc: 'Tail wags guaranteed, or we make it right.' },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-5 border border-gray-100 flex gap-4 items-start">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{f.icon}</div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{f.title}</div>
                  <div className="text-gray-500 text-sm mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-6">🐾</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">Ready to get started?</h2>
          <p className="text-gray-500 text-lg mb-8">Join hundreds of happy dog owners and walkers on Furrlet.</p>
          <Link href="/auth/signup"
            className="inline-flex items-center justify-center gap-2 bg-amber-500 text-white px-10 py-4 rounded-2xl text-base font-semibold hover:bg-amber-600 active:scale-95 transition-all shadow-lg shadow-amber-200">
            Create your free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="font-bold text-gray-800">Furrlet</span>
          </div>
          <p className="text-gray-400 text-sm">© 2026 Furrlet. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/auth/signin" className="hover:text-gray-800 transition">Sign in</Link>
            <Link href="/auth/signup" className="hover:text-gray-800 transition">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
