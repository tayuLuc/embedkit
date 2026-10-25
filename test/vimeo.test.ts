import { describe, it, expect } from 'vitest';
import { parseVimeo, buildVimeo, vimeoEmbedCode } from '../src/lib/providers/vimeo.ts';
import { toUrl } from '../src/lib/url.ts';

const p = (s: string) => parseVimeo(toUrl(s)!);

describe('vimeo parse', () => {
  it('numeric ids on both hosts', () => {
    expect(p('https://vimeo.com/76979871')).toEqual({ contentId: '76979871', contentType: 'video' });
    expect(p('https://player.vimeo.com/video/76979871')).toEqual({ contentId: '76979871', contentType: 'video' });
  });
  it('rejects channels, junk', () => {
    expect(p('https://vimeo.com/channels/staffpicks')).toBeNull();
    expect(p('https://vimeo.com/staff')).toBeNull();
  });
});

describe('vimeo build', () => {
  const ref = { contentId: '76979871', contentType: 'video' } as const;
  it('bare by default', () => {
    expect(buildVimeo(ref, {}).src).toBe('https://player.vimeo.com/video/76979871');
  });
  it('params canonical, sorted; start goes to hash', () => {
    const { src } = buildVimeo(ref, { autoplay: true, title: false, byline: false, start: '90' });
    expect(src).toBe('https://player.vimeo.com/video/76979871?autoplay=1&byline=0&title=0#t=90s');
  });
  it('iframe code', () => {
    expect(vimeoEmbedCode(buildVimeo(ref, {}))).toContain('src="https://player.vimeo.com/video/76979871"');
  });
});
