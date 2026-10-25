export type ProviderId = 'youtube' | 'vimeo' | 'dailymotion' | 'twitch' | 'tiktok';

export type ContentType = 'video' | 'channel' | 'clip' | 'collection' | 'chat' | 'shortlink';

export interface ParsedRef {
  contentId: string;
  contentType: ContentType;
}

/** Canonical iframe HTML produced for copy-paste. */
export interface EmbedHtml {
  src: string;
  attrs: Record<string, string | true>;
}

export interface ProviderModule {
  id: ProviderId;
  /** Parse a user-supplied URL; return null if not recognized. */
  parse(rawUrl: string): ParsedRef | null;
  /** Build the final iframe description from a ref + user options. */
  build(ref: ParsedRef, opts: Record<string, string | number | boolean>): EmbedHtml;
}
