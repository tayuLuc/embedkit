import { describe, it, expect } from 'vitest';
import { parseSpotify, buildSpotify, spotifyEmbedCode } from '../src/lib/providers/spotify.ts';
import { toUrl } from '../src/lib/url.ts';

const p = (s: string) => parseSpotify(toUrl(s)!);

describe('spotify', () => {
  it('parses types with intl prefix', () => {
    expect(p('https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8')).toEqual({ contentId: '4PTG3Z6ehGkBFwjybzWkR8', contentType: 'track' });
    expect(p('https://open.spotify.com/intl-de/album/1DFixLWuPkv3KT3TnV35m3')).toEqual({ contentId: '1DFixLWuPkv3KT3TnV35m3', contentType: 'album' });
    expect(p('https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M')).toEqual({ contentId: '37i9dQZF1DXcBWIGoYBM5M', contentType: 'playlist' });
    expect(p('https://open.spotify.com/user/x')).toBeNull();
  });
  it('embed url + heights', () => {
    const t = buildSpotify({ contentId: '4PTG3Z6ehGkBFwjybzWkR8', contentType: 'track' }, {});
    expect(t.src).toBe('https://open.spotify.com/embed/track/4PTG3Z6ehGkBFwjybzWkR8');
    expect(t.attrs.height).toBe('152');
    const a = buildSpotify({ contentId: '1DFixLWuPkv3KT3TnV35m3', contentType: 'album' }, { theme: 'light' });
    expect(a.src).toBe('https://open.spotify.com/embed/album/1DFixLWuPkv3KT3TnV35m3?theme=light');
    expect(a.attrs.height).toBe('352');
  });
  it('code rounded, lazy', () => {
    expect(spotifyEmbedCode(buildSpotify({ contentId: '4PTG3Z6ehGkBFwjybzWkR8', contentType: 'track' }, {}))).toContain('border-radius:12px');
  });
});
