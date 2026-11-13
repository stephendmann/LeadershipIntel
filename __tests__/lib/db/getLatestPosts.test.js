// notion-utils / notion-client ship ESM only; getLatestPosts uses neither.
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

const { getLatestPosts } = require('@/lib/db/SiteDataApi')
const {
  ELIGIBLE,
  DISTRACTORS,
  EDIT_ORDER
} = require('@/test-fixtures/feedSelectionPosts')

const ids = posts => posts.map(p => p.id.replace('id-', ''))
// Mixed order input, as Notion would return it.
const ALL = [...DISTRACTORS, ...ELIGIBLE].reverse()

describe('getLatestPosts', () => {
  it('orders by last edit, not publication date, with the default limit of 6', () => {
    const posts = getLatestPosts({ allPages: ALL, latestPostCount: 6, schedulePublish: true })
    expect(ids(posts)).toEqual(EDIT_ORDER.slice(0, 6))
  })

  it('honours a non-default LATEST_POST_COUNT', () => {
    const posts = getLatestPosts({ allPages: ALL, latestPostCount: 3, schedulePublish: true })
    expect(ids(posts)).toEqual(EDIT_ORDER.slice(0, 3))
  })

  it('returns all eligible posts when fewer than the limit exist', () => {
    const four = ELIGIBLE.filter(p => ['1', '2', '3', '4'].includes(p.id.slice(3)))
    const posts = getLatestPosts({
      allPages: [...DISTRACTORS, ...four],
      latestPostCount: 6,
      schedulePublish: true
    })
    expect(ids(posts)).toEqual(['4', '2', '1', '3'])
  })

  it('excludes Pages, Invisible and Draft posts', () => {
    const got = ids(getLatestPosts({ allPages: ALL, latestPostCount: 100, schedulePublish: true }))
    for (const bad of ['page', 'invisible', 'draft']) expect(got).not.toContain(bad)
  })

  it('excludes future-scheduled and expired posts when scheduled publishing is on, and backfills', () => {
    const got = ids(getLatestPosts({ allPages: ALL, latestPostCount: 6, schedulePublish: true }))
    expect(got).not.toContain('future')
    expect(got).not.toContain('expired')
    expect(got).toHaveLength(6)
  })

  it('keeps scheduled posts when scheduled publishing is off (unchanged behaviour)', () => {
    const got = ids(getLatestPosts({ allPages: ALL, latestPostCount: 2, schedulePublish: false }))
    expect(got).toEqual(['expired', 'future'])
  })
})

describe('LATEST_POST_COUNT resolution (as passed to getLatestPosts)', () => {
  const { siteConfig } = require('@/lib/config')

  it('defaults to 6', () => {
    expect(Number(siteConfig('LATEST_POST_COUNT', 6, {}))).toBe(6)
  })

  it('uses a Notion Config override', () => {
    const n = siteConfig('LATEST_POST_COUNT', 6, { LATEST_POST_COUNT: 3 })
    expect(Number(n)).toBe(3)
    const posts = getLatestPosts({ allPages: ALL, latestPostCount: n, schedulePublish: true })
    expect(ids(posts)).toEqual(EDIT_ORDER.slice(0, 3))
  })
})
