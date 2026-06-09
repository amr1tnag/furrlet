import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Furrlet',
  description: 'Learn how Furrlet collects, uses, and protects your personal data.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <Link href="/" className="text-amber-500 hover:text-amber-700 text-sm font-semibold transition-colors">← Back to home</Link>
        <h1 className="text-4xl font-black text-gray-900 mt-4 mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm">Last updated: June 2026</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">
        <Section title="1. Introduction">
          <p>Furrlet ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our platform at furrlet.in.</p>
          <p>By using Furrlet, you consent to the practices described in this policy.</p>
        </Section>

        <Section title="2. Information We Collect">
          <p><strong>Information you provide:</strong></p>
          <ul>
            <li>Name, email address, and password when you create an account</li>
            <li>Dog details (name, breed, size, notes) added to your profile</li>
            <li>Walker profile information (bio, city, hourly rate, availability, photo)</li>
            <li>Aadhaar number, if voluntarily submitted for walker verification</li>
            <li>Messages exchanged between owners and walkers on the platform</li>
            <li>Reviews and ratings submitted after completed walks</li>
          </ul>
          <p><strong>Information collected automatically:</strong></p>
          <ul>
            <li>Booking details including dates, duration, and payment status</li>
            <li>Usage data such as pages visited and features used</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul>
            <li>To create and manage your account</li>
            <li>To facilitate bookings between dog owners and walkers</li>
            <li>To process payments via Razorpay</li>
            <li>To send transactional emails (booking confirmations, status updates, refund notifications)</li>
            <li>To verify walker identity when requested</li>
            <li>To improve and maintain the platform</li>
            <li>To respond to customer support queries</li>
          </ul>
        </Section>

        <Section title="4. Payment Information">
          <p>Furrlet does not store your payment card details, UPI IDs, or bank account information. All payment processing is handled by <strong>Razorpay</strong>, a PCI-DSS compliant payment gateway. Please refer to <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer">Razorpay's Privacy Policy</a> for details on how they handle payment data.</p>
        </Section>

        <Section title="5. Aadhaar Data">
          <p>If you submit your Aadhaar number for walker verification, it is stored securely in our database and is only accessible to Furrlet administrators for the purpose of identity verification. We display only the last 4 digits in any communications. We do not share Aadhaar data with third parties.</p>
        </Section>

        <Section title="6. Sharing Your Information">
          <p>We do not sell your personal data. We may share information in the following cases:</p>
          <ul>
            <li><strong>Between users:</strong> Your name and relevant booking details are shared between owners and walkers to facilitate the service.</li>
            <li><strong>Service providers:</strong> We use Resend for email delivery, Cloudinary for photo storage, and Neon for database hosting. These providers process data on our behalf.</li>
            <li><strong>Legal requirements:</strong> We may disclose information if required by law or to protect the rights and safety of users.</li>
          </ul>
        </Section>

        <Section title="7. Data Retention">
          <p>We retain your account data for as long as your account is active. Booking history is retained for up to 3 years for dispute resolution purposes. You may request deletion of your account and associated data by contacting us at <a href="mailto:furrlet.in@gmail.com">furrlet.in@gmail.com</a>.</p>
        </Section>

        <Section title="8. Cookies">
          <p>Furrlet uses session cookies to keep you logged in. We do not use tracking or advertising cookies. You can disable cookies in your browser settings, but this may affect login functionality.</p>
        </Section>

        <Section title="9. Security">
          <p>We implement industry-standard security measures including password hashing (bcrypt), HTTPS encryption, and secure database hosting. While we take reasonable precautions, no system is completely secure and we cannot guarantee absolute security.</p>
        </Section>

        <Section title="10. Your Rights">
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Opt out of non-transactional communications</li>
          </ul>
          <p>To exercise any of these rights, email us at <a href="mailto:furrlet.in@gmail.com">furrlet.in@gmail.com</a>.</p>
        </Section>

        <Section title="11. Children's Privacy">
          <p>Furrlet is not intended for users under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has created an account, please contact us immediately.</p>
        </Section>

        <Section title="12. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="13. Contact Us">
          <p>If you have questions or concerns about this Privacy Policy, please contact:</p>
          <ul>
            <li>Email: <a href="mailto:furrlet.in@gmail.com">furrlet.in@gmail.com</a></li>
            <li>Phone: <a href="tel:+917208784418">+91 72087 84418</a></li>
            <li>Instagram: <a href="https://instagram.com/furrlet.in" target="_blank" rel="noopener noreferrer">@furrlet.in</a></li>
          </ul>
        </Section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4 text-sm">
        <Link href="/terms" className="text-amber-500 hover:text-amber-700 font-semibold transition-colors">Terms of Service →</Link>
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
