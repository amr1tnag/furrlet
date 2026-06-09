import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-white overflow-hidden">

      {/* Hero */}
      <section className="relative mesh-bg min-h-[92vh] flex items-center">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow" />
        <div className="absolute top-40 left-1/3 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center w-full">
          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 glass text-amber-700 text-sm font-semibold px-5 py-2 rounded-full mb-10 shadow-sm">
            <span className="animate-bounce-soft inline-block">🐾</span>
            Trusted by dog lovers across India
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up delay-100 text-5xl sm:text-7xl font-black text-gray-900 tracking-tight leading-[1.05] mb-6">
            Every tail deserves<br />
            <span className="gradient-text">a great walk</span>
          </h1>

          <p className="animate-fade-up delay-200 text-lg sm:text-xl text-gray-500 max-w-xl mx-auto mb-12 leading-relaxed">
            Connect with trusted, vetted dog walkers near you — or earn money doing what you love.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup?role=owner"
              className="group inline-flex items-center justify-center gap-3 bg-amber-500 text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-amber-600 active:scale-95 transition-all duration-200 shadow-xl shadow-amber-200 hover:shadow-2xl hover:shadow-amber-300 hover:-translate-y-0.5">
              <span className="text-xl group-hover:animate-bounce-soft">🐕</span>
              I need a walker
            </Link>
            <Link href="/auth/signup?role=walker"
              className="group inline-flex items-center justify-center gap-3 glass text-gray-800 px-8 py-4 rounded-2xl text-base font-bold hover:bg-white active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5">
              <span className="text-xl group-hover:animate-bounce-soft">🦮</span>
              I&apos;m a walker
            </Link>
          </div>

          {/* Floating dog cards */}
          <div className="animate-fade-up delay-400 hidden sm:flex flex-wrap justify-center gap-3">
            {[
              { emoji: '🐕', name: 'Buddy', type: 'Golden Retriever' },
              { emoji: '🐩', name: 'Mochi', type: 'Shih Tzu' },
              { emoji: '🦮', name: 'Zeus', type: 'German Shepherd' },
              { emoji: '🐶', name: 'Luna', type: 'Labrador' },
            ].map((dog, i) => (
              <div key={dog.name}
                className={`glass px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${
                  i % 2 === 0 ? 'animate-float' : 'animate-float-slow'
                }`}
                style={{ animationDelay: `${i * 0.5}s` }}>
                <span className="text-2xl">{dog.emoji}</span>
                <div className="text-left">
                  <div className="text-sm font-bold text-gray-800">{dog.name}</div>
                  <div className="text-xs text-gray-400">{dog.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-3 gap-4 sm:gap-8 text-center">
          {[
            { num: '500+', label: 'Happy dogs walked', icon: '🐕' },
            { num: '200+', label: 'Verified walkers', icon: '🦮' },
            { num: '4.9★', label: 'Average rating', icon: '⭐' },
          ].map(({ num, label, icon }) => (
            <div key={label} className="group">
              <div className="text-2xl mb-1 group-hover:animate-bounce-soft transition-all">{icon}</div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900">{num}</div>
              <div className="text-gray-400 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">How it works</div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">Simple, safe, stress-free</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '📋', title: 'Create your profile', desc: 'Sign up as a dog owner or walker. Set up your profile in under 2 minutes.' },
              { step: '02', icon: '🔍', title: 'Find your match', desc: 'Browse walkers by location and price, read real reviews from other dog owners.' },
              { step: '03', icon: '✅', title: 'Book & relax', desc: 'Request a booking, get confirmed, and enjoy peace of mind knowing your pup is safe.' },
            ].map((f, i) => (
              <div key={f.step}
                className="card-hover p-8 group relative overflow-hidden"
                style={{ animationDelay: `${i * 150}ms` }}>
                {/* Step number watermark */}
                <div className="absolute -top-2 -right-2 text-8xl font-black text-gray-50 group-hover:text-amber-50 transition-colors select-none leading-none">{f.step}</div>
                {/* Icon circle */}
                <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">Why Furrlet</div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">Built for dog lovers</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🛡️', title: 'Verified walkers', desc: 'Every walker is reviewed and rated by real dog owners in your area.' },
              { icon: '⭐', title: 'Real reviews', desc: 'See honest ratings before you book. No fake reviews, ever.' },
              { icon: '📍', title: 'Local first', desc: 'Find experienced walkers right in your neighbourhood.' },
              { icon: '💬', title: 'Easy booking', desc: 'Book a walk in under 2 minutes, any time of day or night.' },
              { icon: '💰', title: 'Fair pricing', desc: 'Transparent hourly rates. No hidden fees, no surprises.' },
              { icon: '🐶', title: 'Happy dogs', desc: 'Thousands of tail wags and counting. Your pup deserves the best.' },
            ].map((f, i) => (
              <div key={f.title}
                className="group flex gap-4 items-start p-5 rounded-2xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                style={{ animationDelay: `${i * 50}ms` }}>
                <div className="w-11 h-11 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 group-hover:shadow-sm transition-all duration-200">
                  {f.icon}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm mb-0.5">{f.title}</div>
                  <div className="text-gray-500 text-sm leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 px-4 mesh-bg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6 animate-bounce-soft inline-block">🐾</div>
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-500 text-lg mb-10 leading-relaxed">
            Join hundreds of happy dog owners and walkers.<br />Free forever, no credit card required.
          </p>
          <Link href="/auth/signup"
            className="inline-flex items-center justify-center gap-2 bg-amber-500 text-white px-10 py-4 rounded-2xl text-base font-bold hover:bg-amber-600 active:scale-95 transition-all duration-200 shadow-xl shadow-amber-200 hover:shadow-2xl hover:shadow-amber-300 hover:-translate-y-0.5">
            Create your free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 pt-14 pb-0 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">

            {/* Brand column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🐾</span>
                <span className="font-black text-white text-xl">Furrlet</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                India&apos;s trusted dog walking marketplace. Find verified walkers or earn money doing what you love.
              </p>
              {/* Social icons */}
              <div className="flex gap-3">
                <a href="https://instagram.com/furrlet.in" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-amber-500 rounded-xl flex items-center justify-center transition-colors text-sm">
                  📸
                </a>
                <a href="mailto:furrlet.in@gmail.com"
                  className="w-9 h-9 bg-gray-800 hover:bg-amber-500 rounded-xl flex items-center justify-center transition-colors text-sm">
                  ✉️
                </a>
                <a href="tel:+917208784418"
                  className="w-9 h-9 bg-gray-800 hover:bg-amber-500 rounded-xl flex items-center justify-center transition-colors text-sm">
                  📞
                </a>
              </div>
            </div>

            {/* Cities */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Cities</h3>
              <ul className="space-y-2.5 text-sm">
                {['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata'].map(city => (
                  <li key={city}>
                    <Link href={`/walkers?q=${city}`} className="text-gray-400 hover:text-white transition-colors">{city}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Platform</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/walkers" className="text-gray-400 hover:text-white transition-colors">Find a Walker</Link></li>
                <li><Link href="/auth/signup" className="text-gray-400 hover:text-white transition-colors">Become a Walker</Link></li>
                <li><Link href="/auth/signin" className="text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/bookings" className="text-gray-400 hover:text-white transition-colors">My Bookings</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/messages" className="text-gray-400 hover:text-white transition-colors">Messages</Link></li>
              </ul>
            </div>

            {/* Company + Contact */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Company</h3>
              <ul className="space-y-2.5 text-sm mb-6">
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Contact Us</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="mailto:furrlet.in@gmail.com" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <span className="text-xs">✉</span> furrlet.in@gmail.com
                  </a>
                </li>
                <li>
                  <a href="tel:+917208784418" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <span className="text-xs">📞</span> +91 72087 84418
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com/furrlet.in" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <span className="text-xs">📸</span> @furrlet.in
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <p>© 2026 Furrlet. All rights reserved.</p>
            <div className="flex gap-5">
              <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms &amp; Conditions</Link>
              <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
