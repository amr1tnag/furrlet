import Link from 'next/link'

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Every tail deserves a great walk</h1>
          <p className="text-xl text-gray-600 mb-10">Connect with trusted dog walkers in your area, or earn money doing what you love.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?role=owner" className="bg-amber-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-amber-600 transition shadow-md">
              🐕 I need a walker
            </Link>
            <Link href="/auth/signup?role=walker" className="bg-white text-amber-600 border-2 border-amber-500 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-amber-50 transition shadow-md">
              🦮 I&apos;m a walker
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '📋', title: 'Create your profile', desc: 'Sign up as an owner or walker. Add your details, your dog\'s info, or your walking experience.' },
            { icon: '🔍', title: 'Find your match', desc: 'Browse walkers by location and rate, or let walkers discover dogs that need walks.' },
            { icon: '✅', title: 'Book & walk', desc: 'Request a booking, confirm the details, and enjoy peace of mind knowing your dog is in good hands.' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-amber-500 py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center text-white">
          {[['500+', 'Happy Dogs'], ['200+', 'Trusted Walkers'], ['4.9★', 'Average Rating']].map(([num, label]) => (
            <div key={label}>
              <div className="text-4xl font-bold">{num}</div>
              <div className="text-amber-100">{label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
