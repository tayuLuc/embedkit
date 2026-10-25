# EmbedKit SEO plan

Scope: en + ru, five providers, GitHub Pages (no server redirects).

## Structure

- Landing `/[locale]/` — hub, links to all generators.
- Generator pages `/[locale]/generator/<provider>/` — tool above the fold,
  SEO copy below: h1, lead, "how to embed" 3 steps, options glossary,
  supported URL list, FAQ.
- Provider list = single source of truth in `src/lib/providers.ts`;
  copy lives in `src/i18n/<provider>.{en,ru}.json`.

## On-page rules

- One h1, one canonical, hreflang pairs, `og:` tags, JSON-LD `FAQPage` on
  generator pages (only real Q/A written there, nothing invented).
- Supported-URL list rendered from provider parser table, not typed.
- Internal links: footer + hub list, exact anchors (`YouTube embed code generator`).
- Sitemap auto (astro/sitemap), robots.txt allows all.

## Copy rules

- Headings contain the keyword in natural form ("YouTube embed code
  generator"); body must not stuff — 3–6 occurrences of exact phrase per page.
- ru copy is written natively, not machine-translated (operator is native).
- Page descriptions <= 155 chars, unique per page.

## Scope

Media only: video (YouTube, Vimeo, Twitch, Dailymotion, TikTok) + audio
(Spotify; TED/SoundCloud/Simplecast as candidates). Maps/images
docs are out of product scope (operator ruling 26.10).

## Not doing

- No 88-locale machine translation (Pages, free plan, no traffic budget).
- No AI content farm pages; every page ships a working tool.
- No blog until after providers are done.
