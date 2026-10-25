import { describe, it, expect } from 'vitest';
import { parseMaps, buildMaps, mapsEmbedCode } from '../src/lib/providers/maps.ts';

describe('maps', () => {
  it('parses pb links', () => {
    const r = parseMaps('https://www.google.com/maps/place/Statue+of+Liberty/@40.6892494,-74.0466891,17z/data=!3m1!4b1!4m6!3m5!1sabc!8m2!3d40.6892494!4d-74.0445004!16zL206MDNxeTY2');
    expect(r?.contentId).toContain('!3m1!4b1');
  });
  it('shortlinks flagged', () => {
    const r = parseMaps('https://maps.app/AbC123def');
    expect(r?.contentType).toBe('shortlink');
    const g = parseMaps('https://goo.gl/AbC123def');
    expect(g?.contentType).toBe('shortlink');
  });
  it('rejects foreign hosts', () => {
    expect(parseMaps('https://example.com/maps')).toBeNull();
  });
  it('builds keyless embed iframe', () => {
    const html = buildMaps({ contentId: 'pb!data', contentType: 'video' }, { width: 800, height: 600 });
    expect(html.src).toBe('https://www.google.com/maps/embed?pb=pb!data');
    const code = mapsEmbedCode(html);
    expect(code).toContain('width="800"');
    expect(code).toContain('referrerpolicy="no-referrer-when-downgrade"');
  });
});
