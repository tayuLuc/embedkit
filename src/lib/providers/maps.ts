import { toUrl } from '../url.ts';
import type { EmbedHtml, ParsedRef } from '../types.ts';

/** Google Maps share links carry the map state in ?pb= (base64-ish blob). */
export function parseMaps(raw: string): ParsedRef | null {
  const url = toUrl(raw);
  if (!url) return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const allowed = new Set(['maps.google.com', 'google.com', 'maps.app', 'goo.gl', 'maps.google.ru']);
  if (!allowed.has(host)) return null;
  if (host === 'maps.app' || host === 'goo.gl') {
    // Short link: the pb blob lives behind a redirect, not resolvable
    // client-side (CORS). Ask the user to open it once and paste the full URL.
    return { contentId: url.toString(), contentType: 'shortlink' };
  }
  const pb = url.searchParams.get('pb');
  if (pb) return { contentId: pb, contentType: 'video' };
  // /maps/place/... links: pb sits in the !-mini-language path, take the raw path
  if (host === 'google.com' && url.pathname.startsWith('/maps')) {
    const pbFromPath = url.pathname.match(/(data=[^?]+)/)?.[1];
    if (pbFromPath) return { contentId: pbFromPath.replace(/^data=/, ''), contentType: 'video' };
    return { contentId: '', contentType: 'video' };
  }
  return null;
}

export interface MapsOptions {
  width?: number;
  height?: number;
}

export function buildMaps(ref: ParsedRef, opts: MapsOptions): EmbedHtml {
  const w = opts.width ?? 600;
  const h = opts.height ?? 450;
  if (ref.contentType === 'shortlink') {
    return { src: '', attrs: { title: 'Google Maps', width: String(w), height: String(h) } };
  }
  const src = `https://www.google.com/maps/embed?pb=${ref.contentId}`;
  return { src, attrs: { title: 'Google Maps', width: String(w), height: String(h), style: 'border:0', loading: 'lazy', allowfullscreen: true, referrerpolicy: 'no-referrer-when-downgrade' } };
}

export function mapsEmbedCode(html: EmbedHtml): string {
  if (!html.src) return '';
  const attrs = Object.entries({
    src: html.src,
    title: html.attrs.title,
    width: html.attrs.width,
    height: html.attrs.height,
    style: html.attrs.style,
    'loading': 'lazy',
    allowfullscreen: true,
    referrerpolicy: 'no-referrer-when-downgrade',
  })
    .map(([k, v]) => (v === true ? k : `${k}="${v}"`))
    .join(' ');
  return `<iframe ${attrs}></iframe>`;
}
