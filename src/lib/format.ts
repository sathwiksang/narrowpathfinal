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
