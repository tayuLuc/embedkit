import { describe, it, expect } from 'vitest';
import { buildEmbedUrl, timeToSeconds } from '../src/lib/build.ts';
import { toUrl, hostRouter, segments } from '../src/lib/url.ts';

describe('buildEmbedUrl', () => {
  const spec = {
    baseUrl: 'https://www.youtube-nocookie.com/embed/abc123',
    keys: { autoplay: 'autoplay', start: 'start', rel: 'rel' },
    defaults: { autoplay: false, start: 0, rel: true },
  };
  it('drops default params', () => {
    expect(
      buildEmbedUrl({ ...spec, params: { autoplay: false, start: 0, rel: true } }),
    ).toBe('https://www.youtube-nocookie.com/embed/abc123');
  });
  it('maps, bools->0/1, sorts', () => {
    expect(
      buildEmbedUrl({ ...spec, params: { rel: false, autoplay: true, start: 90 } }),
    ).toBe(
      'https://www.youtube-nocookie.com/embed/abc123?autoplay=1&rel=0&start=90',
    );
  });
  it('modifier can relocate a param to hash', () => {
    expect(
      buildEmbedUrl({
        baseUrl: 'https://player.vimeo.com/video/76979871',
        keys: { title: 'title', start: 't' },
        defaults: { title: true, start: 0 },
        params: { title: false, start: 90 },
        modifier: (url, key, value) => {
          if (key === 't') {
            url.hash = `t=${value}s`;
            return true;
          }
          return false;
        },
      }),
    ).toBe('https://player.vimeo.com/video/76979871?title=0#t=90s');
  });
});

describe('timeToSeconds', () => {
  it('parses plain, mm:ss, hh:mm:ss', () => {
    expect(timeToSeconds('90')).toBe(90);
    expect(timeToSeconds('1:30')).toBe(90);
    expect(timeToSeconds('01:02:03')).toBe(3723);
    expect(timeToSeconds('junk')).toBeNull();
    expect(timeToSeconds('')).toBeNull();
  });
});

describe('url parsing', () => {
  it('normalizes bare domains, rejects garbage', () => {
    expect(toUrl('youtu.be/abc123')?.hostname).toBe('youtu.be');
    expect(toUrl('  ')).toBeNull();
    expect(toUrl('a b c')).toBeNull();
  });
  it('routes by hostname ignoring www', () => {
    const route = hostRouter({
      'youtube.com': (u) => ({ contentId: segments(u)[0] ?? '', contentType: 'video' }),
    });
    const r = route(toUrl('https://www.youtube.com/watch/xyz')!);
    expect(r).toEqual({ contentId: 'watch', contentType: 'video' });
    expect(route(toUrl('https://vimeo.com/1')!)).toBeNull();
  });
});
