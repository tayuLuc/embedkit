import { hostRouter, segments } from '../url.ts';
import type { EmbedHtml, ParsedRef } from '../types.ts';

const TT_ID = /^\d{17,19}$/;

/** tiktok.com/@user/video/123 · vm.tiktok.com/abc · tiktok.com/embed/v2/123 */
export const parseTikTok = hostRouter({
  'tiktok.com': (url) => {
    const segs = segments(url);
    const m = url.pathname.match(/\/@[\w.\-]+\/video\/(\d+)/);
    if (m && TT_ID.test(m[1])) return { contentId: m[1], contentType: 'video' };
    if (segs[0] === 'embed' && TT_ID.test(segs[segs.length - 1] ?? ''))
      return { contentId: segs[segs.length - 1], contentType: 'video' };
    return null;
  },
  'vm.tiktok.com': (url) => {
    const segs = segments(url);
    return segs[0] ? { contentId: segs[0], contentType: 'shortlink' } : null;
  },
});

export interface TikTokOptions {
  rel?: boolean;
}

/**
 * TikTok official embed is a blockquote + async SDK script (their iframe is
 * not stable for direct use). We emit the official blockquote form.
 */
export function buildTikTok(ref: ParsedRef, opts: TikTokOptions): EmbedHtml {
  if (ref.contentType === 'shortlink') {
    return {
      src: `https://vm.tiktok.com/${ref.contentId}/`,
      attrs: { title: 'TikTok video' },
    };
  }
  const rel = opts.rel === false ? '&rel=0' : '';
  return {
    src: `https://www.tiktok.com/embed/v2/${ref.contentId}${rel}`,
    attrs: { title: 'TikTok video' },
  };
}

export function tikTokEmbedCode(html: EmbedHtml): string {
  if (html.attrs.title === 'TikTok video' && html.src.includes('/embed/v2/')) {
    return [
      '<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@tiktok/video" data-video-id="' +
        /embed\/v2\/(\d+)/.exec(html.src)![1] +
        '" style="max-width: 605px;min-width: 325px">',
      '  <section><a target="_blank" href="' + html.src + '">Watch this video on TikTok</a></section>',
      '</blockquote>',
      '<script async src="https://www.tiktok.com/embed.js"></script>',
    ].join('\n');
  }
  return `<a href="${html.src}">${html.attrs.title}</a>`;
}
