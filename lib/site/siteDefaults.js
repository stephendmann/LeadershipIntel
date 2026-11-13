/**
 * Site-level fallback metadata.
 *
 * Used only when Notion provides nothing: the database has no description,
 * the Notion Config page has no DESCRIPTION, or the Notion fetch failed and
 * the empty-site-data path is in use. Keep this aligned with the Notion
 * database description, which remains the authoritative source.
 */
export const DEFAULT_SITE_DESCRIPTION =
  'Writing on AI, leadership and governance for business owners, chief executives and boards, by Stephen Mann.'

const firstNonEmpty = (...values) =>
  values.find(v => typeof v === 'string' && v.trim() !== '')?.trim()

/**
 * Resolve the site description: Notion database description, then the
 * Notion Config page DESCRIPTION, then DEFAULT_SITE_DESCRIPTION.
 */
export function resolveSiteDescription({ collection, NOTION_CONFIG } = {}) {
  const fromCollection = collection?.description?.[0]?.[0]
  return (
    firstNonEmpty(fromCollection, NOTION_CONFIG?.DESCRIPTION) ||
    DEFAULT_SITE_DESCRIPTION
  )
}
