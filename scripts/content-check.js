#!/usr/bin/env node

/**
 * Content check — fetches the public site and asserts that pages actually
 * rendered, rather than merely responding.
 *
 * Background: for roughly six weeks the site intermittently served HTTP 200
 * with a ~438-character body containing only the Google Tag Manager script —
 * no <title>, no layout. A plain uptime ping stays green through that, which
 * is why it went unnoticed. This asserts on content instead.
 *
 * Run from a GitHub-hosted runner against the public URL, deliberately outside
 * Vercel, so a Vercel-side failure cannot also silence the detector.
 *
 * Configuration comes from the environment; see
 * .github/workflows/content-check.yml.
 */

const fs = require('fs')

/** Structural elements a real layout renders; a GTM-only shell has none. */
const CHROME_PATTERN = /<(nav|footer|header|article|main)\b/g

const NEXT_ROOT = '<div id="__next">'
const NEXT_DATA = '<script id="__NEXT_DATA__"'

/**
 * Characters of markup React actually rendered.
 *
 * Measured between the app root and the serialized props blob, because
 * __NEXT_DATA__ stays fully populated even when nothing renders. Total
 * response size is therefore a misleading signal — it is precisely what made
 * the original failure look healthy at a glance.
 */
function renderedRegion(html) {
  if (typeof html !== 'string') return ''
  const start = html.indexOf(NEXT_ROOT)
  if (start < 0) return ''
  const end = html.indexOf(NEXT_DATA, start)
  return end > start ? html.slice(start, end) : html.slice(start)
}

function titleOf(html) {
  if (typeof html !== 'string') return ''
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return match ? match[1].trim() : ''
}

function countChrome(markup) {
  return (String(markup).match(CHROME_PATTERN) || []).length
}

/**
 * Classify an already-fetched page. Pure, so it can be tested without a
 * network: the parsing rules are the part that could silently stop detecting.
 */
function classify({ status, body }, { minRenderedChars, minChromeElements }) {
  if (status !== 200) {
    return { ok: false, class: 'UNREACHABLE', detail: `HTTP ${status}`, status }
  }

  const region = renderedRegion(body)
  const rendered = region.length
  const chrome = countChrome(region)
  const title = titleOf(body)

  const reasons = []
  if (!title) reasons.push('missing or empty <title>')
  if (rendered < minRenderedChars) {
    reasons.push(`rendered ${rendered} chars < ${minRenderedChars}`)
  }
  if (chrome < minChromeElements) {
    reasons.push(`${chrome} layout elements < ${minChromeElements}`)
  }

  const metrics = { status, rendered, chrome, title: title.slice(0, 60) }
  return reasons.length
    ? { ok: false, class: 'EMPTY_RENDER', detail: reasons.join('; '), ...metrics }
    : { ok: true, class: 'OK', detail: '', ...metrics }
}

function parsePages(raw) {
  return String(raw || '')
    .split(/\r?\n|,/)
    .map(s => s.trim())
    .filter(Boolean)
}

async function checkPage(host, path, thresholds, timeoutMs) {
  const url = `${host}${path}`
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'user-agent': 'LeadershipIntel-content-check' }
    })
    const body = await response.text()
    return { path, url, ...classify({ status: response.status, body }, thresholds) }
  } catch (err) {
    // Network error or timeout — a different failure class from a page that
    // responded but rendered nothing.
    return {
      path,
      url,
      ok: false,
      class: 'UNREACHABLE',
      detail: String((err && err.message) || err)
    }
  }
}

function renderReport(host, thresholds, results) {
  const failures = results.filter(r => !r.ok)
  const unreachable = failures.filter(r => r.class === 'UNREACHABLE').length
  const emptyRender = failures.filter(r => r.class === 'EMPTY_RENDER').length
  return [
    `Host: ${host}`,
    `Thresholds: rendered >= ${thresholds.minRenderedChars} chars, ` +
      `layout elements >= ${thresholds.minChromeElements}, non-empty <title>`,
    '',
    '| Page | Result | HTTP | Rendered | Chrome | Detail |',
    '|---|---|---|---|---|---|',
    ...results.map(
      r =>
        `| \`${r.path}\` | ${r.class} | ${r.status || '-'} | ` +
        `${r.rendered === undefined ? '-' : r.rendered} | ` +
        `${r.chrome === undefined ? '-' : r.chrome} | ${r.detail || ''} |`
    ),
    '',
    `Unreachable: ${unreachable} · Empty render: ${emptyRender} · OK: ${results.length - failures.length}`
  ].join('\n')
}

async function main() {
  const host = String(process.env.CONTENT_CHECK_HOST || '').replace(/\/+$/, '')
  const pages = parsePages(process.env.CONTENT_CHECK_PAGES)
  const thresholds = {
    minRenderedChars: Number(process.env.CONTENT_CHECK_MIN_RENDERED_CHARS || 3000),
    minChromeElements: Number(process.env.CONTENT_CHECK_MIN_CHROME_ELEMENTS || 2)
  }
  const timeoutMs = Number(process.env.CONTENT_CHECK_TIMEOUT_MS || 20000)
  const resultFile = process.env.CONTENT_CHECK_RESULT_FILE || 'content-check-result.json'

  if (!host || pages.length === 0) {
    console.error('CONTENT_CHECK_HOST and CONTENT_CHECK_PAGES are required')
    process.exit(2)
  }

  const results = []
  for (const page of pages) {
    results.push(await checkPage(host, page, thresholds, timeoutMs))
  }

  const report = renderReport(host, thresholds, results)
  console.log(report)

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Content check\n\n${report}\n`)
  }

  const failures = results.filter(r => !r.ok)
  fs.writeFileSync(
    resultFile,
    JSON.stringify(
      {
        result: failures.length ? 'fail' : 'pass',
        host,
        checkedAt: new Date().toISOString(),
        thresholds,
        counts: {
          ok: results.length - failures.length,
          unreachable: failures.filter(r => r.class === 'UNREACHABLE').length,
          emptyRender: failures.filter(r => r.class === 'EMPTY_RENDER').length
        },
        results
      },
      null,
      2
    )
  )

  process.exit(failures.length ? 1 : 0)
}

module.exports = {
  renderedRegion,
  titleOf,
  countChrome,
  classify,
  parsePages,
  renderReport
}

if (require.main === module) {
  main()
}
