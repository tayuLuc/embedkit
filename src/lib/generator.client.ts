// Client island: vanilla TS, one engine per provider page.
import { toUrl } from './url';
import { parseYouTube, buildYouTube, youtubeEmbedCode, type YouTubeOptions } from './providers/youtube';
import { facadeSnippet } from './providers/youtube-facade';
import { parseVimeo, buildVimeo, vimeoEmbedCode, type VimeoOptions } from './providers/vimeo';
import { parseTwitch, buildTwitch, twitchEmbedCode, type TwitchOptions } from './providers/twitch';
import { parseDailymotion, buildDailymotion, dailymotionEmbedCode, type DailymotionOptions } from './providers/dailymotion';
import { parseTikTok, buildTikTok, tikTokEmbedCode, type TikTokOptions } from './providers/tiktok';
import { parseSpotify, buildSpotify, spotifyEmbedCode, type SpotifyOptions } from './providers/spotify';
import { parseTelegram, buildTelegram, telegramEmbedCode, type TelegramOptions } from './providers/telegram';
import { parseVK, buildVK, vkEmbedCode, type VKOptions } from './providers/vk';
import { parseRutube, buildRutube, rutubeEmbedCode, type RutubeOptions } from './providers/rutube';
import { timeToSeconds } from './build';

type Cbx = HTMLInputElement;

const SIZES: Record<string, number> = { '420': 420, '560': 560, '640': 640, '854': 854, '1280': 1280 };

function responsiveWrap(code: string): string {
  const frame = code.replace(/^<iframe/, '<iframe style="position:absolute;inset:0;width:100%;height:100%;border:0"');
  return `<div style="position:relative;padding-top:56.25%;height:0;overflow:hidden;max-width:100%">\n  ${frame}\n</div>`;
}

function mount(root: HTMLElement) {
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => root.querySelector(`#${id}`) as T;
  const urlInput = $<Cbx>('ek-url');
  const preview = $<HTMLElement>('ek-preview');
  const code = $<HTMLTextAreaElement>('ek-code');
  const status = $<HTMLElement>('ek-status');
  const copyBtn = $<HTMLElement>('ek-copy');
  const sizeSel = $<HTMLSelectElement>('ek-size');
  const copiedText = root.dataset.tCopied ?? 'Copied';
  const cb = (id: string): Cbx => root.querySelector(`#${id}`) as Cbx;
  const secs = (el: Cbx): number => timeToSeconds(el.value) ?? 0;
  const provider = root.dataset.ekGenerator ?? 'youtube';

  const engines: Record<string, () => { src: string; code: string; title: string }> = {
    youtube() {
      const parsed = parseYouTube(toUrl(urlInput.value) ?? new URL('about:blank'));
      if (!parsed) return { src: '', code: '', title: '' };
      const opts: YouTubeOptions = {
        autoplay: cb('ek-autoplay')?.checked,
        mute: cb('ek-mute')?.checked,
        loop: cb('ek-loop')?.checked,
        controls: cb('ek-controls') ? cb('ek-controls').checked : true,
        rel: cb('ek-rel') ? cb('ek-rel').checked : true,
        start: String(secs(cb('ek-start'))),
      };
      const html = buildYouTube(parsed, opts);
      const facade = cb('ek-facade')?.checked;
      const w = pickedWidth();
      const raw = facade ? facadeSnippet(html.src, parsed.contentId, String(html.attrs.title)) : youtubeEmbedCode(html, w, Math.round(w * 9 / 16));
      return {
        src: html.src,
        code: !facade && responsive() ? responsiveWrap(raw) : raw,
        title: String(html.attrs.title),
      };
    },
    vimeo() {
      const parsed = parseVimeo(toUrl(urlInput.value) ?? new URL('about:blank'));
      if (!parsed) return { src: '', code: '', title: '' };
      const opts: VimeoOptions = {
        autoplay: cb('ek-autoplay')?.checked,
        loop: cb('ek-loop')?.checked,
        mute: cb('ek-mute')?.checked,
        controls: cb('ek-controls') ? cb('ek-controls').checked : true,
        title: cb('ek-title') ? cb('ek-title').checked : true,
        byline: cb('ek-byline') ? cb('ek-byline').checked : true,
        portrait: cb('ek-portrait') ? cb('ek-portrait').checked : true,
        start: String(secs(cb('ek-start'))),
      };
      const html = buildVimeo(parsed, opts);
      const w = pickedWidth();
      const raw = vimeoEmbedCode(html, w, Math.round(w * 9 / 16));
      return { src: html.src, code: responsive() ? responsiveWrap(raw) : raw, title: String(html.attrs.title) };
    },
    twitch() {
      const parsed = parseTwitch(urlInput.value);
      if (!parsed) return { src: '', code: '', title: '' };
      const parent = (cb('ek-parent')?.value || location.hostname).trim();
      const opts: TwitchOptions = {
        parent,
        autoplay: cb('ek-autoplay')?.checked,
        mute: cb('ek-mute')?.checked,
      };
      const html = buildTwitch(parsed, opts);
      const w = pickedWidth();
      const raw = twitchEmbedCode(html, w, Math.round(w * 9 / 16));
      return { src: html.src, code: responsive() ? responsiveWrap(raw) : raw, title: String(html.attrs.title) };
    },
    dailymotion() {
      const parsed = parseDailymotion(toUrl(urlInput.value) ?? new URL('about:blank'));
      if (!parsed) return { src: '', code: '', title: '' };
      const opts: DailymotionOptions = {
        autoplay: cb('ek-autoplay')?.checked,
        loop: cb('ek-loop')?.checked,
        mute: cb('ek-mute')?.checked,
        controls: cb('ek-controls') ? cb('ek-controls').checked : true,
        start: String(secs(cb('ek-start'))),
      };
      const html = buildDailymotion(parsed, opts);
      const w = pickedWidth();
      const raw = dailymotionEmbedCode(html, w, Math.round(w * 9 / 16));
      return { src: html.src, code: responsive() ? responsiveWrap(raw) : raw, title: String(html.attrs.title) };
    },
    telegram() {
      const parsed = parseTelegram(urlInput.value);
      if (!parsed) return { src: '', code: '', title: '' };
      const mode = (root.dataset.ekMode === 'channel' ? 'channel' : 'post') as TelegramOptions['mode'];
      const opts: TelegramOptions = {
        mode,
        dark: cb('ek-dark')?.checked,
        grow: cb('ek-grow')?.checked,
      };
      const html = buildTelegram(parsed, opts);
      return { src: html.src, code: telegramEmbedCode(html, opts), title: String(html.attrs.title) };
    },
    spotify() {
      const parsed = parseSpotify(toUrl(urlInput.value) ?? new URL('about:blank'));
      if (!parsed) return { src: '', code: '', title: '' };
      const html = buildSpotify(parsed, {} as SpotifyOptions);
      return { src: html.src, code: spotifyEmbedCode(html), title: String(html.attrs.title) };
    },
    vk() {
      const parsed = parseVK(toUrl(urlInput.value) ?? new URL('about:blank'));
      if (!parsed) return { src: '', code: '', title: '' };
      const opts: VKOptions = {
        autoplay: cb('ek-autoplay')?.checked,
        hd: cb('ek-hd') ? cb('ek-hd').checked : true,
      };
      const html = buildVK(parsed, opts);
      const w = pickedWidth();
      const raw = vkEmbedCode(html, w, Math.round(w * 9 / 16));
      return { src: html.src, code: responsive() ? responsiveWrap(raw) : raw, title: String(html.attrs.title) };
    },
    rutube() {
      const parsed = parseRutube(toUrl(urlInput.value) ?? new URL('about:blank'));
      if (!parsed) return { src: '', code: '', title: '' };
      const opts: RutubeOptions = {
        autoplay: cb('ek-autoplay')?.checked,
        showSeries: cb('ek-series')?.checked,
      };
      const html = buildRutube(parsed, opts);
      const w = pickedWidth();
      const raw = rutubeEmbedCode(html, w, Math.round(w * 9 / 16));
      return { src: html.src, code: responsive() ? responsiveWrap(raw) : raw, title: String(html.attrs.title) };
    },
    tiktok() {
      const parsed = parseTikTok(toUrl(urlInput.value) ?? new URL('about:blank'));
      if (!parsed) return { src: '', code: '', title: '' };
      const html = buildTikTok(parsed, {} as TikTokOptions);
      return { src: html.src, code: tikTokEmbedCode(html), title: String(html.attrs.title) };
    },
  };

  const mode = (): string => root.dataset.ekMode ?? 'post';

  /** Width picked in the Preview panel; page default (560) when no select. */
  const pickedWidth = (): number => SIZES[sizeSel?.value ?? ''] ?? 560;
  /** A page without #ek-size keeps the plain fixed-size iframe. */
  const responsive = (): boolean => !!sizeSel && !SIZES[sizeSel.value];

  function render() {
    const engine = engines[provider]!();
    if (!engine.code) {
      preview.innerHTML = '';
      code.value = '';
      status.textContent = root.dataset.tInvalid || 'Paste a valid link';
      return;
    }
    if (provider === 'tiktok') {
      preview.style.aspectRatio = '9 / 16';
      preview.style.maxHeight = '620px';
      preview.innerHTML = '';
      const box = document.createElement('div');
      box.innerHTML = engine.code;
      const bq = box.querySelector('blockquote');
      if (bq) preview.replaceChildren(bq);
      const sc = box.querySelector('script');
      if (sc) document.body.appendChild(sc);
    } else if (engine.src) {
      const iframe = document.createElement('iframe');
      iframe.src = engine.src;
      if (provider === 'telegram') {
        iframe.style.width = '100%';
        iframe.style.height = mode() === 'channel' ? '400px' : '300px';
        iframe.style.border = '0';
        iframe.style.borderRadius = '8px';
        iframe.setAttribute('allowtransparency', '');
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('frameBorder', '0');
        preview.replaceChildren(iframe);
        code.value = engine.code;
        status.textContent = '';
        return;
      }
      iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('title', engine.title);
      iframe.loading = 'lazy';
      if (provider === 'spotify') {
        iframe.style.width = '100%';
        iframe.style.height = '352px';
        iframe.style.border = '0';
        iframe.style.borderRadius = '12px';
      }
      preview.replaceChildren(iframe);
    }
    const px = sizeSel ? SIZES[sizeSel.value] : 0;
    preview.style.maxWidth = px ? `${px}px` : '';
    code.value = engine.code;
    status.textContent = '';
  }

  root.addEventListener('input', render);
  copyBtn.addEventListener('click', async () => {
    if (!code.value) return;
    const text = code.value;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      code.select();
      document.execCommand('copy');
    }
    copyBtn.dataset.state = 'copied';
    status.textContent = copiedText;
    window.setTimeout(() => {
      copyBtn.dataset.state = '';
      status.textContent = '';
    }, 1500);
  });
  render();
}

for (const el of document.querySelectorAll<HTMLElement>('[data-ek-generator]')) mount(el);
