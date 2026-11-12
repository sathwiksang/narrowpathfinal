export type BodySegment = { kind: 'html'; html: string } | { kind: 'youtube'; id: string; title: string };

const IFRAME = /<iframe\b([^>]*)>\s*<\/iframe>/g;
const YOUTUBE_EMBED = /^https:\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([\w-]{11})(?:[?#][^"]*)?$/;
const ENTITIES: Record<string, string> = { amp: '&', quot: '"', '#39': "'", lt: '<', gt: '>' };

const attribute = (attrs: string, name: string): string | undefined =>
  attrs
    .match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1]
    ?.replace(/&(amp|quot|#39|lt|gt);/g, (_, e: string) => ENTITIES[e] ?? _);

/**
 * Splits article HTML around YouTube iframes so each can render as a click-to-load player,
 * keeping YouTube's scripts off the page until a visitor presses play. Other iframes are left as-is.
 */
export const splitYouTubeEmbeds = (html: string): BodySegment[] => {
  const segments: BodySegment[] = [];
  let cursor = 0;
  for (const match of html.matchAll(IFRAME)) {
    const attrs = match[1] ?? '';
    const id = attribute(attrs, 'src')?.match(YOUTUBE_EMBED)?.[1];
    if (!id) continue;
    segments.push({ kind: 'html', html: html.slice(cursor, match.index) });
    segments.push({ kind: 'youtube', id, title: attribute(attrs, 'title') ?? 'YouTube video' });
    cursor = match.index + match[0].length;
  }
  segments.push({ kind: 'html', html: html.slice(cursor) });
  return segments;
};
