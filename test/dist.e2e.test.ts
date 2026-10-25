// Runs BUILT dist pages under jsdom: each test builds its own JSDOM, exposes
// window/document as globals, imports the built island bundle (cache-busted so
// the ESM singleton body re-runs and rebinds to the fresh globals), then
// drives real input events on the real page markup.
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const dist = process.cwd() + '/dist';

function islandBundle(): string {
  const file = readdirSync(dist + '/_astro').find((f) => f.startsWith('generator.client.'));
  if (!file) throw new Error('island bundle not found in dist/_astro');
  return readFileSync(dist + '/_astro/' + file, 'utf8');
}
const YT_HTML = '/en/generator/youtube/index.html';
const YT_ROUTE = '/embedkit/en/generator/youtube';

async function mount(htmlPath: string, route: string): Promise<JSDOM> {
  const html = readFileSync(dist + htmlPath, 'utf8');
  const dom = new JSDOM(html, { url: 'https://embedkit.test' + route });

  // The page script tag only re-exports the shared island bundle; run that
  // bundle body in a function scope with the jsdom window closed over —
  // exactly how a browser binds a module to its page.
  const island = islandBundle();
  const fn = new Function('window', 'document', 'navigator', 'location', island);
  fn(dom.window, dom.window.document, dom.window.navigator, dom.window.location);
  return dom;
}

function fire(dom: JSDOM, selector: string, value?: string) {
  const el = dom.window.document.querySelector(selector) as HTMLInputElement;
  if (value !== undefined) el.value = value;
  el.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
}

describe('youtube page (built dist)', () => {
  it('valid link -> facade snippet by default, plain iframe when unchecked', async () => {
    const dom = await mount(YT_HTML, YT_ROUTE);
    const d = dom.window.document;
    fire(dom, '#ek-url', 'https://youtu.be/dQw4w9WgXcQ');
    const code = (d.querySelector('#ek-code') as HTMLTextAreaElement).value;
    expect(code).toContain('yt-facade');
    expect(code).toContain('data-src="https://www.youtube.com/embed/dQw4w9WgXcQ');
    (d.querySelector('#ek-facade') as HTMLInputElement).checked = false;
    fire(dom, '#ek-url');
    expect((d.querySelector('#ek-code') as HTMLTextAreaElement).value).toMatch(/^<iframe width="560"/);
  });

  it('invalid link -> status message, empty code', async () => {
    const dom = await mount(YT_HTML, YT_ROUTE);
    fire(dom, '#ek-url', 'https://example.com/nope');
    expect((dom.window.document.querySelector('#ek-code') as HTMLTextAreaElement).value).toBe('');
    expect(dom.window.document.querySelector('#ek-status')!.textContent).toContain('valid');
  });

  it('vimeo page builds canonical player url', async () => {
    const dom = await mount('/en/generator/vimeo/index.html', '/embedkit/en/generator/vimeo');
    fire(dom, '#ek-url', 'https://vimeo.com/76979871');
    fire(dom, '#ek-start', '90');
    const code = (dom.window.document.querySelector('#ek-code') as HTMLTextAreaElement).value;
    expect(code).toContain('player.vimeo.com/video/76979871#t=90s');
  });

  it('twitch page injects parent domain', async () => {
    const dom = await mount('/en/generator/twitch/index.html', '/embedkit/en/generator/twitch');
    fire(dom, '#ek-parent', 'example.com');
    fire(dom, '#ek-url', 'shroud');
    const code = (dom.window.document.querySelector('#ek-code') as HTMLTextAreaElement).value;
    expect(code).toContain('player.twitch.tv/?channel=shroud&parent=example.com');
  });
});

describe('static dist invariants', () => {
  const files = ['en/index.html', 'ru/index.html', 'en/generator/youtube/index.html', 'ru/generator/youtube/index.html'];
  it('no undefined, all hrefs carry base prefix', () => {
    for (const f of files) {
      const html = readFileSync(`${dist}/${f}`, 'utf8');
      expect(html).not.toContain('undefined');
      const hrefs = [...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]);
      for (const h of hrefs) expect(h.startsWith('/embedkit')).toBe(true);
    }
  });
});
