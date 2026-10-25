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

export function localeAlternates(path: string): Record<string, string> {
  const site = 'https://tayuluc.github.io/embedkit';
  const rest = path.replace(/^\/(en|ru)/, '') || '/';
  return {
    en: `${site}/en${rest === '/' ? '' : rest}`,
    ru: `${site}/ru${rest === '/' ? '' : rest}`,
    'x-default': `${site}/en${rest === '/' ? '' : rest}`,
  };
}
