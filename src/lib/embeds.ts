export type BodySegment = { kind: 'html'; html: string } | { kind: 'youtube'; id: string; title: string };

const YOUTUBE_IFRAME =
  /<iframe\s+src="https:\/\/www\.youtube\.com\/embed\/([\w-]{11})"\s+title="([^"]*)"[^>]*>\s*<\/iframe>/g;

/**
 * Splits article HTML around YouTube iframes so each can render as a click-to-load player,
 * keeping YouTube's scripts off the page until a visitor presses play.
 */
export const splitYouTubeEmbeds = (html: string): BodySegment[] => {
  const segments: BodySegment[] = [];
  let cursor = 0;
  for (const match of html.matchAll(YOUTUBE_IFRAME)) {
    segments.push({ kind: 'html', html: html.slice(cursor, match.index) });
    segments.push({ kind: 'youtube', id: match[1] ?? '', title: match[2] ?? '' });
    cursor = match.index + match[0].length;
  }
  segments.push({ kind: 'html', html: html.slice(cursor) });
  return segments;
};
