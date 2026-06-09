import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Furrlet',
  description: 'Read the Furrlet Terms of Service governing use of our dog walking marketplace.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <Link href="/" className="text-amber-500 hover:text-amber-700 text-sm font-semibold transition-colors">← Back to home</Link>
        <h1 className="text-4xl font-black text-gray-900 mt-4 mb-2">Terms of Service</h1>
        <p className="text-gray-400 text-sm">Last updated: June 2026</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">
        <Section title="1. Acceptance of Terms">
          <p>By accessing or using Furrlet ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. These terms apply to all users including dog owners and dog walkers.</p>
        </Section>

        <Section title="2. About Furrlet">
          <p>Furrlet is an online marketplace that connects dog owners with independent dog walkers. Furrlet does not employ walkers directly. Walkers are independent service providers, and Furrlet facilitates the booking and payment process between owners and walkers.</p>
        </Section>

        <Section title="3. Eligibility">
          <p>You must be at least 18 years of age to create an account on Furrlet. By registering, you confirm that all information you provide is accurate and complete.</p>
        </Section>

        <Section title="4. User Accounts">
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately at <a href="mailto:furrlet.in@gmail.com" className="text-amber-500 hover:text-amber-700">furrlet.in@gmail.com</a> of any unauthorised use of your account. Furrlet is not liable for any loss resulting from unauthorised account access.</p>
        </Section>

        <Section title="5. Bookings and Payments">
          <ul>
            <li>All payments are processed securely through Razorpay. Furrlet does not store card or UPI details.</li>
            <li>A booking is confirmed only after successful payment.</li>
            <li>Dog owners agree to provide accurate information about their dogs, including health conditions or behavioural issues relevant to the walk.</li>
            <li>Walkers agree to honour accepted bookings and provide the service as agreed.</li>
          </ul>
        </Section>

        <Section title="6. Cancellations and Refunds">
          <ul>
            <li>Owners may cancel a booking at any time before it is completed.</li>
            <li>If a paid booking is cancelled, a full refund will be initiated to the original payment method.</li>
            <li>Refunds typically appear within 5–7 business days depending on your bank or payment provider.</li>
            <li>Furrlet reserves the right to withhold refunds in cases of fraudulent activity.</li>
          </ul>
        </Section>

        <Section title="7. Walker Verification">
          <p>Furrlet offers a voluntary verification process for walkers using Aadhaar-based identity confirmation. A verified badge indicates that Furrlet has reviewed the walker's submitted identity document. Verification does not constitute an endorsement or guarantee of service quality.</p>
        </Section>

        <Section title="8. Prohibited Conduct">
          <p>You agree not to:</p>
          <ul>
            <li>Provide false information during registration or booking</li>
            <li>Use the platform for any unlawful purpose</li>
            <li>Harass, threaten, or harm other users</li>
            <li>Attempt to circumvent payments by transacting outside the platform</li>
            <li>Misuse reviews or ratings to harm other users unfairly</li>
          </ul>
        </Section>

        <Section title="9. Liability Disclaimer">
          <p>Furrlet is a marketplace platform and is not responsible for the actions of walkers or owners. Any disputes arising from a booking are between the owner and the walker. Furrlet may, at its discretion, assist in resolving disputes but is not obligated to do so.</p>
          <p>To the maximum extent permitted by law, Furrlet shall not be liable for any indirect, incidental, or consequential damages arising from the use of the platform.</p>
        </Section>

        <Section title="10. Intellectual Property">
          <p>All content on the Furrlet platform, including logos, design, and text, is owned by Furrlet and protected under applicable intellectual property laws. You may not reproduce or distribute any content without written permission.</p>
        </Section>

        <Section title="11. Changes to Terms">
          <p>Furrlet reserves the right to update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms. We will notify users of significant changes via email.</p>
        </Section>

        <Section title="12. Governing Law">
          <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.</p>
        </Section>

        <Section title="13. Contact">
          <p>For questions about these Terms, please contact us at <a href="mailto:furrlet.in@gmail.com" className="text-amber-500 hover:text-amber-700">furrlet.in@gmail.com</a> or call <a href="tel:+917208784418" className="text-amber-500 hover:text-amber-700">+91 72087 84418</a>.</p>
        </Section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4 text-sm">
        <Link href="/privacy" className="text-amber-500 hover:text-amber-700 font-semibold transition-colors">Privacy Policy →</Link>
        <Link href="/" className="text-gray-400 hover:text-gray-600 font-medium transition-colors">Back to home</Link>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
      <div className="text-gray-600 text-sm leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-amber-500 [&_a]:hover:text-amber-700">
        {children}
      </div>
    </div>
  )
}
