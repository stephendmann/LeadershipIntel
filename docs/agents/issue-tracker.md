# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues on `stephendmann/LeadershipIntel`.

## Which tooling to use

This repo is worked on from two environments, and they do not share the same GitHub tooling. Check which one you are in before running anything.

| Environment | Tooling |
| --- | --- |
| Claude Code locally (desktop / CLI) | the `gh` CLI |
| Claude Code on the web / remote sessions | **GitHub MCP tools** (`mcp__github__*`) — `gh` is **not installed** |

If `command -v gh` finds nothing, you are in the second case. Do not try to install it; use the MCP tools.

## Conventions

| Operation | `gh` CLI | GitHub MCP |
| --- | --- | --- |
| Create an issue | `gh issue create --title "..." --body "..."` (heredoc for multi-line) | `issue_write` with method `create` |
| Read an issue | `gh issue view <n> --comments` | `issue_read` with method `get` / `get_comments` |
| List issues | `gh issue list --state open --json number,title,body,labels` | `list_issues` |
| Comment | `gh issue comment <n> --body "..."` | `add_issue_comment` |
| Labels | `gh issue edit <n> --add-label "..."` / `--remove-label` | `issue_write` with method `update` |
| Close | `gh issue close <n> --comment "..."` | `issue_write` with method `update`, setting `state_reason` |

Always set `state_reason` when closing.

Infer the repo from `git remote -v`; `gh` does this automatically inside a clone, and the MCP tools take explicit `owner` / `repo`.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

This is a single-maintainer repo. Its open PRs are either the maintainer's own work or Dependabot, so treating them as an inbound request queue would only add noise.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either. Resolve by trying the PR first, then the issue.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Read the issue with its comments.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: one issue labelled `wayfinder:map` holding the Notes / Decisions-so-far / Fog body.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue. Where sub-issues are not enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research` / `prototype` / `grilling` / `task`).
- **Blocking**: GitHub's native issue dependencies where available; otherwise a `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Frontier query**: list the map's open children, drop any with an open blocker or an assignee; first in map order wins.
- **Claim**: assign the issue to yourself — the session's first write.
- **Resolve**: comment the answer, close the issue, then append a context pointer to the map's Decisions-so-far.

Note that the `gh api` sub-issue and dependency endpoints named in the upstream template are not reachable from the MCP toolset. In a remote session, prefer the task-list and `Blocked by:` fallbacks, which work in both environments.

## Repository-specific notes

- GitHub Issues were disabled on this repo until 2026-09 and enabled by the owner. Long-lived planning notes therefore live under `docs/` rather than in issue history.
- Labels in active use include `documentation`. Check existing labels before creating new ones.
