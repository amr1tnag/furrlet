import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/dashboard', '/bookings', '/profile/'] },
    sitemap: 'https://furrlet.in/sitemap.xml',
  }
}
