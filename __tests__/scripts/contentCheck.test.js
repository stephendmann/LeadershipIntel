/**
 * The content check is a detector; the worst outcome is that it stops
 * detecting without anyone noticing. These cover the parsing rules — the part
 * that could silently break if the markup or the marker strings change.
 *
 * Network behaviour is verified separately by running the script against the
 * live site and against a local fixture server; that is not reproduced here.
 */
const {
  renderedRegion,
  titleOf,
  countChrome,
  classify,
  parsePages
} = require('@/scripts/content-check')

const THRESHOLDS = { minRenderedChars: 3000, minChromeElements: 2 }

/** The incident signature: HTTP 200, populated __NEXT_DATA__, nothing rendered. */
const gtmOnly = `<!DOCTYPE html><html><head><meta charSet="utf-8"/></head><body><div id="__next"><script async="" src="https://www.googletagmanager.com/gtag/js?id=G-X"></script><script async="">gtag('js', new Date());</script></div><script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"posts":[${'"padding",'.repeat(2000)}"end"]}}}</script></body></html>`

const healthy = `<!DOCTYPE html><html><head><title>Leadership Intelligence</title></head><body><div id="__next"><header>h</header><main>${'content '.repeat(600)}</main><nav>n</nav><footer>f</footer></div><script id="__NEXT_DATA__" type="application/json">{}</script></body></html>`

describe('renderedRegion', () => {
  it('measures only markup between the app root and __NEXT_DATA__', () => {
    // The whole document is large because of the props blob; the rendered
    // region is not. Measuring the document would hide the failure.
    expect(gtmOnly.length).toBeGreaterThan(10000)
    expect(renderedRegion(gtmOnly).length).toBeLessThan(500)
  })

  it('returns empty when the app root is absent', () => {
    expect(renderedRegion('<html><body>nope</body></html>')).toBe('')
  })

  it('falls back to the rest of the document when __NEXT_DATA__ is absent', () => {
    const html = '<div id="__next"><main>hello</main></div>'
    expect(renderedRegion(html)).toContain('<main>hello</main>')
  })

  it('tolerates a non-string body', () => {
    expect(renderedRegion(undefined)).toBe('')
  })
})

describe('titleOf', () => {
  it('extracts and trims a title', () => {
    expect(titleOf('<title>  Leadership Intelligence </title>')).toBe('Leadership Intelligence')
  })

  it('returns empty for a missing title', () => {
    expect(titleOf('<html><head></head></html>')).toBe('')
  })

  it('returns empty for a present but blank title', () => {
    expect(titleOf('<title>   </title>')).toBe('')
  })
})

describe('countChrome', () => {
  it('counts structural elements', () => {
    expect(countChrome('<header></header><main></main><nav></nav><footer></footer>')).toBe(4)
  })

  it('counts none in a GTM-only shell', () => {
    expect(countChrome(renderedRegion(gtmOnly))).toBe(0)
  })

  it('does not match substrings of other tag names', () => {
    expect(countChrome('<navigator><mainframe>')).toBe(0)
  })
})

describe('classify', () => {
  it('flags the GTM-only shell as EMPTY_RENDER with every reason', () => {
    const result = classify({ status: 200, body: gtmOnly }, THRESHOLDS)
    expect(result.ok).toBe(false)
    expect(result.class).toBe('EMPTY_RENDER')
    expect(result.detail).toMatch(/missing or empty <title>/)
    expect(result.detail).toMatch(/rendered \d+ chars < 3000/)
    expect(result.detail).toMatch(/0 layout elements < 2/)
  })

  it('passes a healthy page', () => {
    const result = classify({ status: 200, body: healthy }, THRESHOLDS)
    expect(result.ok).toBe(true)
    expect(result.class).toBe('OK')
    expect(result.title).toBe('Leadership Intelligence')
  })

  it('treats a non-200 as UNREACHABLE, not EMPTY_RENDER', () => {
    const result = classify({ status: 503, body: '' }, THRESHOLDS)
    expect(result.class).toBe('UNREACHABLE')
    expect(result.detail).toBe('HTTP 503')
  })

  it('flags a page that renders but lost its title', () => {
    const noTitle = healthy.replace(/<title>[\s\S]*?<\/title>/, '')
    const result = classify({ status: 200, body: noTitle }, THRESHOLDS)
    expect(result.ok).toBe(false)
    expect(result.detail).toMatch(/missing or empty <title>/)
  })

  it('accepts a lean but legitimate render above the floor', () => {
    // 9,420 rendered chars was the smallest healthy render observed on
    // production (a cold MISS); the threshold must not flag it.
    const lean = `<html><head><title>T</title></head><body><div id="__next"><main>${'x'.repeat(9420)}</main><nav></nav></div><script id="__NEXT_DATA__">{}</script></body></html>`
    expect(classify({ status: 200, body: lean }, THRESHOLDS).ok).toBe(true)
  })
})

describe('parsePages', () => {
  it('splits on newlines and commas and drops blanks', () => {
    expect(parsePages('/en\n\n/archive , /tag/Strategy\n')).toEqual([
      '/en',
      '/archive',
      '/tag/Strategy'
    ])
  })

  it('returns an empty list for empty input', () => {
    expect(parsePages(undefined)).toEqual([])
  })
})
