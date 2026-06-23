'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat', 'Other',
]

function WaitlistForm() {
  const [form, setForm] = useState({ name: '', email: '', city: '', role: 'OWNER' as const, phone: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setStatus('success')
    } catch (err: any) {
      setMessage(err.message)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-10 px-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-[#3D2800] mb-2">You&apos;re on the list!</h3>
        <p className="text-[#9B7B4F] text-sm leading-relaxed">
          Thanks for joining! We&apos;ll notify you the moment Furrlet launches in your city.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#3D2800] mb-1.5">Full Name</label>
          <input
            required value={form.name} onChange={set('name')}
            placeholder="Rahul Sharma"
            className="w-full border border-[#F0D9B0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-[#FDF8F0] placeholder-[#C4A87A] text-[#3D2800] transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#3D2800] mb-1.5">Email Address</label>
          <input
            required type="email" value={form.email} onChange={set('email')}
            placeholder="you@example.com"
            className="w-full border border-[#F0D9B0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-[#FDF8F0] placeholder-[#C4A87A] text-[#3D2800] transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#3D2800] mb-1.5">Your City</label>
        <select
          required value={form.city} onChange={set('city')}
          className="w-full border border-[#F0D9B0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-[#FDF8F0] text-[#3D2800] transition-all appearance-none"
        >
          <option value="">Select city...</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#3D2800] mb-1.5">
          Phone <span className="text-[#9B7B4F] font-normal">(optional)</span>
        </label>
        <input
          type="tel" value={form.phone} onChange={set('phone')}
          placeholder="+91 98765 43210"
          className="w-full border border-[#F0D9B0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-[#FDF8F0] placeholder-[#C4A87A] text-[#3D2800] transition-all"
        />
      </div>

      {status === 'error' && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{message}</p>
      )}

      <button
        type="submit" disabled={status === 'loading'}
        className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-amber-600 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 shadow-md shadow-amber-200 hover:shadow-lg hover:shadow-amber-300 flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Joining...
          </>
        ) : (
          <>
            Join the Waitlist
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-[#9B7B4F]">
        No spam, ever. We&apos;ll only reach out when we launch in your city.
      </p>
    </form>
  )
}

export default function LandingPage() {
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/waitlist').then(r => r.json()).then(d => setWaitlistCount(d.count)).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF5EE]">

      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-50 bg-[#FAF5EE]/90 backdrop-blur-md border-b border-[#F0E4D0]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-black text-[#3D2800] tracking-tight">Furrlet</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <a href="#how-it-works" className="px-3 py-1.5 text-sm text-[#9B7B4F] hover:text-[#3D2800] font-medium transition-colors rounded-lg hover:bg-amber-50">How it works</a>
            <a href="#features" className="px-3 py-1.5 text-sm text-[#9B7B4F] hover:text-[#3D2800] font-medium transition-colors rounded-lg hover:bg-amber-50">Features</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/signin" className="text-sm font-semibold text-[#9B7B4F] hover:text-[#3D2800] transition-colors px-3 py-2 hidden sm:block">
              Sign in
            </Link>
            <a href="#waitlist" className="bg-amber-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-sm shadow-amber-200 hover:bg-amber-600 active:scale-95 transition-all">
              Join Waitlist
            </a>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Ambient blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-50 -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-40 translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-amber-50 rounded-full blur-2xl opacity-60 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-5 text-center">
          {/* Badge */}

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#3D2800] leading-[1.1] tracking-tight mb-6">
            Your dog deserves<br />
            <span className="relative inline-block">
              <span className="text-amber-500">the best walks</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8C50 4 100 2 150 6C200 10 250 8 298 4" stroke="#E8960A" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
              </svg>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#9B7B4F] max-w-2xl mx-auto leading-relaxed mb-10">
            Connect with trusted, verified dog walkers in your city. Live GPS tracking,
            in-app chat, and secure payments — everything you need for worry-free walks.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <a href="#waitlist"
              className="w-full sm:w-auto bg-amber-500 text-white font-bold px-8 py-4 rounded-2xl text-base shadow-lg shadow-amber-200 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-300 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2">
              Join the Waitlist
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Social proof pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: '📍', text: 'Live GPS tracking' },
              { icon: '🛡️', text: 'ID verified walkers' },
              { icon: '💬', text: 'In-app messaging' },
              { icon: '⚡', text: 'Book in 2 minutes' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 bg-white border border-[#F0E4D0] rounded-full px-3 py-1.5 text-xs font-medium text-[#6B4F00] shadow-sm">
                <span>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-20 sm:py-24 max-w-5xl mx-auto px-5">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Simple & Fast</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#3D2800] mt-2">How Furrlet works</h2>
          <p className="text-[#9B7B4F] mt-3 max-w-lg mx-auto text-sm sm:text-base">
            From browsing to booking in under 2 minutes. Your dog gets their walk while you get peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              icon: '🔍',
              title: 'Browse Walkers',
              desc: 'Search verified walkers in your area. Filter by city, price, and rating.',
            },
            {
              step: '02',
              icon: '📅',
              title: 'Book a Walk',
              desc: 'Pick your dog, date, and duration. Pay securely via UPI, card, or wallet.',
            },
            {
              step: '03',
              icon: '📍',
              title: 'Track Live',
              desc: 'Follow your pup\'s walk on a live map with real-time GPS updates.',
            },
            {
              step: '04',
              icon: '⭐',
              title: 'Rate & Review',
              desc: 'Share your experience to help other pet parents find great walkers.',
            },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="relative bg-white rounded-2xl border border-[#F0E4D0] p-6 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300 group">
              <div className="absolute top-4 right-4 text-[#F0E4D0] font-black text-3xl group-hover:text-amber-100 transition-colors">{step}</div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-amber-100 transition-colors">{icon}</div>
              <h3 className="font-bold text-[#3D2800] text-base mb-2">{title}</h3>
              <p className="text-[#9B7B4F] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="py-20 sm:py-24 bg-white border-y border-[#F0E4D0]">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Everything included</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#3D2800] mt-2">Built for peace of mind</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: '📍',
                color: 'bg-blue-50 text-blue-600',
                title: 'Live GPS Tracking',
                desc: 'Watch your dog\'s walk in real time on a map. Know exactly where they are at every moment.',
              },
              {
                icon: '🛡️',
                color: 'bg-green-50 text-green-600',
                title: 'Verified Walkers',
                desc: 'Every walker is ID verified with Aadhaar checks. Only trusted people walk your dog.',
              },
              {
                icon: '⚡',
                color: 'bg-amber-50 text-amber-600',
                title: 'Instant Booking',
                desc: 'Book in under 2 minutes. Select your dog, pick a slot, pay — you\'re done.',
              },
              {
                icon: '💬',
                color: 'bg-purple-50 text-purple-600',
                title: 'In-App Chat',
                desc: 'Message your walker directly through the app. No need to share personal numbers.',
              },
              {
                icon: '💳',
                color: 'bg-rose-50 text-rose-600',
                title: 'Secure Payments',
                desc: 'Pay via UPI, card, netbanking, or wallet. Payments held safely until walk is done.',
              },
              {
                icon: '⭐',
                color: 'bg-orange-50 text-orange-600',
                title: 'Ratings & Reviews',
                desc: 'Community-powered reviews help you choose the best walkers every time.',
              },
            ].map(({ icon, color, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl border border-[#F0E4D0] hover:border-amber-200 hover:shadow-sm transition-all duration-200 bg-[#FAF5EE]">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${color}`}>{icon}</div>
                <div>
                  <h3 className="font-bold text-[#3D2800] text-sm mb-1">{title}</h3>
                  <p className="text-[#9B7B4F] text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ─── Waitlist Section ─── */}
      <section id="waitlist" className="py-20 sm:py-24 bg-white border-t border-[#F0E4D0]">
        <div className="max-w-2xl mx-auto px-5">
          {/* Heading */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[22px] flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg shadow-amber-200 rotate-3">
              🐾
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#3D2800] mb-3">
              Be first in your city
            </h2>
            <p className="text-[#9B7B4F] text-sm sm:text-base leading-relaxed">
              Furrlet is growing fast. Join the waitlist and get early access — plus exclusive launch offers
              for our founding members.
            </p>
            {waitlistCount !== null && waitlistCount > 0 && (
              <div className="inline-flex items-center gap-2 mt-4 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5">
                <div className="flex -space-x-1">
                  {['🐩', '🐕', '🦮', '🐩'].map((d, i) => (
                    <span key={i} className="text-sm">{d}</span>
                  ))}
                </div>
                <span className="text-xs font-semibold text-amber-700">
                  {waitlistCount}+ people already joined
                </span>
              </div>
            )}
          </div>

          {/* Form card */}
          <div className="bg-[#FAF5EE] rounded-3xl border border-[#F0E4D0] p-6 sm:p-8 shadow-sm">
            <WaitlistForm />
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            {[
              { icon: '🔒', text: 'No spam, ever' },
              { icon: '📱', text: 'Early access benefits' },
              { icon: '🎁', text: 'Founding member perks' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-[#9B7B4F] text-xs font-medium">
                <span>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#F0E4D0] py-10">
        <div className="max-w-5xl mx-auto px-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐾</span>
              <span className="font-black text-[#3D2800]">Furrlet</span>
              <span className="text-[#9B7B4F] text-xs ml-1">— Trusted dog walking, near you</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#9B7B4F]">
              <Link href="/privacy" className="hover:text-[#3D2800] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#3D2800] transition-colors">Terms</Link>
<Link href="/auth/signin" className="hover:text-[#3D2800] transition-colors">Sign in</Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-[#F0E4D0] text-center text-xs text-[#9B7B4F]">
            © {new Date().getFullYear()} Furrlet. Made with ❤️ for dog parents across India.
          </div>
        </div>
      </footer>
    </div>
  )
}
