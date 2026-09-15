/**
 * The base-layout loaders in themes/theme.js must stay in sync with the themes/
 * directory, because next.config.js scans that same folder for
 * publicRuntimeConfig.THEMES. A theme present in THEMES but missing from the
 * map falls back at runtime instead of loading its own layout.
 *
 * This asserts the source text rather than the module's runtime value: the map
 * holds next/dynamic components, and the whole point of the change is that the
 * imports are literal and statically analysable, which is a property of the
 * source. It cannot reproduce the SSR preload failure itself -- that needs a
 * cold serverless render -- but it does catch the realistic regression of
 * adding a theme folder and forgetting the loader.
 */
const fs = require('fs')
const path = require('path')

const THEMES_DIR = path.join(__dirname, '..', '..', 'themes')
const THEME_SOURCE = fs.readFileSync(path.join(THEMES_DIR, 'theme.js'), 'utf8')

const themeFolders = fs
  .readdirSync(THEMES_DIR, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)

function mappedThemes() {
  const block = THEME_SOURCE.match(
    /const THEME_BASE_LAYOUTS = \{([\s\S]*?)\n\}/
  )
  if (!block) return []
  return [...block[1].matchAll(/import\('@\/themes\/([^']+)'\)/g)].map(m => m[1])
}

describe('THEME_BASE_LAYOUTS', () => {
  it('declares a loader for every bundled theme', () => {
    expect(mappedThemes().sort()).toEqual(themeFolders.sort())
  })

  it('covers the default theme configured in blog.config.js', () => {
    // Read the fallback from source, not BLOG.THEME: jest.env.js sets
    // NEXT_PUBLIC_THEME='test', so the runtime value is a fixture.
    const blogConfig = fs.readFileSync(
      path.join(__dirname, '..', '..', 'blog.config.js'),
      'utf8'
    )
    const defaultTheme = blogConfig.match(
      /THEME:\s*process\.env\.NEXT_PUBLIC_THEME\s*\|\|\s*'([^']+)'/
    )
    expect(defaultTheme).not.toBeNull()
    expect(mappedThemes()).toContain(defaultTheme[1])
  })

  it('uses literal imports so next/dynamic can preload them for SSR', () => {
    const block = THEME_SOURCE.match(
      /const THEME_BASE_LAYOUTS = \{([\s\S]*?)\n\}/
    )
    expect(block).not.toBeNull()
    // A template literal here is the bug this map exists to prevent.
    expect(block[1]).not.toMatch(/import\(`/)
    expect(mappedThemes().length).toBeGreaterThan(0)
  })
})
