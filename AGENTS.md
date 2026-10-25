# Project rules

- Never mention the site studied as a functional reference — not in code, comments, README,
  commits, or CI. The research artifacts live outside this repo only.
- i18n: en + ru, strings colocated with pages.
- Providers are pure TS modules (parse + build), no framework in the island code.
- Scope is MEDIA embeds only: video + audio (YouTube, Vimeo, Twitch,
  Dailymotion, TikTok, Spotify). Maps, images, docs, social posts are out of
  product scope (operator ruling 26.10).
- Page frontmatter reads locale from `Astro.params.locale`, never from props
  (static render delivers props unreliably; layout derives route from
  `Astro.url`). Layout takes only title/description.
- No SEO content layer: no how-to/FAQ copy blocks, no generated landing text.
  Tool pages ship tool + meta tags only. The technical layer (titles,
  descriptions, canonical/hreflang, sitemap) is the full extent — operator
  ruling 26.10, `src/i18n/seo.json` deleted, do not recreate.
- No domain registration: hosting is <user>.github.io/<repo> (operator ruling
  25.10); Pages-specific traps (Twitch parent, .github.io indexing) are
  accepted consequences, not bugs to fix.
- The YouTube page carries an FAQ/how-to section (pre-ruling deploy). It is the
  single accepted exception: leave it, do not replicate it on other pages, do
  not cite it as precedent for new pages.
