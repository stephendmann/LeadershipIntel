/**
 * getSiteInfo is also what EmptyData() uses when the Notion fetch fails
 * (getSiteInfo({})), so these cover the empty-site-data path.
 */
// notion-utils / notion-client ship ESM only; getSiteInfo uses neither.
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

const { getSiteInfo } = require('@/lib/db/SiteDataApi')
const { DEFAULT_SITE_DESCRIPTION } = require('@/lib/site/siteDefaults')

describe('getSiteInfo description', () => {
  it('empty-site-data path (no collection, no block) uses the English default', () => {
    const info = getSiteInfo({})
    expect(info.description).toBe(DEFAULT_SITE_DESCRIPTION)
    expect(info.description).not.toMatch(/NotionNext|[㐀-鿿]/)
  })

  it('empty-site-data path still honours Notion Config DESCRIPTION', () => {
    expect(getSiteInfo({ NOTION_CONFIG: { DESCRIPTION: 'Cfg' } }).description).toBe('Cfg')
  })

  it('uses the Notion database description when present', () => {
    const info = getSiteInfo({
      collection: { name: [['LI']], description: [['DB description']] },
      block: {}
    })
    expect(info.description).toBe('DB description')
  })

  it('falls back to the default when the database description is missing', () => {
    const info = getSiteInfo({ collection: { name: [['LI']] }, block: {} })
    expect(info.description).toBe(DEFAULT_SITE_DESCRIPTION)
  })

  it('falls back to the default when the database description is empty', () => {
    const info = getSiteInfo({
      collection: { name: [['LI']], description: [['']] },
      block: {}
    })
    expect(info.description).toBe(DEFAULT_SITE_DESCRIPTION)
  })
})
