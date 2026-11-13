import {
  DEFAULT_SITE_DESCRIPTION,
  resolveSiteDescription
} from '@/lib/site/siteDefaults'

describe('DEFAULT_SITE_DESCRIPTION', () => {
  it('is the current English site description', () => {
    expect(DEFAULT_SITE_DESCRIPTION).toBe(
      'Writing on AI, leadership and governance for business owners, chief executives and boards, by Stephen Mann.'
    )
  })

  it('contains no upstream NotionNext / CJK placeholder text', () => {
    expect(DEFAULT_SITE_DESCRIPTION).not.toMatch(/NotionNext/)
    expect(DEFAULT_SITE_DESCRIPTION).not.toMatch(/[㐀-鿿]/)
  })
})

describe('resolveSiteDescription', () => {
  it('prefers the Notion database description', () => {
    expect(
      resolveSiteDescription({
        collection: { description: [['From Notion DB']] },
        NOTION_CONFIG: { DESCRIPTION: 'From config' }
      })
    ).toBe('From Notion DB')
  })

  it('falls back to the Notion Config DESCRIPTION', () => {
    expect(
      resolveSiteDescription({
        collection: {},
        NOTION_CONFIG: { DESCRIPTION: 'From config' }
      })
    ).toBe('From config')
  })

  it.each([
    ['no arguments', undefined],
    ['empty object', {}],
    ['collection without description', { collection: {} }],
    ['empty description array', { collection: { description: [] } }],
    ['empty description text', { collection: { description: [['']] } }],
    ['whitespace description', { collection: { description: [['   ']] } }],
    ['empty config DESCRIPTION', { NOTION_CONFIG: { DESCRIPTION: '' } }]
  ])('uses the default when description is missing (%s)', (_label, input) => {
    expect(resolveSiteDescription(input)).toBe(DEFAULT_SITE_DESCRIPTION)
  })
})
