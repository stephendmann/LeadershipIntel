# LeadershipIntel

A personal knowledge and publishing platform built on [NotionNext](https://github.com/tangly1024/NotionNext) — an open-source framework that renders a Notion database as a public blog, deployed via Vercel.

**Live site:** [stephendmann.com](https://stephendmann.com)
**Author:** Stephen Mann — management consultant and leadership adviser based in Tauranga, New Zealand

---

## How It Works

```
Notion database (LeadershipIntelligence)
  → NotionNext (this GitHub fork)
    → Vercel (auto-deploy on commit)
      → stephendmann.com
```

Content is written and managed entirely in Notion. Vercel re-fetches content every ~60 seconds, so publishing a new post requires no code deployment — just set **Status = Published** in the Notion database.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) |
| Rendering | [React-notion-x](https://github.com/NotionX/react-notion-x) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Theme | `next` (customised) |
| Hosting | [Vercel](https://vercel.com) (free tier) |
| Content source | Notion database via Notion API |
| Images | Cloudflare R2 (public CDN) |

---

## Repository Structure

```
blog.config.js          # Master site configuration
conf/                   # Modular config (analytics, comments, ads, fonts, etc.)
themes/next/            # Active theme — customised Next theme
  config.js             # Theme-specific settings
  components/           # Theme components (ArticleCopyright, Toc, etc.)
components/             # Shared components (Tabs, ShareBar, etc.)
lib/lang/en-US.js       # English UI strings
pages/                  # Next.js page routes
public/                 # Static assets
```

---

## Key Configuration

### `blog.config.js`
Master config file. Critical fields:

```js
NOTION_PAGE_ID: '07db71a7201283c2b125815a6bc5cb1b',  // Notion database ID
THEME: 'next',
LANG: 'en-US',
AUTHOR: 'Stephen Mann',
LINK: 'https://stephendmann.com',
NEXT_REVALIDATE_SECOND: 60,   // Content cache refresh interval (seconds)
```

### `/themes/next/config.js`
Theme-specific settings: nav type, sidebar widgets, TOC, article footer options.

### `/conf/` folder
Split config by concern:

| File | Controls |
|---|---|
| `analytics.config.js` | Google Analytics ID |
| `comment.config.js` | Comment system (Giscus, Cusdis, Disqus) |
| `contact.config.js` | Social links (LinkedIn, Twitter, email) |
| `ad.config.js` | AdSense |
| `plugin.config.js` | Algolia search and other plugins |

### Notion Config Table (in-database overrides)
A special row with **Type = CONFIG** in the Notion database overrides both `blog.config.js` and Vercel environment variables. This is the highest-priority config layer. Requires NotionNext v4.1.0+.

---

## Publishing Workflow

1. Write a new page in the **LeadershipIntelligence** Notion database
2. Set **Status = Draft** while writing
3. Fill in: **Type** (`Post`), **Category**, **Tags**, **Summary**, **Slug**, **Cover**
4. Set **Status = Published** → live within ~60 seconds
5. To unpublish: change Status to `Revoke` or `Invisible`

### Content Types

| Type | Purpose | In blog feed? |
|---|---|---|
| `Post` | Dated article (default for all content) | ✅ Yes |
| `Page` | Evergreen standalone page (About, Services) | ❌ No |
| `Menu` | Top-nav link | ❌ No |
| `Notice` | Site-wide announcement banner | ❌ No |
| `CONFIG` | System config overrides — do not create manually | ❌ No |

### Status Values

| Status | Visible publicly? |
|---|---|
| `Published` | ✅ Yes |
| `Draft` | ❌ No |
| `Invisible` | ❌ No |
| `Revoke` | ❌ No (previously published, now hidden) |

---

## Content Categories

| # | Category | Visibility |
|---|---|---|
| 1 | 🤖 AI Research & Intelligence | Public |
| 2 | 🏢 Leadership & Management | Public |
| 3 | 💻 App & Digital Solutions | Public |
| 4 | 🎓 Education & Teaching | Public |
| 5 | _📖 Bible Study & Prophecy | Private only |
| 6 | ✍️ Writing & Content | Public |
| 7 | 🏥 Health & Community Sector | Public |
| 8 | 📚 Research & Reading | Mostly private |
| 9 | 🌏 NZ Context & Current Affairs | Public |
| 10 | _🗓️ Personal & Admin | Private only |

> Categories prefixed with `_` are private by convention — keep all rows in these categories set to `Invisible`.

---

## Domain & Vercel Setup

- Vercel project → Settings → Domains → custom domain added
- DNS: CNAME record pointing to `cname.vercel-dns.com` (via Hostinger)
- `NOTION_PAGE_ID` set as a Vercel Environment Variable

---

## Keeping the Fork Updated

The repo includes an `Upstream Sync` GitHub Action that auto-syncs with the upstream [tangly1024/NotionNext](https://github.com/tangly1024/NotionNext) repo.

> **Caution:** Before any upstream sync, back up: `blog.config.js`, `themes/next/config.js`, `conf/ad.config.js`, and `pages/_document.js` — these contain site-specific customisations that a sync may overwrite.

To disable auto-sync: GitHub → Actions → `Upstream Sync` → Disable workflow.

---

## Local Development

```bash
# Install dependencies
yarn install

# Run dev server
yarn dev
# → http://localhost:3000
```

Requires a `.env.local` file with:
```
NOTION_PAGE_ID=07db71a7201283c2b125815a6bc5cb1b
```

---

## Built On

This project is a fork of [NotionNext](https://github.com/tangly1024/NotionNext) by [tangly1024](https://github.com/tangly1024), which was itself inspired by the [Nobelium](https://github.com/craigary/nobelium) project by Craig Hart. NotionNext is released under the MIT License.

---

## License

MIT
