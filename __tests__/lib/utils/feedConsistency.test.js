/**
 * Uses the real `feed` serialiser (not mocked) to check that the static
 * generator and the /api/rss fallback emit the same Atom identity.
 */
import fs from 'fs'
import { generateRss } from '@/lib/utils/rss'
import handler from '@/pages/api/rss'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'

jest.mock('@/components/NotionPage', () => ({
  __esModule: true,
  default: () => null
}))

// Keep the Notion client out of the test; `feed` itself stays real.
jest.mock('@/lib/db/notion/getPostBlocks', () => ({
  formatNotionBlock: jest.fn(block => block)
}))
jest.mock('@/lib/utils/notion.util', () => ({
  adapterNotionBlockMap: jest.fn(blockMap => blockMap)
}))

jest.mock('@/lib/db/SiteDataApi', () => ({
  getPostBlocks: jest.fn(async () => null),
  fetchGlobalAllData: jest.fn()
}))

const SITE = 'https://intelligence.stephendmann.com'
const post = {
  id: 'p1',
  title: 'Test post',
  slug: 'article/test-post',
  summary: 'Summary',
  publishDay: '2026-03-26',
  type: 'Post',
  status: 'Published'
}

const pick = (xml, re) => (xml.match(re) || [])[1]

async function staticAtom(link) {
  const written = {}
  jest.spyOn(fs, 'statSync').mockImplementation(() => {
    throw new Error('ENOENT')
  })
  jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {})
  jest.spyOn(fs, 'writeFileSync').mockImplementation((p, data) => {
    written[p] = data
  })
  await generateRss({
    NOTION_CONFIG: { SUB_PATH: '' },
    siteInfo: { title: 'LI', description: 'd', link },
    latestPosts: [{ ...post }]
  })
  return written['./public/rss/atom.xml']
}

async function apiAtom(link) {
  fetchGlobalAllData.mockResolvedValue({
    siteInfo: { title: 'LI', description: 'd', link },
    allPages: [{ ...post }],
    latestPosts: [{ ...post }],
    NOTION_CONFIG: { SUB_PATH: '' }
  })
  let body
  const res = {
    setHeader: jest.fn(),
    status: jest.fn(() => res),
    send: jest.fn(b => {
      body = b
      return res
    }),
    json: jest.fn(b => {
      body = b
      return res
    })
  }
  await handler({ method: 'GET', query: { format: 'atom' } }, res)
  return body
}

describe('feed identity is consistent across generators', () => {
  afterEach(() => jest.restoreAllMocks())

  // The API handler caches per module instance, so test one LINK form
  // (with trailing slash, the harder case) against both paths.
  it('static and API Atom output share a non-empty id and self link', async () => {
    const s = await staticAtom(`${SITE}/`)
    const a = await apiAtom(`${SITE}/`)

    for (const xml of [s, a]) {
      expect(typeof xml).toBe('string')
      expect(pick(xml, /<id>([^<]+)<\/id>/)).toBe(`${SITE}/`)
      expect(pick(xml, /<link rel="self" href="([^"]+)"/)).toBe(
        `${SITE}/rss/atom.xml`
      )
      expect(xml).toContain(`${SITE}/article/test-post`)
      expect(xml).not.toContain(`${SITE}//`)
    }
  })
})
