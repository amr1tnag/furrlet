import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-7xl mb-6 animate-bounce-soft inline-block">🐾</div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">Lost on the trail?</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
        <Link href="/" className="btn-primary text-base px-8 py-3">Go Home</Link>
      </div>
    </div>
  )
}
