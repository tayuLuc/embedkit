import { hostRouter, segments } from '../url.ts';
import { buildEmbedUrl } from '../build.ts';
import type { EmbedHtml, ParsedRef } from '../types.ts';

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

function video(id: string): ParsedRef | null {
  return YT_ID.test(id) ? { contentId: id, contentType: 'video' } : null;
}

const playlistOf = (url: URL): ParsedRef | null => {
  const pl = url.searchParams.get('list');
  return pl ? { contentId: pl, contentType: 'collection' } : null;
};

/**
 * Recognized forms (documented public player formats):
 *  youtube.com/watch?v=ID  youtube.com/shorts/ID  youtube.com/v/ID
 *  youtube.com/embed/ID    youtube.com/playlist?list=ID
 *  youtu.be/ID             (playlist via &list=)
 */
export const parseYouTube = hostRouter({
  'youtube.com': (url) => {
    const segs = segments(url);
    const v = url.searchParams.get('v');
    if (v) return video(v) ?? playlistOf(url);
    if (segs[0] === 'shorts' || segs[0] === 'v' || segs[0] === 'embed')
      return video(segs[1] ?? '');
    if (segs[0] === 'playlist') return playlistOf(url);
    return null;
  },
  'youtube-nocookie.com': (url) => {
    const segs = segments(url);
    if (segs[0] === 'embed') return video(segs[1] ?? '');
    return null;
  },
  'youtu.be': (url) => {
    const segs = segments(url);
    return video(segs[0] ?? '') ?? playlistOf(url);
  },
});

export interface YouTubeOptions {
  autoplay?: boolean;
  mute?: boolean;
  loop?: boolean;
  start?: string; // seconds or mm:ss
  end?: string;
  controls?: boolean;
  rel?: boolean; // show related
  cc?: boolean; // captions on
  fs?: boolean; // fullscreen button
  playsinline?: boolean;
  hl?: string; // player UI language
  list?: string;
}

const KEYS = {
  autoplay: 'autoplay',
  mute: 'mute',
  loop: 'loop',
  start: 'start',
  end: 'end',
  controls: 'controls',
  rel: 'rel',
  cc: 'cc_load_policy',
  fs: 'fs',
  playsinline: 'playsinline',
  hl: 'hl',
  list: 'list',
} as const;

const DEFAULTS: Record<string, string | number | boolean> = {
  autoplay: false,
  mute: false,
  loop: false,
  start: 0,
  end: 0,
  controls: true,
  rel: true,
  cc: false,
  fs: true,
  playsinline: false,
  hl: '',
  list: '',
};

export function buildYouTube(
  ref: ParsedRef,
  opts: YouTubeOptions,
): EmbedHtml {
  const host = 'https://www.youtube.com';
  const params: Record<string, string | number | boolean | undefined> = {};
  for (const key of Object.keys(KEYS) as (keyof typeof KEYS)[]) {
    params[key] = opts[key] as string | number | boolean | undefined;
  }
  if (ref.contentType === 'collection') {
    // playlist embeds use /embed/videoseries?list=ID
    const src = buildEmbedUrl({
      baseUrl: `${host}/embed/videoseries`,
      keys: KEYS,
      defaults: { ...DEFAULTS, list: '' },
      params: { ...params, list: ref.contentId, controls: opts.controls },
    });
    return { src, attrs: { title: 'YouTube playlist', allowfullscreen: true } };
  }
  const src = buildEmbedUrl({
    baseUrl: `${host}/embed/${ref.contentId}`,
    keys: KEYS,
    defaults: DEFAULTS,
    params,
  });
  return { src, attrs: { title: 'YouTube video', allowfullscreen: true } };
}

/** Full copy-paste iframe string. */
export function youtubeEmbedCode(html: EmbedHtml, width = 560, height = 315): string {
  const attrs = Object.entries({
    width: String(width),
    height: String(height),
    src: html.src,
    title: html.attrs.title,
    frameborder: '0',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    allowfullscreen: true,
  })
    .map(([k, v]) => (v === true ? k : `${k}="${v}"`))
    .join(' ');
  return `<iframe ${attrs}></iframe>`;
}

