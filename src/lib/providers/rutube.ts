import { hostRouter, segments } from '../url.ts';
import { buildEmbedUrl } from '../build.ts';
import type { EmbedHtml, ParsedRef } from '../types.ts';

const ID = /^[0-9a-f]{32}$/i;

/** rutube.com/video/<slug>/<id> · rutube.com/video/embed/<id> */
export const parseRutube = hostRouter({
  'rutube.com': (url) => {
    const segs = segments(url);
    let id = segs.find((s) => ID.test(s));
    if (!id) {
      const slug = segs.find((s) => s.includes('-') && ID.test(s.slice(s.lastIndexOf('-') + 1)));
      if (slug) id = slug.slice(slug.lastIndexOf('-') + 1);
    }
    return id ? { contentId: id, contentType: 'video' } : null;
  },
});

export interface RutubeOptions {
  autoplay?: boolean;
  showSeries?: boolean;
}

const KEYS = { autoplay: 'autoplay', showSeries: 'series' } as const;

const DEFAULTS: Record<string, string | number | boolean> = {
  autoplay: false,
  showSeries: false,
};

export function buildRutube(ref: ParsedRef, opts: RutubeOptions): EmbedHtml {
  const src = buildEmbedUrl({
    baseUrl: `https://rutube.com/video/embed/${ref.contentId}`,
    keys: KEYS,
    defaults: DEFAULTS,
    params: { ...opts },
  });
  return { src, attrs: { title: 'Rutube video', allowfullscreen: true } };
}

export function rutubeEmbedCode(html: EmbedHtml, width = 720, height = 405): string {
  const attrs = Object.entries({
    width: String(width),
    height: String(height),
    src: html.src,
    title: html.attrs.title,
    frameborder: '0',
    allow: 'autoplay; fullscreen; encrypted-media; picture-in-picture; geolocation',
    allowfullscreen: true,
    scrolling: 'no',
  })
    .map(([k, v]) => (v === true ? k : `${k}="${v}"`))
    .join(' ');
  return `<iframe ${attrs} allowtransparency></iframe>`;
}
