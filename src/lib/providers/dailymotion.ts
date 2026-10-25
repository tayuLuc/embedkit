import { hostRouter, segments } from '../url.ts';
import { buildEmbedUrl } from '../build.ts';
import type { EmbedHtml, ParsedRef } from '../types.ts';

const DM_ID = /^[a-z0-9]{5,}$/i;

/** dailymotion.com/video/x8m5kp9 · dai.ly/x8m5kp9 · /embed/video/<id> */
export const parseDailymotion = hostRouter({
  'dailymotion.com': (url) => {
    const segs = segments(url);
    if (segs[0] === 'video' && DM_ID.test(segs[1] ?? '')) return { contentId: segs[1], contentType: 'video' };
    if (segs[0] === 'embed' && segs[1] === 'video' && DM_ID.test(segs[2] ?? '')) return { contentId: segs[2], contentType: 'video' };
    return null;
  },
  'dai.ly': (url) => {
    const segs = segments(url);
    return DM_ID.test(segs[0] ?? '') ? { contentId: segs[0], contentType: 'video' } : null;
  },
});

export interface DailymotionOptions {
  autoplay?: boolean;
  loop?: boolean;
  mute?: boolean;
  controls?: boolean;
  hd?: boolean;
  uiHighlight?: string; // hex without #
  start?: string;
}

const KEYS = {
  autoplay: 'autoplay',
  loop: 'loop',
  mute: 'mute',
  controls: 'controls',
  hd: 'hd',
  uiHighlight: 'ui-highlight',
  start: 'start',
} as const;

const DEFAULTS: Record<string, string | number | boolean> = {
  autoplay: false,
  loop: false,
  mute: false,
  controls: true,
  hd: true,
  uiHighlight: '',
  start: 0,
};

export function buildDailymotion(ref: ParsedRef, opts: DailymotionOptions): EmbedHtml {
  const params: Record<string, string | number | boolean | undefined> = { ...opts };
  const src = buildEmbedUrl({
    baseUrl: `https://www.dailymotion.com/embed/video/${ref.contentId}`,
    keys: KEYS,
    defaults: DEFAULTS,
    params,
  });
  return { src, attrs: { title: 'Dailymotion video', allowfullscreen: true } };
}

export function dailymotionEmbedCode(html: EmbedHtml, width = 560, height = 315): string {
  const attrs = Object.entries({
    width: String(width),
    height: String(height),
    src: html.src,
    title: html.attrs.title,
    frameborder: '0',
    allow: 'autoplay; fullscreen; encrypted-media; picture-in-picture',
    allowfullscreen: true,
  })
    .map(([k, v]) => (v === true ? k : `${k}="${v}"`))
    .join(' ');
  return `<iframe ${attrs}></iframe>`;
}
