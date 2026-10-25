// Client island: vanilla TS, one engine per provider page.
import { toUrl } from './url';
import { parseYouTube, buildYouTube, youtubeEmbedCode, type YouTubeOptions } from './providers/youtube';
import { facadeSnippet } from './providers/youtube-facade';
import { parseVimeo, buildVimeo, vimeoEmbedCode, type VimeoOptions } from './providers/vimeo';
import { parseTwitch, buildTwitch, twitchEmbedCode, type TwitchOptions } from './providers/twitch';
import { parseDailymotion, buildDailymotion, dailymotionEmbedCode, type DailymotionOptions } from './providers/dailymotion';
import { parseTikTok, buildTikTok, tikTokEmbedCode, type TikTokOptions } from './providers/tiktok';
import { parseSpotify, buildSpotify, spotifyEmbedCode, type SpotifyOptions } from './providers/spotify';
import { parseMaps, buildMaps, mapsEmbedCode, type MapsOptions } from './providers/maps';
import { timeToSeconds } from './build';

type Cbx = HTMLInputElement;

function mount(root: HTMLElement) {
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => root.querySelector(`#${id}`) as T;
  const urlInput = $<Cbx>('ek-url');
  const preview = $<HTMLElement>('ek-preview');
  const code = $<HTMLTextAreaElement>('ek-code');
  const status = $<HTMLElement>('ek-status');
  const copyBtn = $<HTMLElement>('ek-copy');
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
      return {
        src: html.src,
        code: facade ? facadeSnippet(html.src, parsed.contentId, String(html.attrs.title)) : youtubeEmbedCode(html),
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
      return { src: html.src, code: vimeoEmbedCode(html), title: String(html.attrs.title) };
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
      return { src: html.src, code: twitchEmbedCode(html), title: String(html.attrs.title) };
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
      return { src: html.src, code: dailymotionEmbedCode(html), title: String(html.attrs.title) };
    },
    maps() {
      const parsed = parseMaps(urlInput.value);
      if (!parsed || parsed.contentType === 'shortlink') return { src: '', code: '', title: '' };
      const opts: MapsOptions = { width: 600, height: 450 };
      const html = buildMaps(parsed, opts);
      return { src: html.src, code: mapsEmbedCode(html), title: String(html.attrs.title) };
    },
    spotify() {
      const parsed = parseSpotify(toUrl(urlInput.value) ?? new URL('about:blank'));
      if (!parsed) return { src: '', code: '', title: '' };
      const html = buildSpotify(parsed, {} as SpotifyOptions);
      return { src: html.src, code: spotifyEmbedCode(html), title: String(html.attrs.title) };
    },
    tiktok() {
      const parsed = parseTikTok(toUrl(urlInput.value) ?? new URL('about:blank'));
      if (!parsed) return { src: '', code: '', title: '' };
      const html = buildTikTok(parsed, {} as TikTokOptions);
      return { src: html.src, code: tikTokEmbedCode(html), title: String(html.attrs.title) };
    },
  };

  function render() {
    const engine = engines[provider]!();
    if (!engine.code) {
      preview.innerHTML = '';
      code.value = '';
      status.textContent = root.dataset.tInvalid || 'Paste a valid link';
      return;
    }
    if (provider === 'tiktok') {
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
      iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('title', engine.title);
      iframe.loading = 'lazy';
      if (provider === 'spotify' || provider === 'maps') {
        iframe.style.width = '100%';
        iframe.style.height = '352px';
        iframe.style.border = '0';
        iframe.style.borderRadius = '12px';
      }
      preview.replaceChildren(iframe);
    }
    code.value = engine.code;
    status.textContent = '';
  }

  root.addEventListener('input', render);
  copyBtn.addEventListener('click', async () => {
    if (!code.value) return;
    await navigator.clipboard.writeText(code.value);
    copyBtn.dataset.state = 'copied';
    setTimeout(() => (copyBtn.dataset.state = ''), 1500);
  });
  render();
}

for (const el of document.querySelectorAll<HTMLElement>('[data-ek-generator]')) mount(el);
