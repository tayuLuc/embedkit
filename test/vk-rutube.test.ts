import { describe, it, expect } from 'vitest';
import { parseVK, buildVK, vkEmbedCode } from '../src/lib/providers/vk.ts';
import { parseRutube, buildRutube, rutubeEmbedCode } from '../src/lib/providers/rutube.ts';
import { toUrl } from '../src/lib/url.ts';

const pv = (s: string) => parseVK(toUrl(s)!);
const pr = (s: string) => parseRutube(toUrl(s)!);
const ref = (contentId: string) => ({ contentId, contentType: 'video' }) as const;

describe('vk', () => {
  it('parses public / private / ext.php forms', () => {
    expect(pv('https://vk.com/video-1522384574_109557731')).toEqual(ref('-1522384574|109557731'));
    expect(pv('vk.com/video-1522384574_109557731')).toEqual(ref('-1522384574|109557731'));
    expect(pv('https://vk.com/video308224978_113765324')).toEqual(ref('308224978|113765324'));
    expect(pv('https://vkvideo.ru/video-1522384574_109557731')).toEqual(ref('-1522384574|109557731'));
    expect(pv('https://vkvideo.ru/video-1522384574_109557731?list=r304622015')).toEqual(ref('-1522384574|109557731'));
    expect(pv('https://vk.com/video_ext.php?oid=-1522384574&id=109557731&hash=1b3cd304eaba5115&hd=2'))
      .toEqual(ref('-1522384574|109557731|1b3cd304eaba5115'));
    expect(pv('https://vk.com/video_ext.php?oid=308224978&id=113765324')).toEqual(ref('308224978|113765324'));
    expect(pv('https://vk.com/video-1522384574_109557734')).toEqual(ref('-1522384574|109557734'));
  });
  it('rejects non-video paths, non-numeric ids, foreign hosts', () => {
    expect(pv('https://vk.com/feed')).toBeNull();
    expect(pv('https://vk.com/video_ext.php?oid=abc&id=1')).toBeNull();
    expect(pv('https://example.com/video-1_2')).toBeNull();
    expect(pv('https://vk.com/video-1_2')).toBeNull();
  });
  it('builds hashless url without a hash param', () => {
    expect(buildVK(ref('-1522384574|109557731'), {}).src)
      .toBe('https://vk.com/video_ext.php?hd=2&id=109557731&oid=-1522384574');
  });
  it('builds hash url, verbatim, never derived from ids', () => {
    const { src } = buildVK(ref('-158971965|450373311|03e5dddf398d4a10e2'), {});
    expect(src).toBe('https://vk.com/video_ext.php?hash=03e5dddf398d4a10e2&hd=2&id=450373311&oid=-158971965');
    expect(src).not.toMatch(/hash=[^&]*(450373311|158971965)/);
  });
  it('hd=2 by default, omitted when off; autoplay', () => {
    expect(buildVK(ref('308224978|113765324'), {}).src).toContain('hd=2');
    expect(buildVK(ref('308224978|113765324'), { hd: false }).src).not.toContain('hd=');
    expect(buildVK(ref('308224978|113765324'), { hd: false, autoplay: true }).src)
      .toBe('https://vk.com/video_ext.php?autoplay=1&id=113765324&oid=308224978');
  });
  it('iframe code carries the allow list', () => {
    const code = vkEmbedCode(buildVK(ref('-1522384574|109557731'), {}));
    expect(code).toContain('src="https://vk.com/video_ext.php?hd=2&id=109557731&oid=-1522384574"');
    expect(code).toContain('allow="autoplay; fullscreen; encrypted-media; picture-in-picture; geolocation"');
    expect(code).toContain('allowfullscreen');
  });
});

describe('rutube', () => {
  const ID = 'e2785e3c5a17414f68a558b3a966dcdf';
  it('parses canonical, embed and slug forms', () => {
    expect(pr(`https://rutube.com/video/${ID}`)).toEqual(ref(ID));
    expect(pr(`https://rutube.com/video/embed/${ID}`)).toEqual(ref(ID));
    expect(pr(`https://rutube.com/video/slug-name-${ID}`)).toEqual(ref(ID));
    expect(pr(`https://rutube.com/video/sl/${ID}`)).toEqual(ref(ID));
    expect(pr(`https://www.rutube.com/video/${ID}`)).toEqual(ref(ID));
    expect(pr('https://rutube.com/video/deadbeef')).toBeNull();
    expect(pr('https://example.com/video/embed/' + ID)).toBeNull();
  });
  it('builds minimal + option urls', () => {
    expect(buildRutube(ref(ID), {}).src).toBe(`https://rutube.com/video/embed/${ID}`);
    expect(buildRutube(ref(ID), { autoplay: true, showSeries: true }).src)
      .toBe(`https://rutube.com/video/embed/${ID}?autoplay=1&series=1`);
  });
  it('iframe code carries the allow list incl. geolocation', () => {
    const code = rutubeEmbedCode(buildRutube(ref(ID), {}));
    expect(code).toContain(`src="https://rutube.com/video/embed/${ID}"`);
    expect(code).toContain('allow="autoplay; fullscreen; encrypted-media; picture-in-picture; geolocation"');
  });
});
