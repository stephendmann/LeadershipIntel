/* eslint-disable react/no-unknown-property */
/**
 * Styles scoped to the Next theme only.
 * Note: Tailwind @apply syntax is NOT supported here.
 */
const Style = () => {
  return (
    <style jsx global>{`
      /* ─── Brand CSS Variables ─────────────────────────────── */
      :root {
        --brand-teal: #005577;
        --charcoal:   #1b263b;
        --bg:         #f5f6f5;
        --steel:      #778da9;
        --border:     rgba(0, 85, 119, 0.12);
      }

      /* ─── Body background ────────────────────────────────── */
      body {
        background-color: var(--bg);
        color: var(--charcoal);
      }
      .dark body {
        background-color: #000;
      }

      /* ─── Nav menu links: hover uses brand teal ──────────── */
      #theme-next .menu-link {
        text-decoration: none;
        background-image: linear-gradient(var(--brand-teal), var(--brand-teal));
        background-repeat: no-repeat;
        background-position: bottom center;
        background-size: 0 2px;
        transition: background-size 100ms ease-in-out;
      }
      #theme-next .menu-link:hover {
        background-size: 100% 2px;
        color: var(--brand-teal);
      }

      /* ─── Post title headings: charcoal, hover teal ─────── */
      #theme-next .notion-title,
      #theme-next .notion-h1,
      #theme-next .notion-h2,
      #theme-next .notion-h3 {
        color: var(--charcoal);
        transition: color 0.2s;
      }
      #theme-next .notion-h1:hover,
      #theme-next .notion-h2:hover,
      #theme-next .notion-h3:hover {
        color: var(--brand-teal);
      }

      /* ─── Meta text (category / date): steel ────────────── */
      #theme-next .article-meta,
      #theme-next .post-meta {
        color: var(--steel);
      }

      /* ─── Article Details button: teal, uppercase, semibold, square ── */
      #theme-next .btn-article-detail {
        background: var(--brand-teal);
        color: #fff;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        border-radius: 0;
        border: none;
        padding: 0.625rem 1.25rem;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background 0.2s;
      }
      #theme-next .btn-article-detail:hover {
        background: #003f5a;
      }

      /* ─── Logo: white bg, teal title, subtle teal border ─── */
      #theme-next .logo {
        background: #fff;
        border-bottom: 2px solid var(--border);
        padding-bottom: 1rem;
      }
      .dark #theme-next .logo {
        background: transparent;
        border-bottom-color: rgba(255, 255, 255, 0.08);
      }

      /* ─── TopNav mobile bar: dark navy + teal-tinted border ─ */
      #theme-next #sticky-nav > div:first-child {
        background-color: var(--charcoal);
        border-bottom: 1px solid rgba(0, 85, 119, 0.2);
      }

      /* ═══════════════════════════════════════════════════════
         Typography system
         H1              → Inter Bold (700)
         Primary body    → Inter SemiBold (600)
         Taglines/quotes → Merriweather Italic (400)
         ═══════════════════════════════════════════════════════ */

      /* ─── H1: Inter Bold ─────────────────────────────────── */
      #theme-next .notion-h1,
      #theme-next .notion-title,
      #theme-next h1 {
        font-family: 'Inter', sans-serif;
        font-weight: 700;
        letter-spacing: -0.02em;
      }

      /* ─── H2 / H3: Inter SemiBold ───────────────────────── */
      #theme-next .notion-h2,
      #theme-next .notion-h3,
      #theme-next h2,
      #theme-next h3 {
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        letter-spacing: -0.01em;
      }

      /* ─── Primary body: Inter SemiBold ──────────────────── */
      #theme-next #article-wrapper .notion-text,
      #theme-next #article-wrapper p,
      #theme-next #article-wrapper li {
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        line-height: 1.75;
      }

      /* ─── Taglines & quotes: Merriweather Italic ─────────── */
      #theme-next .notion-quote,
      #theme-next blockquote,
      #theme-next .notion-callout {
        font-family: 'Merriweather', Georgia, serif;
        font-style: italic;
        font-weight: 400;
        line-height: 1.8;
      }
    `}</style>
  )
}

export { Style }
