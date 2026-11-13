import { renderToStaticMarkup } from 'react-dom/server'

let mockConfig = {}

jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>
}))
jest.mock('next/router', () => ({
  useRouter: () => ({ route: '/', query: {}, locale: 'en-US' })
}))
jest.mock('@/lib/global', () => ({
  useGlobal: () => ({ locale: { NAV: {}, COMMON: {} } })
}))
jest.mock('@/lib/config', () => ({
  siteConfig: (key, fallback) =>
    key in mockConfig ? mockConfig[key] : fallback
}))

// Import after mocks
const SEO = require('@/components/SEO').default

const SITE = 'https://intelligence.stephendmann.com'

function render(enableRss) {
  mockConfig = {
    LINK: `${SITE}/`,
    TITLE: 'Leadership Intelligence',
    ENABLE_RSS: enableRss
  }
  return renderToStaticMarkup(
    <SEO siteInfo={{ link: `${SITE}/`, description: 'd' }} />
  )
}

describe('SEO feed autodiscovery', () => {
  it.each([true, 'true'])('emits RSS and Atom links when ENABLE_RSS=%p', v => {
    const html = render(v)
    expect(html).toContain(
      `<link rel="alternate" type="application/rss+xml" title="Leadership Intelligence" href="${SITE}/rss/feed.xml"/>`
    )
    expect(html).toContain(
      `<link rel="alternate" type="application/atom+xml" title="Leadership Intelligence" href="${SITE}/rss/atom.xml"/>`
    )
  })

  it.each([false, 'false', undefined])('omits them when ENABLE_RSS=%p', v => {
    const html = render(v)
    expect(html).not.toContain('application/rss+xml')
    expect(html).not.toContain('application/atom+xml')
  })
})
