/**
 * THEME_BASE_LAYOUTS is an allowlist, not an inventory.
 *
 * It previously mapped every folder under themes/. That was wrong: Next calls
 * Loadable.preloadAll() during server rendering, so every literal import
 * registered here is loaded on each cold render whether or not that theme is
 * used. themes/claude imports isomorphic-dompurify at module scope, whose jsdom
 * dependency reaches a CommonJS file requiring ESM-only @exodus/bytes, and the
 * Vercel lambda threw ERR_REQUIRE_ESM on every route -- while the site rendered
 * theme "next" and never used claude.
 *
 * These assert the source text rather than the module's runtime value: the map
 * holds next/dynamic components, and the property that matters is that the
 * imports are literal and statically analysable, which is a property of the
 * source. They cannot reproduce an SSR preload failure -- that needs a cold
 * serverless render -- but they do catch the regressions that are realistic
 * here: mapping a theme that does not exist, dropping the configured theme, or
 * re-introducing a server-side jsdom dependency.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', '..')
const THEMES_DIR = path.join(ROOT, 'themes')
const THEME_SOURCE = fs.readFileSync(path.join(THEMES_DIR, 'theme.js'), 'utf8')

const themeFolders = fs
  .readdirSync(THEMES_DIR, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)

function mapBlock() {
  return THEME_SOURCE.match(/const THEME_BASE_LAYOUTS = \{([\s\S]*?)\n\}/)
}

function mappedThemes() {
  const block = mapBlock()
  if (!block) return []
  return [...block[1].matchAll(/import\('@\/themes\/([^']+)'\)/g)].map(m => m[1])
}

/** Every source file under a theme folder, recursively. */
function themeSources(theme) {
  const out = []
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) out.push(full)
    }
  }
  walk(path.join(THEMES_DIR, theme))
  return out
}

describe('THEME_BASE_LAYOUTS', () => {
  it('maps only themes that exist on disk', () => {
    const missing = mappedThemes().filter(t => !themeFolders.includes(t))
    expect(missing).toEqual([])
  })

  it('covers the default theme configured in blog.config.js', () => {
    // Read the fallback from source, not BLOG.THEME: jest.env.js sets
    // NEXT_PUBLIC_THEME='test', so the runtime value is a fixture.
    const blogConfig = fs.readFileSync(path.join(ROOT, 'blog.config.js'), 'utf8')
    const defaultTheme = blogConfig.match(
      /THEME:\s*process\.env\.NEXT_PUBLIC_THEME\s*\|\|\s*'([^']+)'/
    )
    expect(defaultTheme).not.toBeNull()
    expect(mappedThemes()).toContain(defaultTheme[1])
  })

  it('uses literal imports so next/dynamic can preload them for SSR', () => {
    const block = mapBlock()
    expect(block).not.toBeNull()
    // A template literal here is the bug this map exists to prevent.
    expect(block[1]).not.toMatch(/import\(`/)
    expect(mappedThemes().length).toBeGreaterThan(0)
  })

  it('stays an allowlist rather than every bundled theme', () => {
    // Not a style preference: preloadAll() loads each mapped theme on every
    // cold server render, so the map is a server-side cost and a server-side
    // risk surface. Adding a theme here is a deliberate act.
    expect(mappedThemes().length).toBeLessThan(themeFolders.length)
  })

  it('maps no theme that pulls jsdom into the server bundle', () => {
    // isomorphic-dompurify loads jsdom, which reaches html-encoding-sniffer:
    // CommonJS requiring ESM-only @exodus/bytes. That is the ERR_REQUIRE_ESM
    // that returned HTTP 500 from every cold render.
    const offenders = []
    for (const theme of mappedThemes()) {
      for (const file of themeSources(theme)) {
        const src = fs.readFileSync(file, 'utf8')
        if (/from '(isomorphic-dompurify|jsdom)'|require\('(isomorphic-dompurify|jsdom)'\)/.test(src)) {
          offenders.push(path.relative(ROOT, file))
        }
      }
    }
    expect(offenders).toEqual([])
  })
})
