# LeadershipIntel — Claude Code Instructions

## Project purpose

LeadershipIntel is Stephen Mann's personal publishing platform. It renders selected Notion content as a public leadership and management blog for stephendmann.com.

Notion remains the authoring system. The long-term architecture is:

Notion for authoring → validated versioned local content → static site build → Vercel.

## Current stack

- Next.js Pages Router.
- React and react-notion-x / NotionNext-derived rendering.
- Yarn.
- Vercel deployment.
- GitHub Actions for CI and checks.
- Notion as the current content source.
- The `next` theme is the only supported runtime theme.

## Working rules

- Make the smallest safe change that solves the stated problem.
- Do not merge upstream NotionNext wholesale.
- Do not upgrade major frameworks or dependencies unless explicitly requested.
- Do not change Notion credentials, Vercel settings, deployment protection, or repository settings without explicit approval.
- Do not delete unused theme directories unless a task explicitly authorises that cleanup.
- Treat `blog.config.js` and site-specific configuration as protected customisation.
- Preserve the cache guard in `lib/cache/cache_manager.js`.
- Preserve the User-Agent fix in `lib/db/notion/getNotionAPI.js`.
- Do not reintroduce runtime imports for unsupported themes.

## Validation

Before reporting a code change as complete:

- Inspect the complete diff.
- Run the narrowest relevant tests.
- Run `yarn lint`.
- Run `yarn type-check`.
- Run a production build when the change affects rendering, routing, bundling, or deployment.
- Never claim a deployment or runtime test passed unless the request reached the actual application rather than a login or redirect page.
- Distinguish structural/build evidence from behavioural production evidence.
- Report pre-existing failures separately from failures caused by the change.

## Git and PR rules

- Work on a feature branch.
- Keep unrelated changes out of the branch.
- Prefer draft PRs until validation is complete.
- Do not merge without explicit approval.
- Do not force-push unless explicitly authorised and genuinely necessary.
- Include rollback instructions in PR descriptions for production-impacting changes.

## Current architecture direction

The planned migration is incremental:

1. Keep Notion for authoring.
2. Create a validated local content snapshot.
3. Ensure failed or empty synchronisation cannot replace the last known-good snapshot.
4. Move the public site to a genuinely static build with no request-time Notion fetch or ISR dependency.
5. Evaluate Astro separately using the same content contract; do not combine that decision with the first content-sync implementation.

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues. Use the `gh` CLI locally, or the GitHub MCP tools in remote sessions where `gh` is not installed. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Do not put here

Detailed ADRs, incident reports, issue descriptions, generated skill instructions, and long migration notes belong in the appropriate `docs/` files. Keep this file short enough to be useful every session.
