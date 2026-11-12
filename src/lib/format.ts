/** Sentence ends, ignoring abbreviations such as "Dr." that appear throughout the content. */
const SENTENCE_END = /(?<!\b(?:Dr|Mr|Mrs|Ms|St|Jr|Sr|Vol|vs|No))[.!?](?=\s+["“(]?[A-Z]|$)/g;

/** Shortest whole-sentence description worth using; anything shorter says too little in a search result. */
const MIN_SENTENCE_DESCRIPTION = 120;

/**
 * Meta description sized for search results (≤ `max` characters): whole sentences when they fill
 * most of the space, otherwise the text cut at a word boundary with an ellipsis.
 */
export const metaDescription = (text: string, max = 160): string => {
  if (text.length <= max) return text;
  const ends = [...text.matchAll(SENTENCE_END)].map((m) => m.index + 1).filter((end) => end <= max);
  const lastEnd = ends.at(-1);
  if (lastEnd !== undefined && lastEnd >= MIN_SENTENCE_DESCRIPTION) return text.slice(0, lastEnd);
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:—-]+$/, '')}…`;
};

/** Video running time: 3379 → "56:19", 4095 → "1:08:15". */
export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
};

/** ISO 8601 duration for structured data: 3379 → "PT56M19S". */
export const isoDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  return `PT${h ? `${h}H` : ''}${Math.floor((seconds % 3600) / 60)}M${seconds % 60}S`;
};

/** "07" style two-digit ordinal used on numbered cards. */
export const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Formats `2016-07-06` as "July 6, 2016" and `2025-02` as "February 2025" (timezone-independent). */
export const formatDate = (iso: string): string => {
  const [year, month, day] = iso.split('-').map(Number);
  if (year === undefined || month === undefined) throw new Error(`Invalid ISO date: ${iso}`);
  const date = new Date(Date.UTC(year, month - 1, day ?? 1));
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    ...(day === undefined ? {} : { day: 'numeric' }),
  }).format(date);
};
