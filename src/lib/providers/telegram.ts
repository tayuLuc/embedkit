import { toUrl } from '../url.ts';
import type { EmbedHtml, ParsedRef } from '../types.ts';

const POST = /^\/(?:s\/)?([A-Za-z][A-Za-z0-9_\-.]{4,31})\/(\d+)(?:\/\d+)?$/;
const CHANNEL_URL = /^https:\/\/t\.me\/(?:s\/)?([A-Za-z][A-Za-z0-9_\-.]{4,31})\/(\d+)(?:\/\d+)?$/;
const CHANNEL_LIVE = /^https:\/\/t\.me\/s\/([A-Za-z][A-Za-z0-9_\-.]{4,31})$/;
const ARROW = /^https:\/\/t\.me\/([A-Za-z][A-Za-z0-9_\-.]{4,31})\/(\d+)\?embed=4$/;

/**
 * Recognized forms (official widget targets):
 *  t.me/<channel>/<id> · t.me/s/<channel>/<id> (with ?embed=4 / /link)
 *  https://t.me/s/<channel> (live channel stream)
 */
export function parseTelegram(raw: string): ParsedRef | null {
  const s = raw.trim();
  let m = ARROW.exec(s);
  if (m) return { contentId: `${m[1]}/${m[2]}`, contentType: 'video' };
  m = CHANNEL_URL.exec(s);
  if (m) {
    const tail = s.slice(s.indexOf(`/${m[1]}/`) + m[1].length + 2);
    const multi = /^\/\d+/.test(tail) ? { contentId: `${m[1]}/${m[2]}/${/\d+/.exec(tail)![0]}`, contentType: 'video' as const } : null;
    return multi ?? { contentId: `${m[1]}/${m[2]}`, contentType: 'video' };
  }
  m = CHANNEL_LIVE.exec(s);
  if (m) return { contentId: m[1], contentType: 'channel' };
  const asPath = POST.exec('/' + s.replace(/^https?:\/\/t\.me\//, '').replace(/^t\.me\//, ''));
  if (asPath) return { contentId: `${asPath[1]}/${asPath[2]}`, contentType: 'video' };
  return null;
}

export interface TelegramOptions {
  mode: 'post' | 'channel';
  dark?: boolean;
  grow?: boolean;
}

const WIDGET = 'https://telegram.org/js/telegram-widget.js?22';

/**
 * Telegram embed = blockquote + widget script (their official form).
 * The widget script replaces the blockquote at page runtime.
 */
export function buildTelegram(ref: ParsedRef, opts: TelegramOptions): EmbedHtml {
  if (opts.mode === 'channel' || ref.contentType === 'channel') {
    const id = (ref.contentId.split('/')[0] ?? ref.contentId).replace(/^@/, '');
    return {
      src: `https://t.me/s/${id}`,
      attrs: { title: `Telegram channel @${id}`, channel: id },
    };
  }
  const [ch, msg] = ref.contentId.split('/');
  return {
    src: `https://t.me/${ch}/${msg}?embed=4`,
    attrs: { title: `Telegram post by @${ch}`, channel: ch, message: msg },
  };
}

export function telegramEmbedCode(html: EmbedHtml, opts: TelegramOptions): string {
  const dark = opts.dark ? ' data-theme="dark"' : '';
  const grow = opts.grow ? ' data-grow="text"' : '';
  if (opts.mode === 'channel' || html.attrs.channel) {
    if (html.attrs.message) {
      return `<blockquote class="telegram-embed" data-url="${html.src}"${dark}${grow}></blockquote>\n<script async src="${WIDGET}"></script>`;
    }
    return `<script async src="${WIDGET}" data-telegram-embed="1" data-url="${html.src}" data-height="400"${dark}${grow}></script>`;
  }
  return html.src;
}
