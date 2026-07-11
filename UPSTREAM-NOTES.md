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
| `package.json` | Clerk v6 pin, `next` exact security pin, `@waline/client` exact 3.13.0, `form-data ^4.0.6` resolution | Keep these pins; accept other upstream dep bumps. Node engines follow upstream (`>=22 <25` since v4.10.x — the old 20.x cap is obsolete; Vercel runs 24.x) |
| `public/` | `blog-header.png`, favicon assets | Keep our assets; accept new upstream assets |
| `README.md` | Fully rewritten for LeadershipIntel product docs | Entire file — keep ours |
| `conf/analytics.config.js` | Analytics IDs (GA etc.) | Any ID values |

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
