import { describe, it, expect } from 'vitest';
import { parseYouTube, buildYouTube, youtubeEmbedCode } from '../src/lib/providers/youtube.ts';
import { toUrl } from '../src/lib/url.ts';

const p = (s: string) => parseYouTube(toUrl(s)!);

describe('youtube parse', () => {
  it('watch / shorts / v / embed / youtu.be', () => {
    expect(p('https://youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({ contentId: 'dQw4w9WgXcQ', contentType: 'video' });
    expect(p('https://youtu.be/dQw4w9WgXcQ')).toEqual({ contentId: 'dQw4w9WgXcQ', contentType: 'video' });
    expect(p('https://youtube.com/shorts/dQw4w9WgXcQ')).toEqual({ contentId: 'dQw4w9WgXcQ', contentType: 'video' });
    expect(p('https://youtube.com/v/dQw4w9WgXcQ')).toEqual({ contentId: 'dQw4w9WgXcQ', contentType: 'video' });
    expect(p('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')).toEqual({ contentId: 'dQw4w9WgXcQ', contentType: 'video' });
  });
  it('playlist forms', () => {
    expect(p('https://youtube.com/playlist?list=PLabc123')).toEqual({ contentId: 'PLabc123', contentType: 'collection' });
    expect(p('https://youtu.be/dQw4w9WgXcQ?list=PLabc123')).toEqual({ contentId: 'dQw4w9WgXcQ', contentType: 'video' });
  });
  it('rejects junk', () => {
    expect(p('https://youtube.com/watch?v=nope')).toBeNull();
    expect(p('https://example.com/x')).toBeNull();
    expect(p('https://youtube.com/')).toBeNull();
  });
});

describe('youtube build', () => {
  const ref = { contentId: 'dQw4w9WgXcQ', contentType: 'video' } as const;
  it('bare embed by default', () => {
    expect(buildYouTube(ref, {}).src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });
  it('nocookie + options drop defaults, sorted params', () => {
    const { src } = buildYouTube(ref, { nocookie: true, autoplay: true, mute: true, start: '90', rel: false });
    expect(src).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&rel=0&start=90');
  });
  it('playlist uses videoseries + list', () => {
    const { src } = buildYouTube({ contentId: 'PLabc123', contentType: 'collection' }, {});
    expect(src).toBe('https://www.youtube.com/embed/videoseries?list=PLabc123');
  });
  it('full iframe code', () => {
    const code = youtubeEmbedCode(buildYouTube(ref, { nocookie: true }));
    expect(code).toMatch(/^<iframe width="560" height="315" src="https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ" title="YouTube video" frameborder="0"/);
    expect(code).toContain('allowfullscreen></iframe>');
  });
});
