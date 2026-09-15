# LeadershipIntel — Maintenance Guide

Operational reference for `intelligence.stephendmann.com`.  
Keep this up to date as the setup evolves.

---

## How publishing works

```
Notion database (LeadershipIntelligence)
  → set Status = Published
    → Vercel re-fetches content automatically (~5 min cache)
      → live at intelligence.stephendmann.com
```

**No code deployment needed to publish content.** Only push code when changing site behaviour, config, or dependencies.

---

## Deploy flow

| Trigger | What happens |
|---------|-------------|
| Push to `main` | Vercel auto-deploys to production |
| Open a PR | Vercel creates a preview deployment — URL posted as a PR check |
| Merge a PR | Preview is promoted; production deploy triggered |
| Notion content change | Vercel re-renders on next request (ISR, ~5 min TTL) |

**Required checks before merge:**
- ✅ CI (Lint & Type Check)
- ✅ Vercel Preview Deployment (must be Ready)
- ✅ Lighthouse CI (runs against the Vercel preview URL)
- ✅ CodeQL

---

## Environment variables

All set in Vercel project settings (not committed to the repo).

| Variable | Purpose | Where to update |
|----------|---------|-----------------|
| `NOTION_PAGE_ID` | Root Notion database ID | Vercel → Settings → Environment Variables |
| `NEXT_PUBLIC_THEME` | Active theme (default: `next`) | Vercel or `blog.config.js` fallback |
| `NEXT_PUBLIC_AUTHOR` | Author name | Vercel or `blog.config.js` fallback |
| `NEXT_PUBLIC_LINK` | Canonical site URL | Vercel or `blog.config.js` fallback |
| `NEXT_PUBLIC_AVATAR` | Author avatar URL (R2 CDN) | Vercel or `blog.config.js` fallback |
| `NEXT_PUBLIC_FAVICON` | Favicon URL (R2 CDN) | Vercel or `blog.config.js` fallback |

See `.env.example` for the full list. Never commit real values — use Vercel's environment variable UI.

---

## Upstream sync process

The upstream project is [notionnext-org/NotionNext](https://github.com/notionnext-org/NotionNext)
(formerly tangly1024/NotionNext).  
**Never merge upstream directly into `main`.** Always use a reviewed PR.

**Follow-up from the 2026-07-11 sync (v4.9.3.1 → v4.10.5):** CodeQL flagged 25 open alerts
inherited from upstream code. The 6 affecting active `lib/` code paths (URL-substring
sanitization in `mapImage.js`, incomplete sanitization + bad regex in `validation.js`,
DOM-text-as-href in `lib/utils/index.js`, clear-text password storage in `password.js`)
plus the matching alert in `pages/[prefix]/index.js` are fixed in PR #40
(`fix/codeql-lib-hardening`). Remaining alerts are in unused themes (simple, photo, movie,
medium, magzine), one-off `scripts/*.mjs` docs tooling, and `themes/claude` — lower
priority since they're not on the live render path; consider contributing the mapImage.js
fix upstream since the bug likely exists there too.

**Step-by-step:**

1. Back up the site-specific files first: `blog.config.js`,
   `themes/next/config.js`, `conf/ad.config.js`, `pages/_document.js`.
2. Fetch upstream and create a sync branch off the latest `main`:
   ```bash
   git remote add upstream https://github.com/notionnext-org/NotionNext.git   # once
   git fetch upstream main
   git checkout main && git pull
   git checkout -b sync/upstream-$(date +%Y-%m-%d)
   git merge upstream/main          # expect conflicts; do not use --no-commit
   ```
3. Resolve conflicts with `UPSTREAM-NOTES.md` open — it lists every protected
   file and every deliberate divergence, with what to keep and what to accept.
4. Run `yarn install --frozen-lockfile`, `yarn lint`, `yarn type-check`, `yarn test:ci`.
5. Push the branch and open a PR against `main`. **Never merge upstream directly
   into `main`.**
6. Confirm the Vercel preview renders real content, then merge.

There is no sync workflow. The previous `upstream-sync.yml` was removed on
2026-09-15: its YAML was invalid, so it never ran once in 133 attempts, and it
also lacked a `git commit` step — even repaired it would have pushed an empty
branch. See the PR that removed it for the full evidence.

**Frequency:** run when you want upstream fixes, or if upstream has a security patch. No need to stay in sync weekly — monthly or quarterly is fine for a stable site.

---

## Rollback steps

### Quick rollback (Vercel UI)
1. Vercel dashboard → LeadershipIntel project → Deployments
2. Find the last good deployment → click ⋯ → **Promote to Production**
3. Done — takes ~30 seconds

### Git rollback (if you need to fix code)
```bash
git revert <bad-commit-sha>
git push origin main
```
Vercel deploys the reverted commit automatically.

### Emergency: revert a bad Notion page
If a published Notion page breaks the site, set its **Status** back to `Draft` in Notion. The page stops rendering within ~5 minutes (ISR cache expiry).

---

## Adding a required status check (GitHub UI)

GitHub only shows a check as available once it has run at least once on the branch.

1. Open a PR → let CI/Lighthouse/CodeQL run
2. Settings → Branches → Edit `main` protection rule
3. Under "Require status checks to pass before merging" → search for the check name
4. Add: **Lint & Type Check**, **Lighthouse CI**, **CodeQL**, **Vercel**
5. Save

> **⚠️ Do not enable "Lint & Type Check" as a required check yet.** The job
> currently fails on ~38 pre-existing `@typescript-eslint` errors
> (`no-explicit-any`, `no-unsafe-assignment`, `no-floating-promises`, etc.)
> across the codebase — accumulated debt that was hidden until PR #17 fixed
> the broken install step. Making it required now would block every future
> merge. Clear the lint debt in a dedicated PR first (run `yarn lint` locally
> for the full list; prefer real type annotations over suppress comments),
> then enable the check.

---

## Monthly maintenance checklist

- [ ] Review open Dependabot PRs — merge critical/high security updates first
- [ ] Check GitHub Security tab for new alerts (Settings → Security)
- [ ] Verify Lighthouse CI is still passing on recent PRs
- [ ] Check Vercel dashboard for any build errors or unusual deploy times
- [ ] Decide whether to run an upstream sync (Actions → Upstream Sync → Run workflow)
- [ ] Remove any stale boilerplate or unused overrides from upstream if spotted
- [ ] Update `UPSTREAM-NOTES.md` if you've made new intentional divergences

---

## GitHub Actions overview

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | PR / push to main | Lint, type-check and the Jest suite (no secrets needed) |
| `lighthouse.yml` | Vercel deployment_status | Lighthouse audit against live preview/prod URL |
| `codeql-analysis.yml` | PR / push / weekly | Security vulnerability scanning |
| `content-check.yml` | Hourly + manual | Fetches the public site and fails if a page renders empty (the Aug-Sep 2026 failure mode). Alerts on 2+ consecutive failures. |

---

## Incident history

| Date | Incident | Record |
|------|----------|--------|
| 2026-08-04 → 2026-09-15 | Blank pages served as HTTP 200 (GTM-only shells) for ~6 weeks; no alert fired | [`docs/incidents/2026-09-blank-pages.md`](docs/incidents/2026-09-blank-pages.md) |

---

## Useful links

| Resource | URL |
|----------|-----|
| Live site | https://intelligence.stephendmann.com |
| Vercel project | https://vercel.com/steve-manns-projects/leadership-intel-2026 |
| GitHub repo | https://github.com/stephendmann/LeadershipIntel |
| Upstream repo | https://github.com/tangly1024/NotionNext |
| Notion database | Open Notion → LeadershipIntelligence database |
| Cloudflare R2 (images) | Cloudflare dashboard → R2 → your bucket |
