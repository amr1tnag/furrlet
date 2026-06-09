# Furrlet — Feature Documentation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | Neon PostgreSQL via Prisma ORM v6 |
| Auth | NextAuth v4 (credentials, JWT) |
| Payments | Razorpay (UPI, Cards, Netbanking) |
| Email | Resend |
| Image Upload | Cloudinary |
| Maps | Google Maps Embed API |
| Hosting | Vercel |
| Domain | furrlet.in (GoDaddy) |
| Styling | Tailwind CSS with custom animations |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | NextAuth JWT secret |
| `NEXTAUTH_URL` | App URL (https://furrlet.in) |
| `RESEND_API_KEY` | Resend email API key |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Google Maps Embed API key |
| `RAZORPAY_KEY_ID` | Razorpay key ID (rzp_test_... or rzp_live_...) |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |

---

## Features

### Authentication
- Sign up as **Dog Owner** or **Dog Walker**
- Sign in with email + password (bcrypt hashed)
- Role-based access control throughout the app
- Welcome email sent on signup
- Guards: walkers redirected away from owner pages and vice versa

### Walker Features
- Create/edit walker profile (bio, city, hourly rate in ₹, availability)
- Upload profile photo via Cloudinary
- Appear in public walker browse page
- Accept, decline, or mark bookings as completed
- Earnings dashboard:
  - Total earned (all time) + walk count
  - This month's earnings
  - Last month's earnings
  - Month-over-month growth %
  - Recent payments list with payer and amount
- Browse dogs page to find dogs that need walks

### Owner Features
- Add/remove dogs (name, breed, size, special notes)
- Browse and search walkers by name, city, or keyword
- Filter walkers by max hourly rate (₹ slider)
- Sort walkers by rating, price low→high, price high→low
- View walker profile: photo, bio, availability, reviews, Google Maps embed
- Book a walk (select dog, date, duration)
- Pay via Razorpay (UPI, cards, netbanking, wallets, Pay Later)
- Cancel pending or accepted bookings
- Leave star rating + written review after walk is completed

### Booking Flow
1. Owner finds walker → fills booking form → pays via Razorpay
2. Payment verified server-side (HMAC signature check) → booking created
3. Walker receives email notification of new request
4. Walker accepts or declines from bookings page
5. Owner receives email notification of acceptance or decline
6. Walker marks booking as completed after the walk
7. Owner can leave a review (1–5 stars + comment)

### Email Notifications
All emails sent via Resend from `notifications@furrlet.in`

| Trigger | Recipient |
|---------|-----------|
| Sign up | New user (welcome + role-specific CTA) |
| New booking created | Walker |
| Booking accepted | Owner |
| Booking declined | Owner (with link to find another walker) |

### UI / UX
- Fully responsive — mobile and desktop
- Shimmer skeleton loaders on all listing pages
- Animated cards with hover effects and transitions
- Role-based dashboard with stats (owners: dogs/pending/completed, walkers: pending/active/completed)
- Custom 404 page ("Lost on the trail?")
- Amber/orange design system with glassmorphism and mesh gradients

### SEO
- Meta title, description, keywords
- Open Graph image (dynamic, edge-rendered) for WhatsApp/Instagram/Twitter sharing
- `sitemap.xml` at `/sitemap.xml`
- `robots.txt` at `/robots.txt`

---

## Database Schema

```prisma
User          — id, email, password, name, role (OWNER | WALKER), createdAt
WalkerProfile — id, userId, bio, hourlyRate, city, availability, rating, reviewCount, photoUrl
Dog           — id, ownerId, name, breed, size (SMALL | MEDIUM | LARGE), notes
Booking       — id, walkerId, dogId, ownerId, status, date, duration, totalPrice, paymentId, paymentStatus, createdAt
Review        — id, bookingId, walkerId, ownerId, rating, comment, createdAt
```

### Booking Statuses
`PENDING` → `ACCEPTED` → `COMPLETED`  
`PENDING` → `DECLINED`  
`PENDING` or `ACCEPTED` → `CANCELLED` (by owner)

### Payment Statuses
`UNPAID` (default) | `PAID` (after Razorpay verification)

---

## Infrastructure Notes
- `prisma db push && prisma generate && next build` runs on every Vercel deploy
- All API routes use `export const dynamic = 'force-dynamic'` to prevent static caching on Vercel
- Cloudinary uses unsigned upload preset (`furrlet_uploads`) — upload happens client-side
- Razorpay payment signature verified server-side using HMAC SHA256 before booking is created
- Google Maps Embed API key should be restricted to `furrlet.in/*` in Google Cloud Console

---

## Roadmap

### Phase 3 — Monetisation
- [ ] Complete Razorpay KYC (required for live payouts to walkers)
- [ ] Refunds on cancelled bookings via Razorpay Refund API
- [ ] Platform commission (e.g. 10% per booking)
- [ ] Walker payout dashboard

### Phase 4 — Engagement
- [ ] In-app messaging between owner and walker
- [ ] Push notifications (mobile)
- [ ] Walker verified badge (after ID check)
- [ ] Repeat booking with one click

### Phase 5 — Trust & Legal
- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Admin dashboard (view users, bookings, flag issues)
- [ ] ID verification for walkers

---

## Contact
- **Phone:** +91 72087 84418
- **Instagram:** [@furrlet.in](https://instagram.com/furrlet.in)
- **Email:** furrlet.in@gmail.com
- **Website:** [furrlet.in](https://furrlet.in)
