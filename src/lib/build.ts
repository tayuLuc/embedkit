/**
 * URL builder pipeline, mirroring the standard drop-defaults approach:
 * 1. drop params equal to their declared default
 * 2. drop undefined/empty
 * 3. map camelCase option keys -> canonical provider query keys
 * 4. bool -> 1/0
 * 5. sort keys, serialize; modifiers may relocate a param (e.g. vimeo `t` -> hash)
 */

export interface BuildSpec {
  baseUrl: string;
  params: Record<string, string | number | boolean | undefined>;
  /** canonical query key for each param name */
  keys: Record<string, string>;
  /** default value per param name; equal values are dropped */
  defaults: Record<string, string | number | boolean>;
  /** relocate/replace a param; return true when consumed */
  modifier?: (url: URL, key: string, value: string) => boolean;
}

export function buildEmbedUrl(spec: BuildSpec): string {
  const url = new URL(spec.baseUrl);
  const entries = Object.entries(spec.params).filter(
    ([name, value]) =>
      value !== undefined && value !== '' && value !== spec.defaults[name],
  );
  for (const [name, value] of entries) {
    const key = spec.keys[name] ?? name;
    const str = typeof value === 'boolean' ? String(Number(value)) : String(value);
    if (spec.modifier?.(url, key, str)) continue;
    url.searchParams.set(key, str);
  }
  url.searchParams.sort();
  return url.toString();
}

/** Serialize parsed seconds ("90") and mm:ss helpers for start/end params. */
export function timeToSeconds(input: string): number | null {
  const t = input.trim();
  if (!t) return null;
  if (/^\d+$/.test(t)) return Number(t);
  const m = /^(\d+):([0-5]?\d)(?::([0-5]?\d))?$/.exec(t);
  if (!m) return null;
  const parts = m.slice(1).filter((x) => x !== undefined).map(Number);
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}
