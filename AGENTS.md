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
