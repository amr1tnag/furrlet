'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const ownerSteps = [
  {
    icon: '🐕',
    title: 'Add your dog',
    desc: "Tell us about your furry friend so walkers know who they're walking.",
    action: 'Add a Dog',
    href: '/profile/dogs',
  },
  {
    icon: '🔍',
    title: 'Find a walker',
    desc: 'Browse verified, background-checked walkers in your city.',
    action: 'Browse Walkers',
    href: '/walkers',
  },
  {
    icon: '📅',
    title: 'Book a walk',
    desc: 'Pick a date and time. Secure UPI & card payments.',
    action: 'View Bookings',
    href: '/bookings',
  },
]

const walkerSteps = [
  {
    icon: '✏️',
    title: 'Set up your profile',
    desc: 'Add your photo, bio, city and availability so owners can find you.',
    action: 'Edit Profile',
    href: '/profile/walker',
  },
  {
    icon: '🪪',
    title: 'Get verified',
    desc: 'Submit your Aadhaar for a background check. Verified walkers get more bookings.',
    action: 'Get Verified',
    href: '/profile/walker',
  },
  {
    icon: '💰',
    title: 'Start earning',
    desc: 'Accept booking requests and earn ₹200–500 per hour on your schedule.',
    action: 'View Bookings',
    href: '/bookings',
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
  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div className="h-screen bg-[#FAF5EE] flex flex-col overflow-hidden relative">
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-100 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-black text-[#3D2800]">Furrlet</span>
        </div>
        <Link href="/dashboard" className="text-sm font-semibold text-[#9B7B4F] hover:text-[#6B4F00] transition-colors">
          Skip →
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-evenly px-5 pb-4 relative">

        {/* Welcome + step counter */}
        <div>
          <p className="text-[#9B7B4F] text-sm">
            Welcome, <span className="font-semibold text-[#6B4F00]">{session?.user?.name?.split(' ')[0]}</span> 👋
          </p>
          <h1 className="text-2xl font-black text-[#3D2800] mt-0.5">
            {role === 'WALKER' ? "Let's get you earning" : "Let's get you started"}
          </h1>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`transition-all duration-300 rounded-full h-2 ${
              i === step ? 'w-6 bg-amber-500' : i < step ? 'w-2 bg-amber-300' : 'w-2 bg-[#E8D5B0]'
            }`} />
          ))}
          <span className="text-xs text-[#9B7B4F] ml-1">{step + 1} / {steps.length}</span>
        </div>

        {/* Main step card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(232,150,10,0.10)] border border-[#F0E4D0] p-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              {current.icon}
            </div>
            <div>
              <div className="text-xs font-bold text-[#C4A882] uppercase tracking-widest mb-1">Step {step + 1}</div>
              <h2 className="text-lg font-black text-[#3D2800]">{current.title}</h2>
              <p className="text-[#9B7B4F] text-sm mt-1 leading-relaxed">{current.desc}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 rounded-xl border-2 border-[#F0D9B0] text-[#6B4F00] font-semibold text-sm hover:border-amber-300 transition-all active:scale-[0.98]">
                ← Back
              </button>
            )}
            {!isLast ? (
              <button onClick={() => setStep(s => s + 1)}
                className="flex-1 bg-[#E8960A] hover:bg-[#C47C00] text-white font-bold py-3 rounded-xl text-sm transition-all active:scale-[0.98]">
                Next →
              </button>
            ) : (
              <Link href={current.href}
                className="flex-1 bg-[#E8960A] hover:bg-[#C47C00] text-white font-bold py-3 rounded-xl text-sm transition-all active:scale-[0.98] text-center">
                {current.action} →
              </Link>
            )}
          </div>
        </div>

        {/* Steps overview */}
        <div className="space-y-2">
          {steps.map((s, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left ${
                i === step
                  ? 'bg-amber-50 border border-amber-200'
                  : i < step
                  ? 'bg-white border border-[#F0E4D0] opacity-70'
                  : 'bg-white border border-[#F0E4D0]'
              }`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${
                i < step ? 'bg-green-100 text-green-600' : 'bg-amber-50 text-base'
              }`}>
                {i < step ? '✓' : s.icon}
              </div>
              <span className={`text-sm font-semibold flex-1 ${i === step ? 'text-[#3D2800]' : 'text-[#9B7B4F]'}`}>
                {s.title}
              </span>
              {i < step && <span className="text-xs font-bold text-green-500">Done</span>}
              {i === step && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
