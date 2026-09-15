# Incident: blank pages served as HTTP 200 (Aug–Sep 2026)

**Duration:** 2026-08-04 → 2026-09-15 (~6 weeks)
**Impact:** Crawlers, social previews and RSS fetchers received pages with no
`<title>` and no content. Browsers hydrated and looked normal, so the site
appeared fine to anyone who opened it.
**Detected by:** a manual review on 2026-09-15. No alert fired.

---

## Symptom

Pages returned **HTTP 200** with a body containing only the Google Tag Manager
script — about 438 characters of rendered markup, no `<title>`, no layout:

```html
<div id="__next">[Google Tag Manager scripts]</div>
```

Three properties made it hard to see:

- **The status code was fine.** An uptime ping stays green throughout.
- **The response was large.** `__NEXT_DATA__` stayed fully populated, so total
  response size looked healthy; only the *rendered* region was empty.
- **Browsers looked normal.** Client-side hydration filled the page in, so
  opening the site by hand showed nothing wrong.

It was also intermittent per page and per cache artefact: build-time
prerendered pages were fine, runtime-regenerated ones were not, and a bad
artefact was then cached and served until the next revalidation.

---

## Root causes, by fix

Four separate defects, found in sequence. Each was real; none alone explains
the whole six weeks.

| PR | Defect | Fix |
|----|--------|-----|
| [#80](https://github.com/stephendmann/LeadershipIntel/pull/80) | Notion's fronting Cloudflare began rejecting unofficial `/api/v3` requests with no `User-Agent`. Node's `fetch` does not set one, so every `notion-client` call from Vercel returned **403** from 2026-08-04. | Send a `User-Agent` (upstream `b246a9c`). |
| [#81](https://github.com/stephendmann/LeadershipIntel/pull/81) | `convertNotionToSiteData` returns `{}` on a failed fetch. The cache manager's write guards tested bare truthiness, and `{}` is truthy — so a transient failure was cached and served for the whole revalidation window. | Reject empty values on the write path, reusing the predicate the read path already used. |
| [#82](https://github.com/stephendmann/LeadershipIntel/pull/82) | An unresolved template-literal theme import made `next/dynamic` render `null`. Because the base layout wraps `<SEO>` and `<Component>`, the whole head and body were discarded. | Port upstream's `resolveThemeLayout` / `EmptyBaseLayout` so the subtree is passed through. **Mitigation only** — see below. |
| [#84](https://github.com/stephendmann/LeadershipIntel/pull/84) | `next/dynamic` can only preload a module for SSR when the import is *literal*. A template literal compiles to a webpack context module with no single id, so nothing is preloaded and a cold lambda renders `null` before the promise settles. | An explicit statically analysable loader map, one literal import per theme. |

### Why #82 was not enough

After #82 shipped, production **still** produced GTM-only renders, and one page
survived a full regeneration cycle empty:

```
t+0    HIT    438   GTM-ONLY
t+50   STALE  438            <- regeneration #1
t+75   HIT    438   GTM-ONLY  <- still empty after regen #1
t+125  STALE  438            <- regeneration #2
t+150  HIT    18822           <- recovered
```

The tell was that **no `[theme] … using empty layout` warning ever fired**.
Upstream's resolver was never reached — `dynamic` returned `null` first. #82
addressed a missing *export*; the actual failure was a missing *preload*.

That distinction is the main technical lesson: a merged diff that looks like it
should fix something is not evidence that it did.

---

## Acceptance evidence

Run against production on 2026-09-15 after #84 (`681140b`, deployment
`dpl_FjBUzj6u`): 13 samples across the 7 baseline pages over ~5 minutes, each
page through at least two **completed** regenerations (`STALE` → fresh
artefact).

- **Zero** GTM-only renders on any completed regeneration.
- Cold `MISS` renders — a lambda that had never loaded the theme module, which
  is exactly where `438` appeared on every previous deploy — produced **9,420**
  and **14,950** characters.
- **No `[theme]` warnings** in the runtime logs, meaning the import was
  genuinely preloaded rather than rescued by the fallback.
- Final state: all 7 pages `HIT`, all with `<title>`, 3–8 layout elements.

This covers the known failure mode on a fixed set of pages over a short window.
It is not a claim that every page is healthy indefinitely.

---

## The process failure

The technical bugs were fixed in a few hours. **The site served broken pages
for six weeks because nothing was watching.**

The monitoring that existed would not have caught this:

| Signal | Why it stayed green |
|--------|---------------------|
| Uptime ping | Status was 200 throughout |
| Response size | `__NEXT_DATA__` kept the body large |
| Opening the site | Client hydration rendered it correctly |
| Vercel build status | Builds succeeded; the failure was at runtime |
| CI | Ran lint and type-check only; no test executed |

Contributing factors worth recording:

- **A detector has to assert on rendered content**, not liveness. The fix is
  `.github/workflows/content-check.yml`, which measures markup between
  `<div id="__next">` and `__NEXT_DATA__`, and runs outside Vercel so a
  Vercel-side failure cannot also silence it.
- **Failures were silent.** Neither the 403s nor the null layout produced an
  error anyone saw. The 403 path logged a warning that nothing surfaced; the
  layout path threw nothing at all.
- **The Actions tab had been red for months.** `upstream-sync.yml` had 133
  consecutive failed runs from invalid YAML, which trains everyone to ignore
  red. Retired in a follow-up.
- **The test suite was not running.** Three suites could not even load, and CI
  did not invoke Jest at all, so 137 tests were invisible. Fixed in #82,
  which also added a `Test` job.

---

## Follow-ups

| Item | Status |
|------|--------|
| Content-check workflow (in-repo detection) | PR #85 |
| Retire `upstream-sync.yml`, document manual syncing | PR #86 |
| External uptime monitor with a content assertion | Owner — outside this repo |
| Make `Test` a required check | Done (repository setting) |

---

_Recorded 2026-09-15._
