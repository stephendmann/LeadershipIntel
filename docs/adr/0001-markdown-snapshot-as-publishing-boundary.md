---
status: accepted
date: 2026-09-15
---

# Markdown snapshot as the publishing boundary

Notion is the source, but the site fetched from it at request time, so a
transient Notion failure became a user-visible outage — as it did for roughly
six weeks in August–September 2026. We are introducing a versioned Markdown
**snapshot** as the publishing boundary: the **sync** proposes it, validation
accepts it, and the **static build** renders only from it. The site can no
longer be blanked by anything happening at Notion.

## Body contract

Strict CommonMark + GFM with validated frontmatter. No MDX components.

The contract is deliberately renderer-neutral because the renderer decision is
open: Next.js now, Astro compared later against this same contract. A snapshot
holding Notion `recordMap` structures would force any renderer to adopt
`react-notion-x` and would make that comparison meaningless.

Measured across all ten published articles, four constructs have no plain or
renderer-neutral equivalent and degrade as follows:

| Construct | Occurrences | Rule |
|---|---|---|
| Callout | 7 blocks, 3 articles | blockquote, preserving text and emoji where available |
| Columns | 1 article | stacked sequentially in source order |
| Highlight / colour | 2 spans, 1 article | normalised to ordinary text |
| Date mention | all 10 articles | rendered date text, not a live object |
| Explicit image width | 2 images | excluded unless representable without renderer-specific markup |
| Table | 1 article | GFM table syntax; header styling may differ |

Absent across all ten, and therefore not designed for: equations, synced blocks,
bookmarks, embeds, video, file, PDF, toggles, code blocks, tables of contents.

**Reconsider MDX when** a fourth article requires a callout, or a second
requires columns.

## Self-containment

A snapshot must not reference anything that expires. Notion attachment URIs are
resolved during sync, their bytes downloaded into the snapshot's managed asset
directory, and the Markdown rewritten to a stable local path. No `attachment:`
URI or Notion signed URL is ever committed. Genuinely external URLs are retained
as-is, subject to the project's asset policy.

The manifest records, per asset: source page ID, source asset ID, original URI,
local path, content hash, and fetch timestamp.

**A sync that cannot resolve or download an attachment fails.** It does not
publish a snapshot with a broken or expiring reference.

## Validation invariant

> A failed, empty, partial or malformed sync must never replace the last
> known-good snapshot.

This is the same defect as issue #78 one layer up: there, an empty Notion result
was cached because `{}` is truthy, pinning a blank site for the revalidation
window. A sync without an emptiness guard would commit the same mistake with a
larger blast radius. The guard is tested, not merely described.

Fixtures, chosen because five articles cover every case:

| Case | Fixture article |
|---|---|
| GFM table, inline code | `how-i-publish-with-notion` |
| Columns, attachment image | `governing-ai-why-governance-literacy-matters-more-than-technical-expertise` |
| Highlight / colour span | `drinking-from-the-hydrant-ai-productivity-vs-wisdom` |
| Callout | `cognitive-uploading-inverted-search` |
| Attachment image (minimal) | `stephendmann-consulting` |
| Date mention | any — present in all ten |
| Links, emphasis, lists, headings | `ikigai-for-leaders` |

## Site configuration and navigation do not cross the boundary

The snapshot holds articles, frontmatter, managed assets and the manifest. It
does not hold configuration.

Today a single Notion database carries articles alongside `CONFIG`, `Menu`,
`SubMenu` and `Link` rows, discriminated by a `type` field, and `blog.config.js`
already holds repo-side configuration that Notion can override. That split is
undocumented and lets a Notion edit change site behaviour with no review.

Therefore: `NOTION_CONFIG` moves into explicit repository configuration.
`customMenu`, `customNav`, `allNavPages` and `allLinkPages` move into explicit
repository navigation files. `tagOptions` and `categoryOptions` are derived from
published article frontmatter at build time rather than synced, so a tag cannot
exist without a post. The repository configuration schema is explicit and
validated at build time. Notion `CONFIG`, `Menu`, `SubMenu` and `Link` rows are
not synced.

## Considered options

**Notion `recordMap` snapshot.** Maximum fidelity, no conversion to maintain.
Rejected: it makes the contract Notion-shaped, so the open Astro decision would
be foreclosed while appearing to remain open.

**Markdown plus MDX components** for callouts and columns. Rejected for now: one
column layout and seven callouts do not justify a component vocabulary that each
renderer must implement. Revisit on the trigger above.

**Configuration and navigation inside the snapshot.** Rejected: configuration is
not content, and keeping it in Notion preserves exactly the property this work
exists to remove — a change that alters site behaviour without review.

## Consequences

Three articles change appearance permanently: callouts render as blockquotes,
one article's two columns stack, one highlighted span becomes ordinary text.

**Menu reordering is no longer done in Notion.** Navigation changes are edits to
repository files, reviewed in a pull request. This is a real loss of convenience,
accepted deliberately in exchange for reviewability.

The converter becomes a component this project maintains.

In exchange: Notion cannot blank the site, content is reviewable in Git and
revertable by commit, and the renderer comparison is genuine.
