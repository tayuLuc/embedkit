import { hostRouter, segments } from '../url.ts';
import { buildEmbedUrl } from '../build.ts';
import type { EmbedHtml, ParsedRef } from '../types.ts';

const VID = /^(-?\d{5,})_(\d{5,})$/;
const NUM = /^-?\d+$/;

/**
 * vk.com/video-1522384574_109557731 · vkvideo.ru/video-<oid>_<vid>[?hash=…] ·
 * vk.com/video_ext.php?oid=&id=[&hash=]  (hash is verbatim from the input, never derived)
 */
export const parseVK = hostRouter({
  'vk.com': (url) => {
    const segs = segments(url);
    const video = segs[0] ?? '';
    if (video === 'video_ext.php') {
      const oid = url.searchParams.get('oid');
      const id = url.searchParams.get('id');
      if (!oid || !NUM.test(oid) || !NUM.test(id ?? '')) return null;
      const hash = url.searchParams.get('hash');
      return { contentId: hash ? `${oid}|${id}|${hash}` : `${oid}|${id}`, contentType: 'video' };
    }
    const m = video.startsWith('video') ? VID.exec(video.slice(5)) : null;
    if (m) {
      const [, oid, id] = m;
      const hash = url.searchParams.get('hash');
      return { contentId: hash ? `${oid}|${id}|${hash}` : `${oid}|${id}`, contentType: 'video' };
    }
    return null;
  },
  'vkvideo.ru': (url) => {
    const video = segments(url)[0] ?? '';
    const m = video.startsWith('video') ? VID.exec(video.slice(5)) : null;
    if (!m) return null;
    const [, oid, id] = m;
    const hash = url.searchParams.get('hash');
    return { contentId: hash ? `${oid}|${id}|${hash}` : `${oid}|${id}`, contentType: 'video' };
  },
});

export interface VKOptions {
  autoplay?: boolean;
  hd?: boolean;
}

export function buildVK(ref: ParsedRef, opts: VKOptions): EmbedHtml {
  const [oid, id, hash] = ref.contentId.split('|');
  const params: Record<string, string | number | boolean | undefined> = {
    autoplay: opts.autoplay,
    hd: opts.hd === false ? undefined : 2,
    oid,
    id,
  };
  if (hash) params.hash = hash;
  const src = buildEmbedUrl({
    baseUrl: 'https://vk.com/video_ext.php',
    keys: { autoplay: 'autoplay', hd: 'hd', oid: 'oid', id: 'id', hash: 'hash' },
    defaults: { autoplay: false },
    params,
  });
  return { src, attrs: { title: 'VK Video', allowfullscreen: true } };
}

export function vkEmbedCode(html: EmbedHtml, width = 640, height = 360): string {
  const attrs = Object.entries({
    width: String(width),
    height: String(height),
    src: html.src,
    title: html.attrs.title,
    frameborder: '0',
    allow: 'autoplay; fullscreen; encrypted-media; picture-in-picture; geolocation',
    allowfullscreen: true,
  })
    .map(([k, v]) => (v === true ? k : `${k}="${v}"`))
    .join(' ');
  return `<iframe ${attrs}></iframe>`;
}
