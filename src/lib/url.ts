import type { ParsedRef } from './types';

/** Strip protocol/www, parse with URL(). Returns null on garbage. */
export function toUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;
  const withProto = /^[a-z]+:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withProto);
  } catch {
    return null;
  }
}

export function hostIs(url: URL, ...hosts: string[]): boolean {
  const h = url.hostname.toLowerCase().replace(/^www\./, '');
  return hosts.includes(h);
}

export function segments(url: URL): string[] {
  return url.pathname.split('/').filter(Boolean);
}

export type Parser = (url: URL) => ParsedRef | null;

/** Route by hostname: table of exact hostnames (www-insensitive) to parsers. */
export function hostRouter(table: Record<string, Parser>): Parser {
  return (url) => {
    const h = url.hostname.toLowerCase().replace(/^www\./, '');
    const p = table[h];
    return p ? p(url) : null;
  };
}
