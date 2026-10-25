import { describe, it, expect } from 'vitest';
import { parseTwitch, buildTwitch, twitchEmbedCode } from '../src/lib/providers/twitch.ts';

describe('twitch parse', () => {
  it('channel, video, collection, clip, bare name', () => {
    expect(parseTwitch('https://twitch.tv/shroud')).toEqual({ contentId: 'shroud', contentType: 'channel' });
    expect(parseTwitch('https://www.twitch.tv/videos/1863123403')).toEqual({ contentId: '1863123403', contentType: 'video' });
    expect(parseTwitch('https://twitch.tv/shroud/clip/GoodGymnastSmallRatKappaPride-xY')).toEqual({ contentId: 'GoodGymnastSmallRatKappaPride-xY', contentType: 'clip' });
    expect(parseTwitch('shroud')).toEqual({ contentId: 'shroud', contentType: 'channel' });
    expect(parseTwitch('clips.twitch.tv/embed/Abc')).toEqual({ contentId: 'Abc', contentType: 'clip' });
  });
  it('rejects reserved and junk', () => {
    expect(parseTwitch('https://twitch.tv/directory')).toBeNull();
    expect(parseTwitch('https://twitch.tv/login')).toBeNull();
    expect(parseTwitch('not a name')).toBeNull();
  });
});

describe('twitch build', () => {
  it('channel with parent, autoplay, sorted', () => {
    const { src } = buildTwitch({ contentId: 'shroud', contentType: 'channel' }, { parent: 'example.com', autoplay: true });
    expect(src).toBe('https://player.twitch.tv/?autoplay=1&channel=shroud&parent=example.com');
  });
  it('clip base', () => {
    const { src } = buildTwitch({ contentId: 'Abc', contentType: 'clip' }, { parent: 'example.com' });
    expect(src).toBe('https://clips.twitch.tv/embed?clip=Abc&parent=example.com');
  });
  it('iframe code has parent', () => {
    expect(twitchEmbedCode(buildTwitch({ contentId: 'x', contentType: 'channel' }, { parent: 'p.io' }))).toContain('parent=p.io');
  });
});
