import { describe, it, expect } from 'vitest';
import { parseDailymotion } from '../src/lib/providers/dailymotion.ts';
import { buildDailymotion, dailymotionEmbedCode } from '../src/lib/providers/dailymotion.ts';
import { parseTikTok, buildTikTok, tikTokEmbedCode } from '../src/lib/providers/tiktok.ts';
import { toUrl } from '../src/lib/url.ts';

const pd = (s: string) => parseDailymotion(toUrl(s)!);
const pt = (s: string) => parseTikTok(toUrl(s)!);

describe('dailymotion', () => {
  const ref = { contentId: 'x8m5kp9', contentType: 'video' } as const;
  it('parses video/dai.ly/embed forms', () => {
    expect(pd('https://dailymotion.com/video/x8m5kp9')).toEqual(ref);
    expect(pd('https://dai.ly/x8m5kp9')).toEqual(ref);
    expect(pd('https://dailymotion.com/embed/video/x8m5kp9')).toEqual(ref);
    expect(pd('https://dailymotion.com/search')).toBeNull();
  });
  it('builds minimal + option urls', () => {
    expect(buildDailymotion(ref, {}).src).toBe('https://www.dailymotion.com/embed/video/x8m5kp9');
    const { src } = buildDailymotion(ref, { autoplay: true, mute: true, uiHighlight: 'ff8c00' });
    expect(src).toBe('https://www.dailymotion.com/embed/video/x8m5kp9?autoplay=1&mute=1&ui-highlight=ff8c00');
  });
  it('iframe code', () => {
    expect(dailymotionEmbedCode(buildDailymotion(ref, {}))).toContain('embed/video/x8m5kp9');
  });
});

describe('tiktok', () => {
  it('parses canonical video and shortlink', () => {
    expect(pt('https://www.tiktok.com/@tiktok/video/6768504823336815877')).toEqual({
      contentId: '6768504823336815877',
      contentType: 'video',
    });
    expect(pt('https://vm.tiktok.com/ZMh2d7kLr/')).toEqual({ contentId: 'ZMh2d7kLr', contentType: 'shortlink' });
    expect(pt('https://tiktok.com/Discover')).toBeNull();
  });
  it('emits official blockquote + SDK', () => {
    const code = tikTokEmbedCode(buildTikTok({ contentId: '6768504823336815877', contentType: 'video' }, {}));
    expect(code).toContain('data-video-id="6768504823336815877"');
    expect(code).toContain('tiktok.com/embed.js');
  });
});
