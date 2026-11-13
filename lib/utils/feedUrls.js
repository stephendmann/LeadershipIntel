import { normalizeSiteUrl } from '@/lib/sitemap-utils'

/**
 * Canonical feed identity and URLs, shared by the static RSS generator,
 * the /api/rss fallback and the <head> autodiscovery links so that the
 * feed's identity does not depend on which path serves it.
 *
 * - `id` / `link`: site home, including SUB_PATH when one is configured.
 * - `feedLinks`: always at the site root (/rss/*), matching the public
 *   endpoints and rewrites in next.config.js.
 */
export function buildFeedMeta(link, subPath = '') {
  const base = normalizeSiteUrl(link)
  const sub = String(subPath || '').replace(/^\/+|\/+$/g, '')
  const home = sub ? `${base}/${sub}` : `${base}/`
  return {
    base,
    id: home,
    link: home,
    feedLinks: {
      rss: `${base}/rss/feed.xml`,
      atom: `${base}/rss/atom.xml`,
      json: `${base}/rss/feed.json`
    }
  }
}

/** ENABLE_RSS may arrive as a boolean or as an env/Notion string. */
export function isRssEnabled(value) {
  return String(value).trim().toLowerCase() === 'true'
}
