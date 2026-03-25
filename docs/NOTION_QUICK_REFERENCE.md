# NotionNext Quick Reference Guide

> Saved from the Notion Quick Reference Guide (2026-03-23).
> Canonical source: https://www.notion.so/32c20a0e65618127846ed1e8f8b4128b
>
> **Amendments needed in the Notion source** are marked with `⚠️ AMENDMENT NEEDED`.

---

## How It Works

NotionNext reads your Notion database via the Notion API and renders it as a static website using Next.js. Vercel re-fetches content every ~60 seconds (configurable), so you never need to redeploy just to publish new content.

- **Source:** Your Notion database (the one with `NOTION_PAGE_ID` set in Vercel)
- **Engine:** Next.js + NotionNext framework (your GitHub fork)
- **Host:** Vercel (free tier)
- **Domain:** Your custom domain pointed via CNAME to Vercel

**Your setup:** Notion database (LeadershipIntelligence) → NotionNext (GitHub fork) → Vercel → [stephendmann.com](https://stephendmann.com)

---

## Understanding the Type Field

The **Type** property tells NotionNext *how* to treat each row in your database — it controls where and how content appears, not just whether it's visible. Choosing the wrong type is the most common reason a published page doesn't show up where you expect it.

### Type Options at a Glance

| Type | What it does | Needs a Slug? | Appears in blog feed? |
|---|---|---|---|
| `Post` | A dated blog article, categorised and listed in your feed | ✅ Yes | ✅ Yes |
| `Page` | A standalone evergreen page (e.g. About, Services, Contact) | ✅ Yes | ❌ No |
| `Menu` | Creates a top-navigation menu item linking to a URL or Page | ❌ No | ❌ No |
| `Notice` | A site-wide announcement banner shown to all visitors | ❌ No | ❌ No |
| `CONFIG` | System row only — stores key/value config overrides | ❌ No | ❌ No |

### When to Use Each Type

- **Post** — your default for almost everything: articles, AI analyses, leadership insights, tutorials, case studies. These appear in the dated blog listing with category and tag filtering.
- **Page** — use for structural, evergreen content like an *About* or *Services* page. Publicly accessible via its slug URL but sits *outside* the blog feed — no publish date, no category listing.
- **Menu** — use sparingly to add items to the site's top navigation bar. The row content itself is never displayed as an article; it just creates a clickable nav link.
- **Notice** — use for temporary site-wide messages shown as a banner to all visitors (e.g. "New AI consulting course launching soon"). Remove or set to `Invisible` when done.
- **CONFIG** — the Config Centre system row. Don't create new rows of this type manually; reserved for technical site settings that override `blog.config.js`.

### The Critical Distinction: Post vs. Page

Only `Post` rows appear in your blog listing feed. A `Page` with `Status = Published` *will* be accessible if someone visits its slug URL directly, but it will **not** show up in your article list, category views, or tag pages.

> **Posts are published content; Pages are site structure.**
>
> ⚠️ If you write an article and set Type = `Page` by mistake, it won't appear in your feed even with Status = `Published`. Always double-check Type = `Post` for blog content.

---

## Publishing a Post

To make a Notion page appear on your public blog, it must have **all four** of these properties set correctly:

1. **Type** → `Post`
2. **Status** → `Published`
3. **Title** → Your post headline
4. **Slug** → URL-friendly identifier (e.g. `my-first-post` → `stephendmann.com/my-first-post`)

### What Is a Slug?

A **slug** is the short, human-readable text at the end of a URL. It's just the unique identifier portion after your domain name. In `stephendmann.com/leadership-tips`, the slug is `leadership-tips`.

| Concept | Example | Who defines it |
|---|---|---|
| Full URL | `https://stephendmann.com/ai-leadership-tips` | Browser + domain + slug |
| Slug | `ai-leadership-tips` | You, in the Notion database field |
| Domain | `stephendmann.com` | Set once in Vercel/DNS |

### Why Slugs Are Used

- **Readability** — tells readers and Google what the page is about before they click
- **Stability** — if you rename the post Title in Notion, the URL stays the same as long as the slug doesn't change
- **SEO** — search engines weight keywords in the URL path

### How to Structure a Good Slug

- **Lowercase only** — `my-first-post`, not `My-First-Post`
- **Hyphens between words** — never spaces or underscores
- **No special characters** — avoid `?`, `&`, `#`, `/`, apostrophes, or emoji
- **Keep it short and keyword-rich** — 3–5 words that reflect the post title
- **No leading or trailing hyphens**

A post titled *"5 Ways AI Is Transforming Leadership in NZ"* → slug: `ai-transforming-leadership-nz` → URL: `stephendmann.com/ai-transforming-leadership-nz`

> ⚠️ Once a post is published and indexed, **avoid changing its slug**. Doing so breaks the old URL entirely. If you must change it, set up a redirect in your Vercel configuration.

### Other Post Properties

- **Category** → One of your 10 categories (e.g. AI Research & Intelligence)
- **Tags** → Comma-separated keywords for filtering
- **Date** → Publication date (defaults to creation date)
- **Summary** → Short excerpt shown in blog listings
- **Cover** → Cover image URL for the post card

---

## Keeping Content Private

| Status | Visible on blog? | Use for |
|---|---|---|
| `Published` | ✅ Yes | Live public posts |
| `Invisible` | ❌ No | Permanent private content |
| `Draft` | ❌ No | Work in progress |
| `Revoke` | ❌ No | Previously published, now hidden |

**Private-only categories** — always keep these as `Invisible`:
- `_Bible Study & Prophecy`
- `_Personal & Admin`
- `Research & Reading` (unless specifically publishing a piece)

---

## Your 10 Category Structure

| # | Category | Public or Private? |
|---|---|---|
| 1 | 🤖 AI Research & Intelligence | Both |
| 2 | 🏢 Leadership & Management | Both |
| 3 | 💻 App & Digital Solutions | Both |
| 4 | 🎓 Education & Teaching | Both |
| 5 | _📖 Bible Study & Prophecy | Private only |
| 6 | ✍️ Writing & Content | Both |
| 7 | 🏥 Health & Community Sector | Both |
| 8 | 📚 Research & Reading | Mostly private |
| 9 | 🌏 NZ Context & Current Affairs | Both |
| 10 | _🗓️ Personal & Admin | Private only |

> The underscore prefix (`_`) on private-only categories keeps them sorted to the top of your dropdown and signals "never publish."

---

## Rich Content Recipes

### Recipe: Inline Images and Covers

1. Open your post in the LeadershipIntelligence database.
2. Add inline images: type `/image` → **Upload** (local) or **Paste link** (CDN/R2 URLs).
3. Set a cover image: click **Add cover** at the top of the page. Use a wide landscape image (16:9) so it crops well.
4. For large images, prefer external hosting (Cloudflare R2) — upload and paste the public URL.
5. After publishing, check the live page after ~1–2 minutes to confirm cropping, spacing, and mobile layout.

### Recipe: Charts and Dashboards

**A. Native Notion tables as "charts"**
1. Create a **database (table view)** or insert a **Linked database** on the post page.
2. Add Number, Select, Formula, Rollup properties to model the data.
3. Use Group and Sort to create structure.
4. Enable **Calculate** in the footer (Sum, Average, Count) for key metrics.

**B. Static charts from external tools**
1. Build the chart in Excel, Google Sheets, or a plotting tool.
2. Export as PNG.
3. Insert an **Image** block in Notion and upload the PNG.
4. Add a caption below: "Figure 1: AI scenario maturity by sector."

**C. Live embedded dashboards**
1. Publish a dashboard (Looker Studio, Metabase, etc.) and copy its embed URL.
2. Add an **Embed** block in Notion and paste the URL.
3. If it renders in Notion, it will usually render in NotionNext. If not, fall back to option B.

### Recipe: Tables, KPIs, and Calculations

**A. KPI tables with Notion databases**
1. Create or link a database with Number, Formula, and Select properties.
2. Use a **table view** for blog posts.
3. Enable **Calculate** at the bottom row for KPI totals.
4. Add 1–2 plain-language sentences above the table explaining each metric.

**B. Inline calculations in text**
1. For simple equations: type them directly — "Risk score = likelihood 4 × impact 3 = 12."
2. Use a **code block** for more complex expressions so they stand out clearly.

**C. "Mini dashboards" with multiple views**
1. Insert a **Linked database** to your master database on the post page.
2. Create Table, Board, and Calendar views with filters per article's scope.
3. NotionNext renders each view as its own block — a mini dashboard inside the post.

---

## Key Configuration Files

These files live in your GitHub fork. Edit them to customise the site — Vercel auto-deploys within ~3 minutes of a commit.

### `blog.config.js` (root)

⚠️ **AMENDMENT NEEDED:** The Notion ref guide shows `THEME: 'heo'` in its example. The active theme is `'next'`, not `'heo'`. Update the ref guide example to reflect this.

```js
NOTION_PAGE_ID: '07db71a7201283c2b125815a6bc5cb1b',
THEME: 'next',               // ← active theme (ref guide incorrectly shows 'heo')
LANG: 'en-US',
AUTHOR: 'Stephen Mann',
LINK: 'https://stephendmann.com',
KEYWORDS: 'AI, Leadership, Consulting, NZ',
NEXT_REVALIDATE_SECOND: 60,
```

### `/themes/next/config.js`

⚠️ **AMENDMENT NEEDED:** The Notion ref guide references `/themes/heo/config.js`. The correct path is `/themes/next/config.js`. Update accordingly.

Theme-specific settings: nav type, sidebar widgets, TOC display, article footer (copyright, related posts, etc.)

### `/conf/` folder

| File | Controls |
|---|---|
| `comment.config.js` | Giscus / Cusdis / Disqus settings |
| `analytics.config.js` | Google Analytics ID |
| `ad.config.js` | Google AdSense IDs |
| `plugin.config.js` | Algolia search, other plugins |
| `contact.config.js` | Social links (LinkedIn, Twitter, email) — used in author bio card |

### `pages/_document.js`

For injecting raw HTML/scripts into `<head>` (e.g. analytics tags, verification meta tags).

---

## Notion Config Table (In-Notion Settings)

Your database has a special row with **Type = CONFIG** called Config Centre. Any key/value pair added here **overrides** both `blog.config.js` and Vercel environment variables — highest priority.

To add a config override in Notion:
1. Open your database → find the CONFIG-type row
2. Click the inline table inside it
3. Add a new row: `name` = config key, `value` = config value

Example: Add `ANALYTICS_GOOGLE_ID` → `G-XXXXXXXXXX` here instead of editing code.

> Only works with NotionNext v4.1.0+

---

## Domain & Vercel Setup

1. Vercel project → Settings → Domains → add your custom domain
2. In Hostinger DNS: add a CNAME record pointing to `cname.vercel-dns.com`
3. Once DNS propagates, Vercel shows "Valid Configuration"
4. Set `NOTION_PAGE_ID` as a Vercel Environment Variable (Settings → Environment Variables)

---

## Keeping NotionNext Updated

⚠️ **AMENDMENT NEEDED:** The Notion ref guide recommends a two-branch strategy (`main` synced upstream, custom branch for Vercel). The current repo deploys from `main` directly — there is no separate custom branch. The ref guide should note this or be updated to reflect the current single-branch setup.

The repo includes an `Upstream Sync` GitHub Action that auto-syncs with the upstream NotionNext repo.

**Before any upstream sync, back up these files** (they contain site-specific customisations):
1. `blog.config.js`
2. `themes/next/config.js`
3. `conf/ad.config.js`
4. `pages/_document.js`

To disable auto-sync: GitHub → Actions → `Upstream Sync` → Disable workflow.

---

## Importing Evernote Content

1. In Evernote: File → Export Notes → save as `.enex` files per notebook
2. In Notion: Settings → Import → Evernote (connects directly or accepts `.enex`)
3. ⚠️ Land all imported content in a **staging page first** — not directly in LeadershipIntelligence
4. Review, assign a Category, set Status = `Invisible`
5. Promote to `Published` only when ready

**What imports well:** text, formatting, titles, attachments, creation dates, tags
**What needs cleanup:** complex formatting, embedded PDFs, notebook hierarchy (becomes flat)

---

## Adding Comments (Optional)

| Tool | Best for | Config file |
|---|---|---|
| Giscus | GitHub-based, clean, free | `conf/comment.config.js` |
| Cusdis | Lightweight, privacy-friendly | `conf/comment.config.js` |
| Disqus | Feature-rich, widely known | `conf/comment.config.js` |

Set `COMMENT_SYSTEM` to your chosen provider and add the required IDs in `conf/comment.config.js`.

---

## Quick Daily Workflow

1. Write in Notion → create a new page in LeadershipIntelligence database
2. Set **Status = Draft** while writing
3. Add: Category, Tags, Summary, Slug, Cover image
4. Set **Status = Published** → live within ~60 seconds
5. To unpublish: change Status to `Revoke` or `Invisible`

---

## Useful Links

- [NotionNext GitHub](https://github.com/tangly1024/NotionNext)
- [Official Docs](https://docs.tangly1024.com/article/vercel-deploy-notion-next)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Your Notion Database](https://www.notion.so/07db71a7201283c2b125815a6bc5cb1b)
- [LeadershipIntel GitHub](https://github.com/stephendmann/LeadershipIntel)

---

## Article Skeleton Template

Use this structure each time you write a new post.

### Post properties (fill in before writing)

```
Type:     Post
Status:   Draft  (switch to Published when ready)
Title:    [Your post headline]
Slug:     [your-post-slug]
Category: [e.g. AI Research & Intelligence]
Tags:     [tag1, tag2, tag3]
Summary:  [One sentence shown in blog listings]
Cover:    [Paste Cloudflare R2 image URL here]
```

### 1. Introduction
Write 2–3 sentences setting the context. What problem does this post address? Who is it for?

`[ COVER IMAGE BLOCK ]`
Insert your hero/banner image here. Use a 16:9 landscape image for best crop in the next theme.

### 2. Main content section
Main argument, findings, or tutorial steps. Use headings, bullet points, and numbered lists freely.

`[ CHART / DATA TABLE BLOCK ]`
Option A: Linked database filtered for this post.
Option B: Static PNG chart from Excel/Sheets/Canva.
Option C: Embed block with a live dashboard URL.

### 3. Key metrics or calculations
Summarise the numbers that matter. Use inline text for simple equations:
`Risk score = likelihood (4) × impact (3) = 12`

For complex expressions use a Code block.

`[ KPI TABLE BLOCK ]`
Inline database with Number/Formula properties. Enable Calculate totals in the footer.

### 4. Conclusion & next steps
2–3 key takeaways. Call to action — what should the reader do next?

---

Once finished, set **Status = Published**. The post will appear on [stephendmann.com](https://stephendmann.com) within ~60 seconds.

---

## Amendments Needed in the Notion Quick Reference Guide

The following corrections should be made to the canonical Notion source page:

1. **Theme name:** The config example shows `THEME: 'heo'` — should be `THEME: 'next'`
2. **Theme config path:** References `/themes/heo/config.js` — should be `/themes/next/config.js`
3. **Branch strategy:** Recommends a `main` + custom branch setup. Current repo deploys from `main` only — update to reflect actual setup or note it as an optional recommendation
4. **Author bio card:** Custom `ArticleCopyright.js` now renders a Stephen Mann bio card with avatar, bio text, and social icon links — not the default copyright block. The ref guide doesn't mention this
5. **Share bar removed:** The post-footer share icon row has been removed from `themes/next/components/ArticleDetail.js`
6. **TOC label:** "Catalog" has been renamed to "Article Sections" in `lib/lang/en-US.js`
7. **TOC styling:** Active tab and item styling have been cleaned up (no red underline or jello animation)
