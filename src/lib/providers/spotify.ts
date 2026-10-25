import { hostRouter, segments } from '../url.ts';
import { buildEmbedUrl } from '../build.ts';
import type { EmbedHtml, ParsedRef, ContentType } from '../types.ts';

const SPOTIFY_ID = /^[A-Za-z0-9]{22}$/;
const TYPE: Record<string, ContentType> = {
  track: 'track', album: 'album', playlist: 'playlist', artist: 'artist', episode: 'episode', show: 'show',
};

/** open.spotify.com/[intl-xx/]<type>/<id> · open.spotify.com/embed/... */
export const parseSpotify = hostRouter({
  'open.spotify.com': (url) => {
    const segs = segments(url).filter((s) => s !== 'embed' && !/^intl-[a-z]{2}$/.test(s));
    const type = segs[0];
    const id = segs[1];
    if (type && id && TYPE[type] && SPOTIFY_ID.test(id))
      return { contentId: id, contentType: TYPE[type] };
    return null;
  },
});

export interface SpotifyOptions {
  theme?: 'dark' | 'light';
  height?: number;
}

const HEIGHTS: Record<string, number> = {
  track: 152, episode: 152, album: 352, playlist: 352, artist: 352, show: 352,
};

export function buildSpotify(ref: ParsedRef, opts: SpotifyOptions): EmbedHtml {
  const src = buildEmbedUrl({
    baseUrl: `https://open.spotify.com/embed/${ref.contentType}/${ref.contentId}`,
    keys: { theme: 'theme' },
    defaults: { theme: 'dark' },
    params: { theme: opts.theme },
  });
  const height = opts.height ?? HEIGHTS[ref.contentType] ?? 152;
  return { src, attrs: { title: `Spotify ${ref.contentType}`, height: String(height), width: '100%', allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture', loading: 'lazy' } };
}

export function spotifyEmbedCode(html: EmbedHtml): string {
  const attrs = Object.entries({
    style: 'border-radius:12px',
    src: html.src,
    title: html.attrs.title,
    width: html.attrs.width,
    height: html.attrs.height,
    frameborder: '0',
    allow: html.attrs.allow,
    loading: 'lazy',
  })
    .map(([k, v]) => (v === true ? k : `${k}="${v}"`))
    .join(' ');
  return `<iframe ${attrs}></iframe>`;
}
