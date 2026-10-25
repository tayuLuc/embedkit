---
title: Astro static + GitHub Pages — ловушки
created: 2026-10-26
tags: [astro, gh-pages, static, web]
links: ["[[embedkit-embedtube-static]]"]
---

# Astro 7 static + GitHub Pages playbook

Из практики EmbedKit (repo embedkit, 26.10). Полный статус проекта: [[embedkit-embedtube-static]] (обновление заметки — pending write, запись в vault отклонена оператором, держать здесь).

## Ловушки, подтверждённые в проде

- **Query-параметры не доходят до статики**: Pages отдаёт файл по пути, `Astro.url.searchParams` при SSR = пусто. Режимы (mode/theme) — только отдельными роутами (`/x/channel/`), не `?mode=`. Каноника per-route — пропом в layout.
- **Props ненадёжны при static render**: locale из `Astro.params.locale`, route из `Astro.url.pathname`; layout принимает только title/description (+canonicalPath). Пустые строковые props схлопываются в атрибутах → `undefined` в href'ах.
- **`import.meta.env.BASE_URL` нет в frontmatter layout** — хардкод-фолбэк.
- **trailingSlash 'never'**: относительные ссылки с `?query` дают 301-циклы; всегда base-префиксные абсолютные.
- **telemetry EPERM в песочнице**: ASTRO_TELEMETRY_DISABLED=1 через cross-env в pretest/check/build (config-фолбэк не покрывает CLI notify).
- **Twitch parent**: pages.github.io в allowlist; parent обязателен в коде.
- **Dailymotion legacy /embed/video 301 → geo.dailymotion** (curl 403 без UA; браузер доигрывает).
- **TikTok**: официальный embed = blockquote + embed.js, прямой iframe 503-рейт-лимит.
- **SoundCloud w.soundcloud/player 404, Mixcloud 403** — публичных iframe-виджетов нет, не брать.
- **Google demotes .github.io** (патч 2024-2025 не снят) — SEO-амбиции на Pages мертвы, инструмент важнее.

## Agents-волна (3 параллельных агента, один tree)

- Агенты не коммитят; оркестратор лендит по одному агента в коммит (providers → polish → pwa), полный suite на лендинг.
- Общие файлы (layout, island-реестр, index-list) = точки конфликтов: append-only правки, правки оркестратора поверх.
- Тесты агента — spec, когда парсер: тесты проверяют интент входа (парсинг ссылок); truth-table сборщика — решение, не spec (buildEmbedUrl дропает default-значимые параметры; «hd=2 по умолчанию, отсутствует when off» не выражается без явного params.hd).
- self-report агента о зелёном suite = claim: перепрогон на лендинге; 2 агента, пишущие в один shared-файл, гарантированно конфликтуют (один пишет, второй перечитывает).
