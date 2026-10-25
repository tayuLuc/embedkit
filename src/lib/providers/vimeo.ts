import { hostRouter, segments } from '../url.ts';
import { buildEmbedUrl } from '../build.ts';
import type { EmbedHtml, ParsedRef } from '../types.ts';

const NUM_ID = /^\d+$/;

/** vimeo.com/123456789 · player.vimeo.com/video/123456789 */
export const parseVimeo = hostRouter({
  'vimeo.com': (url) => {
    const segs = segments(url);
    if (segs.length === 1 && NUM_ID.test(segs[0]))
      return { contentId: segs[0], contentType: 'video' };
    return null;
  },
  'player.vimeo.com': (url) => {
    const segs = segments(url);
    if (segs[0] === 'video' && NUM_ID.test(segs[1] ?? ''))
      return { contentId: segs[1], contentType: 'video' };
    return null;
  },
});

export interface VimeoOptions {
  autoplay?: boolean;
  loop?: boolean;
  mute?: boolean;
  controls?: boolean;
  title?: boolean;
  byline?: boolean;
  portrait?: boolean;
  start?: string; // seconds; serialized as #t=Ns hash
  transparent?: boolean;
  dnt?: boolean; // do not track
  playsinline?: boolean;
}

const KEYS = {
  autoplay: 'autoplay',
  loop: 'loop',
  mute: 'muted',
  controls: 'controls',
  title: 'title',
  byline: 'byline',
  portrait: 'portrait',
  transparent: 'transparent',
  dnt: 'dnt',
  playsinline: 'playsinline',
} as const;

const DEFAULTS: Record<string, string | number | boolean> = {
  autoplay: false,
  loop: false,
  mute: false,
  controls: true,
  title: true,
  byline: true,
  portrait: true,
  transparent: true,
  dnt: false,
  playsinline: true,
};

export function buildVimeo(ref: ParsedRef, opts: VimeoOptions): EmbedHtml {
  const params: Record<string, string | number | boolean | undefined> = { ...opts };
  delete params.start;
  const start = Number(opts.start ?? 0);
  const src = buildEmbedUrl({
    baseUrl: `https://player.vimeo.com/video/${ref.contentId}`,
    keys: KEYS,
    defaults: DEFAULTS,
    params,
  });
  const final = start > 0 ? `${src}#t=${start}s` : src;
  return { src: final, attrs: { title: 'Vimeo video', allowfullscreen: true } };
}

export function vimeoEmbedCode(html: EmbedHtml, width = 640, height = 360): string {
  const attrs = Object.entries({
    width: String(width),
    height: String(height),
    src: html.src,
    title: html.attrs.title,
    frameborder: '0',
    allow: 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media',
    allowfullscreen: true,
  })
    .map(([k, v]) => (v === true ? k : `${k}="${v}"`))
    .join(' ');
  return `<iframe ${attrs}></iframe>`;
}
