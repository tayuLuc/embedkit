import { describe, it, expect } from 'vitest';
import { parseTelegram, buildTelegram, telegramEmbedCode } from '../src/lib/providers/telegram.ts';

describe('telegram parse', () => {
  it('post forms', () => {
    expect(parseTelegram('https://t.me/durov/123')).toEqual({ contentId: 'durov/123', contentType: 'video' });
    expect(parseTelegram('https://t.me/s/durov/123')).toEqual({ contentId: 'durov/123', contentType: 'video' });
    expect(parseTelegram('https://t.me/durov/123?embed=4')).toEqual({ contentId: 'durov/123', contentType: 'video' });
    expect(parseTelegram('t.me/durov/123')).toEqual({ contentId: 'durov/123', contentType: 'video' });
  });
  it('channel live form', () => {
    expect(parseTelegram('https://t.me/s/durov')).toEqual({ contentId: 'durov', contentType: 'channel' });
  });
  it('rejects junk and short names', () => {
    expect(parseTelegram('https://t.me/ab/1')).toBeNull();
    expect(parseTelegram('https://example.com/x')).toBeNull();
    expect(parseTelegram('')).toBeNull();
  });
});

describe('telegram build', () => {
  const post = { contentId: 'durov/123', contentType: 'video' } as const;
  it('post embed url', () => {
    expect(buildTelegram(post, { mode: 'post' }).src).toBe('https://t.me/durov/123?embed=4');
  });
  it('post code is blockquote + widget script', () => {
    const code = telegramEmbedCode(buildTelegram(post, { mode: 'post' }), { mode: 'post', dark: true });
    expect(code).toContain('data-url="https://t.me/durov/123?embed=4"');
    expect(code).toContain('telegram-widget.js');
    expect(code).toContain('data-theme="dark"');
  });
  it('channel mode', () => {
    const ch = { contentId: 'durov', contentType: 'channel' } as const;
    const html = buildTelegram(ch, { mode: 'channel' });
    const code = telegramEmbedCode(html, { mode: 'channel' });
    expect(code).toContain('data-telegram-embed="1"');
    expect(code).toContain('data-url="https://t.me/s/durov"');
  });
});
