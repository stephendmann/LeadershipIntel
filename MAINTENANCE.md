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

The upstream project is [tangly1024/NotionNext](https://github.com/tangly1024/NotionNext).  
**Never merge upstream directly into `main`.** Always use a reviewed PR.

**Step-by-step:**

1. Go to **Actions → Upstream Sync (PR-based) → Run workflow**
2. A branch `sync/upstream-YYYY-MM-DD` is created and a PR opened automatically
3. Review the diff carefully using `UPSTREAM-NOTES.md` as a reference:
   - Accept framework/bug-fix changes
   - Keep LeadershipIntel values in all protected files
4. Resolve any merge conflicts
5. Check the Vercel preview looks correct
6. Merge the PR

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
| `ci.yml` | PR / push to main | Lint + type-check (fast, no secrets needed) |
| `lighthouse.yml` | Vercel deployment_status | Lighthouse audit against live preview/prod URL |
| `codeql-analysis.yml` | PR / push / weekly | Security vulnerability scanning |
| `upstream-sync.yml` | Manual (workflow_dispatch) | Creates a sync branch + PR from upstream |

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
