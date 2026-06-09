import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://furrlet.in', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://furrlet.in/walkers', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://furrlet.in/auth/signup', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://furrlet.in/auth/signin', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
