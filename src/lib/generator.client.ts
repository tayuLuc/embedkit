// Client island: vanilla TS, no framework. Reads data-* from its host element.
import { toUrl } from './url';
import { parseYouTube } from './providers/youtube';
import { buildYouTube, youtubeEmbedCode, type YouTubeOptions } from './providers/youtube';
import { timeToSeconds } from './build';

function mount(root: HTMLElement) {
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => root.querySelector(`#${id}`) as T;
  const urlInput = $<HTMLInputElement>('ek-url');
  const preview = $<HTMLDivElement>('ek-preview');
  const code = $<HTMLTextAreaElement>('ek-code');
  const status = $<HTMLSpanElement>('ek-status');
  const copyBtn = $<HTMLButtonElement>('ek-copy');
  const nocookie = $<HTMLInputElement>('ek-nocookie') as HTMLInputElement;
  const autoplay = $<HTMLInputElement>('ek-autoplay') as HTMLInputElement;
  const mute = $<HTMLInputElement>('ek-mute') as HTMLInputElement;
  const loop = $<HTMLInputElement>('ek-loop') as HTMLInputElement;
  const controls = $<HTMLInputElement>('ek-controls') as HTMLInputElement;
  const rel = $<HTMLInputElement>('ek-rel') as HTMLInputElement;
  const start = $<HTMLInputElement>('ek-start') as HTMLInputElement;

  const L = {
    ok: (s: string) => (status.textContent = s),
  };

  function currentOptions(): YouTubeOptions {
    return {
      nocookie: nocookie.checked,
      autoplay: autoplay.checked,
      mute: mute.checked,
      loop: loop.checked,
      controls: controls.checked,
      rel: rel.checked,
      start: timeToSeconds(start.value) === null ? '0' : String(timeToSeconds(start.value)),
    };
  }

  function render() {
    const parsed = parseYouTube(toUrl(urlInput.value) ?? new URL('about:blank'));
    if (!parsed) {
      preview.innerHTML = '';
      code.value = '';
      L.ok(root.dataset.tInvalid || 'Paste a valid YouTube link');
      return;
    }
    const html = buildYouTube(parsed, currentOptions());
    const iframe = document.createElement('iframe');
    iframe.src = html.src;
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('title', String(html.attrs.title));
    iframe.loading = 'lazy';
    preview.replaceChildren(iframe);
    code.value = youtubeEmbedCode(html);
    L.ok('');
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
