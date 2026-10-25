# EmbedKit

Генератор iframe-кода для встраивания видео: вставил ссылку → настроил плеер → скопировал код.
Всё считается в браузере, сервера нет. Статика на GitHub Pages.

## Development

Node >= 22.23.4, pnpm 11.

```sh
pnpm install
pnpm dev        # http://localhost:4321/embedkit/en/generator/youtube
pnpm test       # unit tests for parsers and URL builder
pnpm check      # types + astro diagnostics
pnpm build      # static output in dist/
```

## Providers

| Provider | State |
| --- | --- |
| YouTube (video, playlist, shorts, nocookie) | done |
| Vimeo | todo |
| Dailymotion | todo |
| Twitch | todo |
| TikTok | todo |

Adding a provider = one file in `src/lib/providers/<id>.ts` (parse + build), one page in
`src/pages/[locale]/generator/<id>.astro`, tests in `test/<id>.test.ts`.

## i18n

`en` + `ru`, routes `/en/...` and `/ru/...`, strings live next to their page.

## Deploy

Push to `main` → `deploy.yml` builds and publishes to GitHub Pages via
`actions/deploy-pages`. Repo settings → Pages → Source: **GitHub Actions**.
