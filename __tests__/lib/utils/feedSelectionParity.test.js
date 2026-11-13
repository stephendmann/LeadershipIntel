/**
 * The static generator (lib/utils/rss.js) and the /api/rss fallback must
 * emit the same items in the same order, in RSS, Atom and JSON, using the
 * real `feed` serialiser.
 */
import fs from 'fs'

// ESM-only Notion packages are stubbed; nothing here talks to Notion.
jest.mock('notion-utils', () =>
  new Proxy({ __esModule: true }, {
    get: (target, key) => (key in target ? target[key] : jest.fn(x => x))
  })
)
jest.mock('notion-client', () => ({ NotionAPI: jest.fn() }))
jest.mock('@/lib/db/notion/getNotionAPI', () => ({ __esModule: true, default: {} }))
jest.mock('@/lib/db/notion/getPostBlocks', () => ({
  fetchNotionPageBlocks: jest.fn(),
  formatNotionBlock: jest.fn(b => b)
}))
jest.mock('@/lib/db/notion/getNotionPost', () => ({ fetchPageFromNotion: jest.fn() }))
jest.mock('@/lib/db/notion/memberDataSource', () => ({
  fetchMembersFromOfficialAPI: jest.fn(async () => [])
}))
jest.mock('@/lib/utils/notion.util', () => ({
  adapterNotionBlockMap: jest.fn(b => b)
}))
jest.mock('@/components/NotionPage', () => ({ __esModule: true, default: () => null }))
// Real getLatestPosts; only the network-facing calls are replaced.
jest.mock('@/lib/db/SiteDataApi', () => ({
  ...jest.requireActual('@/lib/db/SiteDataApi'),
  fetchGlobalAllData: jest.fn(),
  getPostBlocks: jest.fn(async () => null)
}))

const {
  ELIGIBLE,
  DISTRACTORS,
  EDIT_ORDER,
  PUBLISH_ORDER,
  urlFor
} = require('@/test-fixtures/feedSelectionPosts')

const SITE = 'https://intelligence.stephendmann.com'
const siteInfo = { title: 'LI', description: 'd', link: SITE }

const rssUrls = xml => [...xml.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g)].map(m => m[1])
const atomUrls = xml => [...xml.matchAll(/<entry>[\s\S]*?<link href="([^"]+)"/g)].map(m => m[1])
const jsonUrls = json => JSON.parse(json).items.map(i => i.url)

/** Build both feeds in a fresh module registry (the API caches in memory). */
async function buildBoth(allPages, latestPostCount) {
  let out
  await jest.isolateModulesAsync(async () => {
    const SiteDataApi = require('@/lib/db/SiteDataApi')
    const { generateRss } = require('@/lib/utils/rss')
    const handler = require('@/pages/api/rss').default

    // What fetchGlobalAllData returns: allPages plus the shared selection.
    const latestPosts = SiteDataApi.getLatestPosts({
      allPages,
      latestPostCount,
      schedulePublish: true
    })
    SiteDataApi.fetchGlobalAllData.mockResolvedValue({
      siteInfo,
      NOTION_CONFIG: {},
      allPages,
      latestPosts
    })

    const written = {}
    jest.spyOn(fs, 'statSync').mockImplementation(() => {
      throw new Error('ENOENT')
    })
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {})
    jest.spyOn(fs, 'writeFileSync').mockImplementation((p, d) => {
      written[p] = d
    })
    await generateRss({
      NOTION_CONFIG: {},
      siteInfo,
      latestPosts: latestPosts.map(p => ({ ...p }))
    })

    const api = {}
    for (const [format, key] of [['rss', 'rss'], ['atom', 'atom'], ['json', 'json']]) {
      let body
      const res = {
        setHeader: jest.fn(),
        status: jest.fn(() => res),
        send: jest.fn(b => { body = b; return res }),
        json: jest.fn(b => { body = b; return res })
      }
      await handler({ method: 'GET', query: { format } }, res)
      api[key] = body
    }

    out = {
      static: {
        rss: rssUrls(written['./public/rss/feed.xml']),
        atom: atomUrls(written['./public/rss/atom.xml']),
        json: jsonUrls(written['./public/rss/feed.json'])
      },
      api: {
        rss: rssUrls(api.rss),
        atom: atomUrls(api.atom),
        json: jsonUrls(api.json)
      }
    }
  })
  return out
}

const expectAllEqual = (got, expected) => {
  for (const gen of ['static', 'api']) {
    for (const fmt of ['rss', 'atom', 'json']) {
      expect({ gen, fmt, urls: got[gen][fmt] }).toEqual({ gen, fmt, urls: expected })
    }
  }
}

// Notion-like mixed order, distractors included.
const ALL = [...DISTRACTORS, ...ELIGIBLE].reverse()

describe('static and API feeds select the same items', () => {
  afterEach(() => jest.restoreAllMocks())

  it('default LATEST_POST_COUNT (6) of 8 eligible: same URLs, edit order, all formats', async () => {
    const got = await buildBoth(ALL, 6)
    const expected = EDIT_ORDER.slice(0, 6).map(n => urlFor(SITE, n))
    expectAllEqual(got, expected)
    // Guard: this is not the old API's publication-date order.
    expect(expected).not.toEqual(PUBLISH_ORDER.slice(0, 6).map(n => urlFor(SITE, n)))
  })

  it('non-default LATEST_POST_COUNT (3)', async () => {
    const got = await buildBoth(ALL, 3)
    expectAllEqual(got, EDIT_ORDER.slice(0, 3).map(n => urlFor(SITE, n)))
  })

  it('fewer eligible posts (4) than the limit (6)', async () => {
    const four = ELIGIBLE.filter(p => ['1', '2', '3', '4'].includes(p.id.slice(3)))
    const got = await buildBoth([...DISTRACTORS, ...four], 6)
    expectAllEqual(got, ['4', '2', '1', '3'].map(n => urlFor(SITE, n)))
  })

  it('never includes Pages, hidden, draft, future-scheduled or expired posts', async () => {
    const got = await buildBoth(ALL, 100)
    for (const gen of ['static', 'api']) {
      for (const fmt of ['rss', 'atom', 'json']) {
        for (const bad of ['page', 'invisible', 'draft', 'future', 'expired']) {
          expect(got[gen][fmt]).not.toContain(urlFor(SITE, bad))
        }
        expect(got[gen][fmt]).toHaveLength(8)
      }
    }
  })
})
