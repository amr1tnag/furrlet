'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const ownerSteps = [
  {
    id: 1,
    icon: '🐕',
    title: 'Add your dog',
    desc: 'Tell us about your furry friend so walkers know who they\'re walking.',
    action: 'Add a Dog',
    href: '/profile/dogs',
    color: 'from-amber-400 to-orange-400',
    bg: 'from-amber-50 to-orange-50',
  },
  {
    id: 2,
    icon: '🔍',
    title: 'Find a walker',
    desc: 'Browse verified, background-checked walkers in your city.',
    action: 'Browse Walkers',
    href: '/walkers',
    color: 'from-blue-400 to-indigo-400',
    bg: 'from-blue-50 to-indigo-50',
  },
  {
    id: 3,
    icon: '📅',
    title: 'Book a walk',
    desc: 'Pick a date and time. Pay ₹99 for 30 min or ₹199 for 1 hour.',
    action: 'View Bookings',
    href: '/bookings',
    color: 'from-green-400 to-emerald-400',
    bg: 'from-green-50 to-emerald-50',
  },
]

const walkerSteps = [
  {
    id: 1,
    icon: '✏️',
    title: 'Set up your profile',
    desc: 'Add your photo, bio, city and availability so owners can find you.',
    action: 'Edit Profile',
    href: '/profile/walker',
    color: 'from-amber-400 to-orange-400',
    bg: 'from-amber-50 to-orange-50',
  },
  {
    id: 2,
    icon: '🪪',
    title: 'Get verified',
    desc: 'Submit your Aadhaar for a background check. Verified walkers get more bookings.',
    action: 'Get Verified',
    href: '/profile/walker#verify',
    color: 'from-blue-400 to-indigo-400',
    bg: 'from-blue-50 to-indigo-50',
  },
  {
    id: 3,
    icon: '💰',
    title: 'Start earning',
    desc: 'Accept booking requests and earn ₹99–₹199 per walk.',
    action: 'View Bookings',
    href: '/bookings',
    color: 'from-green-400 to-emerald-400',
    bg: 'from-green-50 to-emerald-50',
  },
]

export default function Onboarding() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const role = (session?.user as any)?.role
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  if (status === 'loading') return null

  const steps = role === 'WALKER' ? walkerSteps : ownerSteps
  const isLast = step === steps.length - 1

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-amber-50 to-white">
      <div className="w-full max-w-md">
        {/* Logo + skip */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-black text-lg text-gray-900">Furrlet</span>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors">
            Skip →
          </Link>
        </div>

        {/* Welcome */}
        {step === 0 && (
          <div className="text-center mb-8 animate-fade-up">
            <div className="text-5xl mb-3">👋</div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">
              Welcome, {session?.user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-500 text-sm">
              {role === 'WALKER'
                ? "You're almost ready to start earning. Here's how to get set up:"
                : "Let's get you set up in 3 quick steps."}
            </p>
          </div>
        )}

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className={`transition-all duration-300 rounded-full ${
              i === step ? 'w-6 h-2 bg-amber-500' : i < step ? 'w-2 h-2 bg-amber-300' : 'w-2 h-2 bg-gray-200'
            }`} />
          ))}
        </div>

        {/* Step card */}
        <div key={step} className="card p-8 mb-6 animate-fade-up">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${steps[step].bg} flex items-center justify-center text-3xl mb-5 shadow-sm`}>
            {steps[step].icon}
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Step {step + 1} of {steps.length}
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">{steps[step].title}</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">{steps[step].desc}</p>

          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1">
                ← Back
              </button>
            )}
            {!isLast ? (
              <button onClick={() => setStep(s => s + 1)} className="btn-primary flex-1">
                Next →
              </button>
            ) : (
              <Link href={steps[step].href} className="btn-primary flex-1 text-center">
                {steps[step].action} →
              </Link>
            )}
          </div>
        </div>

        {/* All steps overview */}
        <div className="space-y-2">
          {steps.map((s, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left ${
                i === step ? 'bg-amber-50 border border-amber-200' : i < step ? 'opacity-60' : 'hover:bg-gray-50'
              }`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${
                i < step ? 'bg-green-100' : `bg-gradient-to-br ${s.bg}`
              }`}>
                {i < step ? '✓' : s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800">{s.title}</div>
              </div>
              {i === step && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />}
              {i < step && <div className="text-xs text-green-500 font-bold flex-shrink-0">Done</div>}
            </button>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Go to dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}
