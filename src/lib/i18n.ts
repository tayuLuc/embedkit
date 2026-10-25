export const meta = {
  name: 'embedkit',
  title: { en: 'EmbedKit', ru: 'EmbedKit' },
  tagline: {
    en: 'Free iframe embed code generator with live preview',
    ru: 'Бесплатный генератор iframe-кода с живым превью',
  },
};

export const locales = ['en', 'ru'] as const;
export type Locale = (typeof locales)[number];

export function t(locale: Locale, dict: Record<Locale, string>): string {
  return dict[locale] ?? dict.en;
}

export function localeAlternates(base: string, route: string): Record<string, string> {
  const href = (l: string) => `${base}/${l}${route}`;
  return {
    en: href('en'),
    ru: href('ru'),
    'x-default': href('en'),
  };
}
