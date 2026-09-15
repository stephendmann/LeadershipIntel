# Upstream Divergence Notes

This file tracks every file intentionally modified from the upstream project
[notionnext-org/NotionNext](https://github.com/notionnext-org/NotionNext)
(formerly tangly1024/NotionNext).

**During upstream syncs, do not blindly overwrite these files.**
Review each conflict carefully — upstream changes to framework code are usually
safe to accept; changes that touch the values listed below must be kept.

---

## Protected files

| File | What was changed | What to protect |
|------|-----------------|-----------------|
| `blog.config.js` | Author, BIO, LINK, AVATAR, KEYWORDS, FAVICON, GREETING_WORDS, NOTION_PAGE_ID | All custom values — accept upstream structural changes only |
| `themes/next/style.js` | Full brand token set (`--brand-teal: #005577`, charcoal, bg, steel, border) plus all derived CSS rules for nav, tags, articles, sidebar | Entire file — keep ours |
| `themes/next/config.js` | NEXT_HOME_BANNER_STRINGS replaced with English copy; nav/sidebar/layout settings tuned | BANNER_STRINGS at minimum; review all other values on merge |
| `themes/next/index.js` | Full-width hero banner (desktop) with `blog-header.png` background + BIO tagline under the title | Entire hero `<div>` block — keep ours |
| `themes/next/components/Hero.js` | Fork-only masthead component (category-scoped experiment behind `NEXT_PUBLIC_AI_HERO_CATEGORY` env gate) | Entire file — not in upstream, keep ours |
| `themes/next/components/` | LeadershipIntel-specific component overrides (incl. `Footer.js` site-title tag fixed from stray `<h1>` to `<p>`, `ArticleCopyright.js` replaced with author bio card) | Inspect each changed component during merge |
| `middleware.ts` | Clerk v6 middleware (`clerkMiddleware`) | Entire file — keep ours |
| `pages/api/user.ts` | Returns 401 when Clerk is not configured | Keep ours |
| `next.config.js` | Explicit `images.domains` whitelist (upstream opened all http/https remotePatterns — do not adopt) | Keep our whitelist |
| `package.json` | Clerk v6 pin, `next` exact security pin, `form-data ^4.0.6` resolution | Keep these pins; accept other upstream dep bumps. Node engines follow upstream (`>=22 <25` since v4.10.x — the old 20.x cap is obsolete; Vercel runs 24.x). `@waline/client` was exact-pinned at 3.13.0 during the Node 20 era (older versions required Node ≥22); unpinned to `^3.15.0` 2026-07-12 now that Node ≥22 is standard — no longer a protected pin, accept upstream bumps within 3.x |
| `public/` | `blog-header.png`, favicon assets | Keep our assets; accept new upstream assets |
| `README.md` | Fully rewritten for LeadershipIntel product docs | Entire file — keep ours |
| `conf/analytics.config.js` | Analytics IDs (GA etc.) | Any ID values |
| `themes/theme.js` | `THEME_BASE_LAYOUTS` — an explicit `dynamic(() => import('@/themes/<name>'))` per bundled theme, replacing upstream's template-literal import in `getBaseLayoutByTheme`. See "Why themes/theme.js diverges" below | Keep our static map. Accept upstream changes to `resolveThemeLayout` / page-layout loading, which we still use unmodified |

---

## Upstream files intentionally removed (do not re-add on sync)

| File | Why removed |
|------|-------------|
| `.github/workflows/bump-version-on-main.yml` | Upstream's release automation — auto-bumps package.json and recreates a `chore/bump-package-version` branch on every push to main. The fork's version follows upstream via syncs; this is noise here. If a sync brings it back (modify/delete conflict), keep it deleted. |

---

## Files not in upstream (never overwrite)

| File | Purpose |
|------|---------|
| `.github/workflows/upstream-sync.yml` | This controlled sync workflow |
| `.github/workflows/lighthouse.yml` | Lighthouse CI via deployment_status |
| `.github/dependabot.yml` | Dependabot version updates |
| `.github/lighthouse-budget.json` | Lighthouse performance budgets |
| `UPSTREAM-NOTES.md` | This file |

---

## Merge workflow

1. Run **Upstream Sync** workflow (Actions → Upstream Sync → Run workflow)
2. A PR is opened against `main` with branch `sync/upstream-YYYY-MM-DD`
3. Review the diff — accept framework/bug-fix changes, keep LeadershipIntel values in the protected files above
4. Resolve any conflicts using the table above as a reference
5. Confirm Vercel preview deployment passes, then merge

---

_Last reviewed: 2026-07-11 (upstream sync v4.9.3.1 → v4.10.5)_

---

## Why `themes/theme.js` diverges

Upstream loads the base layout with a template-literal dynamic import:

```js
dynamic(() => resolveThemeLayout(normalizedTheme, 'LayoutBase', EmptyBaseLayout), { ssr: true })
// where resolveThemeLayout does: await import(`@/themes/${themeFolderName}`)
```

`next/dynamic` can only preload a module for server rendering when the import
is **literal**, so its module id can be recorded in the build's loadable
manifest. A template literal compiles to a webpack context module with no
single id, so nothing is preloaded. On a cold lambda the component renders
`null` before the promise settles — and because the base layout wraps `<SEO>`
and `<Component>` in `pages/_app.js`, the entire page head and body were
discarded.

In production (September 2026) that served HTTP 200 pages containing only the
Google Tag Manager tags, with no `<title>` and no content, to crawlers and
social previews. Build-time prerendered pages were unaffected; pages
regenerated at runtime were, intermittently, so it went unnoticed. Browsers
hydrated and looked normal.

Upstream's `84a360b` (2026-07-18) added `resolveThemeLayout` /
`EmptyBaseLayout`, which we ported in #81. That stops a *missing export* from
dropping the subtree, but it cannot fix the preload problem — the import is
still a template literal, and the tell is that no `[theme] … using empty
layout` warning ever fired in production while pages were blank. The resolver
was never reached; `dynamic` returned `null` first.

`THEME_BASE_LAYOUTS` declares one literal import per bundled theme so the
compiler can see them. Page-level layouts still go through upstream's
`resolveThemeLayout` unchanged — they pass a `loading` component, so an
unresolved import degrades to a skeleton rather than dropping the tree.

**On future syncs:**

- Keep our `THEME_BASE_LAYOUTS` and our `getBaseLayoutByTheme`. Do not restore
  upstream's template-literal version of that function.
- Accept upstream changes to `resolveThemeLayout`, `importThemeLayout`,
  `getThemeExport`, `getFallbackThemeName` and `useLayoutByTheme` — we use
  those as upstream wrote them.
- If upstream adopts a statically analysable loader of its own, drop ours and
  take theirs; this divergence exists only because upstream has none.
- Adding a theme folder means adding a map entry.
  `__tests__/themes/themeBaseLayouts.test.js` fails if the two drift.
