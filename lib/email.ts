import { Resend } from 'resend'

const FROM = 'Furrlet <notifications@furrlet.in>'
function getResend() { return new Resend(process.env.RESEND_API_KEY) }

export async function sendOtpEmail({ name, email, otp }: { name: string; email: string; otp: string }) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `${otp} is your Furrlet verification code`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fffbeb;border-radius:16px;">
        <div style="font-size:40px;margin-bottom:16px;">🐾</div>
        <h2 style="font-size:22px;font-weight:800;color:#111827;margin:0 0 8px;">Verify your account, ${name}</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Enter this code on the verification page. It expires in 10 minutes.</p>
        <div style="background:white;border-radius:16px;padding:24px;text-align:center;border:2px solid #fde68a;margin-bottom:24px;">
          <div style="font-size:40px;font-weight:900;letter-spacing:12px;color:#111827;">${otp}</div>
        </div>
        <p style="color:#9ca3af;font-size:12px;text-align:center;">If you didn't create a Furrlet account, ignore this email.</p>
      </div>
    `,
  })
}

export async function sendWelcomeEmail({ name, email, role }: { name: string; email: string; role: string }) {
  const isWalker = role === 'WALKER'
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Welcome to Furrlet, ${name}! 🐾`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fffbeb;border-radius:16px;">
        <div style="font-size:40px;margin-bottom:16px;">🐾</div>
        <h2 style="font-size:24px;font-weight:800;color:#111827;margin:0 0 8px;">Welcome to Furrlet, ${name}!</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">
          ${isWalker
            ? "You've joined as a <strong>Dog Walker</strong>. Set up your profile so dog owners can find and book you."
            : "You've joined as a <strong>Dog Owner</strong>. Add your dogs and find a trusted walker near you."}
        </p>
        <a href="https://furrlet.in/${isWalker ? 'profile/walker' : 'profile/dogs'}"
          style="display:block;text-align:center;background:#f59e0b;color:white;font-weight:700;font-size:15px;padding:14px 24px;border-radius:12px;text-decoration:none;margin-bottom:24px;">
          ${isWalker ? 'Set Up Your Profile →' : 'Add Your Dog →'}
        </a>
        <p style="color:#9ca3af;font-size:12px;text-align:center;">Furrlet · Making every tail wag 🐕</p>
      </div>
    `,
  })
}

export async function sendBookingRequestEmail({ walkerEmail, walkerName, ownerName, dogName, date, duration, totalPrice, address }: {
  walkerEmail: string
  walkerName: string
  ownerName: string
  dogName: string
  date: string
  duration: number
  totalPrice: number
  address: string
}) {
  await getResend().emails.send({
    from: FROM,
    to: walkerEmail,
    subject: `New booking request from ${ownerName}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fffbeb;border-radius:16px;">
        <div style="font-size:32px;margin-bottom:16px;">🐾</div>
        <h2 style="font-size:22px;font-weight:800;color:#111827;margin:0 0 8px;">New Walk Request!</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">You have a new booking request on Furrlet.</p>
        <div style="background:white;border-radius:12px;padding:20px;border:1px solid #f3f4f6;margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f9fafb;"><span style="color:#6b7280;font-size:14px;">Owner</span><span style="font-weight:600;font-size:14px;color:#111827;">${ownerName}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f9fafb;"><span style="color:#6b7280;font-size:14px;">Dog</span><span style="font-weight:600;font-size:14px;color:#111827;">${dogName}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f9fafb;"><span style="color:#6b7280;font-size:14px;">Date</span><span style="font-weight:600;font-size:14px;color:#111827;">${date}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f9fafb;"><span style="color:#6b7280;font-size:14px;">Duration</span><span style="font-weight:600;font-size:14px;color:#111827;">${duration} min</span></div>
          ${address ? `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f9fafb;"><span style="color:#6b7280;font-size:14px;">Pickup address</span><span style="font-weight:600;font-size:14px;color:#111827;">${address}</span></div>` : ''}
          <div style="display:flex;justify-content:space-between;padding:8px 0;"><span style="color:#6b7280;font-size:14px;">Total</span><span style="font-weight:800;font-size:16px;color:#f59e0b;">₹${totalPrice.toFixed(0)}</span></div>
        </div>
        <a href="https://furrlet.in/bookings" style="display:block;text-align:center;background:#f59e0b;color:white;font-weight:700;font-size:15px;padding:14px 24px;border-radius:12px;text-decoration:none;">Accept or Decline →</a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;text-align:center;">Furrlet · Making every tail wag</p>
      </div>
    `,
  })
}

export async function sendBookingStatusEmail({ ownerEmail, ownerName, walkerName, dogName, date, status }: {
  ownerEmail: string
  ownerName: string
  walkerName: string
  dogName: string
  date: string
  status: string
}) {
  const accepted = status === 'ACCEPTED'
  await getResend().emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `Your booking was ${accepted ? 'accepted' : 'declined'} by ${walkerName}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fffbeb;border-radius:16px;">
        <div style="font-size:32px;margin-bottom:16px;">${accepted ? '✅' : '❌'}</div>
        <h2 style="font-size:22px;font-weight:800;color:#111827;margin:0 0 8px;">Booking ${accepted ? 'Accepted!' : 'Declined'}</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">
          ${accepted
            ? `Great news! <strong>${walkerName}</strong> has accepted your booking for <strong>${dogName}</strong> on <strong>${date}</strong>.`
            : `<strong>${walkerName}</strong> is unable to walk <strong>${dogName}</strong> on <strong>${date}</strong>. Please browse other walkers.`
          }
        </p>
        <a href="https://furrlet.in/${accepted ? 'bookings' : 'walkers'}" style="display:block;text-align:center;background:#f59e0b;color:white;font-weight:700;font-size:15px;padding:14px 24px;border-radius:12px;text-decoration:none;">
          ${accepted ? 'View Booking →' : 'Find Another Walker →'}
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;text-align:center;">Furrlet · Making every tail wag</p>
      </div>
    `,
  })
}

export async function sendVerificationRequestEmail({ walkerName, walkerEmail, aadhaarNumber }: {
  walkerName: string
  walkerEmail: string
  aadhaarNumber: string
}) {
  await getResend().emails.send({
    from: FROM,
    to: 'amritnag2005@gmail.com',
    subject: `Verification request from ${walkerName}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fffbeb;border-radius:16px;">
        <div style="font-size:32px;margin-bottom:16px;">🪪</div>
        <h2 style="font-size:22px;font-weight:800;color:#111827;margin:0 0 8px;">New Verification Request</h2>
        <div style="background:white;border-radius:12px;padding:20px;border:1px solid #f3f4f6;margin:20px 0;">
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f9fafb;"><span style="color:#6b7280;font-size:14px;">Walker</span><span style="font-weight:600;font-size:14px;color:#111827;">${walkerName}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f9fafb;"><span style="color:#6b7280;font-size:14px;">Email</span><span style="font-weight:600;font-size:14px;color:#111827;">${walkerEmail}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;"><span style="color:#6b7280;font-size:14px;">Aadhaar</span><span style="font-weight:600;font-size:14px;color:#111827;font-family:monospace;">XXXX XXXX ${aadhaarNumber.slice(-4)}</span></div>
        </div>
        <a href="https://furrlet.in/admin" style="display:block;text-align:center;background:#f59e0b;color:white;font-weight:700;font-size:15px;padding:14px 24px;border-radius:12px;text-decoration:none;">Review in Admin Panel →</a>
      </div>
    `,
  })
}

export async function sendRefundEmail({ ownerEmail, ownerName, dogName, date, amount }: {
  ownerEmail: string
  ownerName: string
  dogName: string
  date: string
  amount: number
}) {
  await getResend().emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `Refund processed — ₹${amount.toFixed(0)} for ${dogName}'s walk`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fffbeb;border-radius:16px;">
        <div style="font-size:32px;margin-bottom:16px;">💰</div>
        <h2 style="font-size:22px;font-weight:800;color:#111827;margin:0 0 8px;">Refund Processed</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Your booking has been cancelled and a refund has been initiated.</p>
        <div style="background:white;border-radius:12px;padding:20px;border:1px solid #f3f4f6;margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f9fafb;"><span style="color:#6b7280;font-size:14px;">Dog</span><span style="font-weight:600;font-size:14px;color:#111827;">${dogName}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f9fafb;"><span style="color:#6b7280;font-size:14px;">Date</span><span style="font-weight:600;font-size:14px;color:#111827;">${date}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;"><span style="color:#6b7280;font-size:14px;">Refund Amount</span><span style="font-weight:800;font-size:16px;color:#16a34a;">₹${amount.toFixed(0)}</span></div>
        </div>
        <p style="color:#6b7280;font-size:13px;margin:0 0 24px;">Refunds typically appear in your account within 5–7 business days depending on your bank.</p>
        <a href="https://furrlet.in/walkers" style="display:block;text-align:center;background:#f59e0b;color:white;font-weight:700;font-size:15px;padding:14px 24px;border-radius:12px;text-decoration:none;">Find Another Walker →</a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;text-align:center;">Furrlet · Making every tail wag</p>
      </div>
    `,
  })
}
