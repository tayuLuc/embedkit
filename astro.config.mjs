import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Pages lives under /embedkit in the account's github.io site.
const site = process.env.SITE_ORIGIN ?? 'https://tayuluc.github.io';
const base = `/${(process.env.REPO_NAME ?? 'embedkit').replace(/^\/+|\/+$/g, '')}`;

export default defineConfig({
  telemetry: { enabled: false },
  site,
  base,
  trailingSlash: 'never',
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  integrations: [sitemap()],
  i18n: {
    locales: ['en', 'ru'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: true },
  },
});
