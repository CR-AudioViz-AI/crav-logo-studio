// app/sitemap.ts — the pages this app wants indexed
//
// 2026-08-16: this app had no sitemap, so discovery depended on a crawler
// finding an internal link. Generated rather than static, so it cannot drift
// out of date as pages are added.
import type { MetadataRoute } from 'next'

const BASE = 'https://javarilogo.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: `${BASE}`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/admin`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/billing`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/brand`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/projects`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/settings`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/sign-in`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/sign-up`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ]
}
