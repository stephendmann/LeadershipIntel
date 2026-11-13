import { buildFeedMeta, isRssEnabled } from '@/lib/utils/feedUrls'

describe('buildFeedMeta', () => {
  const SITE = 'https://intelligence.stephendmann.com'

  it.each([SITE, `${SITE}/`, `${SITE}//`, ` ${SITE}/ `])(
    'normalises %p to one canonical identity',
    link => {
      expect(buildFeedMeta(link)).toEqual({
        base: SITE,
        id: `${SITE}/`,
        link: `${SITE}/`,
        feedLinks: {
          rss: `${SITE}/rss/feed.xml`,
          atom: `${SITE}/rss/atom.xml`,
          json: `${SITE}/rss/feed.json`
        }
      })
    }
  )

  it.each(['blog', '/blog', '/blog/'])(
    'includes SUB_PATH %p in the id but keeps feed URLs at the root',
    subPath => {
      const meta = buildFeedMeta(`${SITE}/`, subPath)
      expect(meta.id).toBe(`${SITE}/blog`)
      expect(meta.link).toBe(`${SITE}/blog`)
      expect(meta.feedLinks.atom).toBe(`${SITE}/rss/atom.xml`)
    }
  )

  it('never produces double slashes', () => {
    const meta = buildFeedMeta(`${SITE}///`, '//blog//')
    for (const url of [meta.id, ...Object.values(meta.feedLinks)]) {
      expect(url.replace('https://', '')).not.toMatch(/\/\//)
    }
  })
})

describe('isRssEnabled', () => {
  it.each([
    [true, true],
    ['true', true],
    [' TRUE ', true],
    [false, false],
    ['false', false],
    [undefined, false],
    [null, false],
    ['', false]
  ])('%p -> %p', (input, expected) => {
    expect(isRssEnabled(input)).toBe(expected)
  })
})
