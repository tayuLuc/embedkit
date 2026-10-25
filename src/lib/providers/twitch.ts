import { toUrl, hostRouter, segments } from '../url.ts';
import { buildEmbedUrl } from '../build.ts';
import type { EmbedHtml, ParsedRef, ContentType } from '../types.ts';

const RESERVED = new Set(['login', 'signup', 'directory', 'downloads', 'jobs', 'turbo', 'clips', 'collections']);
const CHANNEL = /^[a-z0-9_]{1,30}$/i;

/**
 * twitch.tv/<channel> · twitch.tv/videos/<id> · twitch.tv/collection/<id>
 * twitch.tv/<channel>/clip/<id> · clips.twitch.tv/embed/<id>
 * bare channel names accepted (no dots, not reserved).
 */
export function parseTwitch(raw: string): ParsedRef | null {
  const isUrl = /\//.test(raw) || /^https?:\/\//i.test(raw);
  if (isUrl) {
    const url = toUrl(raw);
    if (!url) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host === 'clips.twitch.tv') {
      const segs = segments(url);
      const id = segs[0] === 'embed' ? segs[1] : segs[0];
      return id ? { contentId: id, contentType: 'clip' } : null;
    }
    if (host !== 'twitch.tv') return null;
    const segs = segments(url);
    if (segs.length === 1 && !RESERVED.has(segs[0].toLowerCase()))
      return CHANNEL.test(segs[0]) ? { contentId: segs[0], contentType: 'channel' } : null;
    if (segs[0] === 'videos' && /^\d+$/.test(segs[1] ?? ''))
      return { contentId: segs[1], contentType: 'video' };
    if (segs[0] === 'collections' && segs[1])
      return { contentId: segs[1], contentType: 'collection' };
    if (segs[0] === 'collection' && segs[1])
      return { contentId: segs[1], contentType: 'collection' };
    if (segs.length === 3 && segs[1] === 'clip' && segs[2])
      return { contentId: segs[2], contentType: 'clip' };
    return null;
  }
  const bare = raw.trim();
  return CHANNEL.test(bare) && !RESERVED.has(bare.toLowerCase())
    ? { contentId: bare, contentType: 'channel' }
    : null;
}

export interface TwitchOptions {
  parent: string;
  autoplay?: boolean;
  mute?: boolean;
  start?: string;
}

const BASE: Partial<Record<ContentType, string>> = {
  channel: 'https://player.twitch.tv',
  video: 'https://player.twitch.tv',
  collection: 'https://player.twitch.tv',
  clip: 'https://clips.twitch.tv/embed',
  chat: 'https://www.twitch.tv/embed',
};

export function buildTwitch(ref: ParsedRef, opts: TwitchOptions): EmbedHtml {
  const baseUrl = BASE[ref.contentType] ?? BASE.channel!;
  const contentKey =
    ref.contentType === 'clip' ? 'clip' : ref.contentType === 'chat' ? 'channel' : ref.contentType;
  const src = buildEmbedUrl({
    baseUrl,
    keys: { content: contentKey, parent: 'parent', autoplay: 'autoplay', mute: 'muted', start: 't' },
    defaults: { autoplay: false, mute: false, start: '' },
    params: { content: ref.contentId, parent: opts.parent, autoplay: opts.autoplay, mute: opts.mute, start: opts.start },
  });
  return { src, attrs: { title: 'Twitch stream', allowfullscreen: true } };
}

export function twitchEmbedCode(html: EmbedHtml, width = 620, height = 340): string {
  const attrs = Object.entries({
    width: String(width),
    height: String(height),
    src: html.src,
    title: html.attrs.title,
    frameborder: '0',
    allowfullscreen: true,
    scrolling: 'no',
  })
    .map(([k, v]) => (v === true ? k : `${k}="${v}"`))
    .join(' ');
  return `<iframe ${attrs}></iframe>`;
}
