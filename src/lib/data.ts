/**
 * Typed, validated site content. Every record is checked when the site builds:
 * a malformed URL, unknown category or duplicate id fails the build instead of shipping.
 */
import { z } from 'astro/zod';
import articlesJson from '../data/articles.json';
import booksJson from '../data/books.json';
import inreachJson from '../data/inreach.json';
import resourcesJson from '../data/resources.json';
import sermonsJson from '../data/sermons.json';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: 'must be a lowercase-hyphenated slug' });
const text = z.string().trim().min(1);
const driveUrl = z.url({ protocol: /^https$/, hostname: /^drive\.google\.com$/ });
const youtubeId = z.string().regex(/^[\w-]{11}$/, { error: 'must be an 11-character YouTube id' });
/** Internal root-relative path, absolute https URL, or mailto: link. */
const href = z.union([z.string().regex(/^\/[\w./#-]*$/), z.url({ protocol: /^(https|mailto)$/ })]);

const uniqueIds = <T extends { id: string }>(items: T[]) => new Set(items.map((i) => i.id)).size === items.length;
const list = <T extends z.ZodType<{ id: string }>>(item: T) =>
  z.array(item).min(1).refine(uniqueIds, { error: 'duplicate id' });

// ---------- Books & In-Reach PDFs ----------

export const LANGUAGES = {
  'ai-translation': 'AI Translation',
  english: 'English',
  malayalam: 'Malayalam',
  spanish: 'Spanish',
} as const;
export type Language = keyof typeof LANGUAGES;

const pdfDocument = z.object({
  id: slug,
  title: text,
  description: text,
  /** Google Drive `/preview` URL shown in the in-page viewer; null when the file is not yet published. */
  preview: driveUrl.nullable(),
  /** Google Drive `/view` URL opened in a new tab. */
  view: driveUrl.nullable(),
});
export type PdfDocument = z.infer<typeof pdfDocument>;

const book = pdfDocument.extend({ language: z.enum(Object.keys(LANGUAGES) as [Language, ...Language[]]) });

export const books = list(book).parse(booksJson);
export const inreach = list(pdfDocument).parse(inreachJson);

// ---------- Sermons ----------

export const SERMON_CATEGORIES = {
  prophecy: { filter: 'Prophecy', badge: 'PROPHECY' },
  doctrine: { filter: 'Doctrine', badge: 'DOCTRINE' },
  practical: { filter: 'Practical Living', badge: 'PRACTICAL' },
  miscellaneous: { filter: 'Miscellaneous & Interviews', badge: 'MISCELLANEOUS' },
} as const;
type SermonCategory = keyof typeof SERMON_CATEGORIES;

const sermon = z
  .object({
    id: youtubeId,
    category: z.enum(Object.keys(SERMON_CATEGORIES) as [SermonCategory, ...SermonCategory[]]),
    /** Overrides the category's default badge (e.g. "INTERVIEW"). */
    badge: text.optional(),
    episode: z.number().int().positive().optional(),
    /** Label for non-episode videos (e.g. "Book Launch"). */
    kicker: text.optional(),
    title: text,
    description: text,
    duration: z
      .string()
      .regex(/^\d{1,2}:\d{2}$/)
      .optional(),
  })
  .refine((s) => (s.episode === undefined) !== (s.kicker === undefined), {
    error: 'a sermon needs exactly one of `episode` or `kicker`',
  });
export type Sermon = z.infer<typeof sermon>;

export const sermons = list(sermon).parse(sermonsJson);

// ---------- Resources ----------

export const RESOURCE_FILTERS = {
  brethren: 'Brethren Assemblies',
  bible: 'Bible Study',
  ministries: 'Ministries',
  educational: 'Educational',
} as const;
type ResourceFilter = keyof typeof RESOURCE_FILTERS;

const resourceCategory = z.object({
  id: slug,
  filter: z.enum(Object.keys(RESOURCE_FILTERS) as [ResourceFilter, ...ResourceFilter[]]),
  title: text,
  items: z
    .array(
      z.object({
        title: text,
        description: text,
        /** null until the real address is supplied; rendered as a non-link. */
        url: z.url({ protocol: /^https?$/ }).nullable(),
        label: text,
      }),
    )
    .min(1),
});

export const resourceCategories = list(resourceCategory).parse(resourcesJson);

// ---------- Articles ----------

export const ARTICLE_FILTERS = {
  theology: 'Theology',
  prophecy: 'Prophecy',
  history: 'History',
  biography: 'Biography',
} as const;
type ArticleFilter = keyof typeof ARTICLE_FILTERS;

const articleBase = z.object({
  id: slug,
  filter: z.enum(Object.keys(ARTICLE_FILTERS) as [ArticleFilter, ...ArticleFilter[]]),
  label: text,
  title: text,
  /** ISO 8601 date, day optional: `2016-07-06` or `2025-02`. */
  date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?$/),
  excerpt: text,
  cta: z.object({ title: text, text, buttonText: text, href }).optional(),
});
const articleMeta = z.discriminatedUnion('kind', [
  articleBase.extend({ kind: z.literal('article') }),
  articleBase.extend({
    kind: z.literal('video'),
    video: z.object({ id: youtubeId, title: text }),
    watchMinutes: z.number().int().positive(),
  }),
  articleBase.extend({
    kind: z.literal('launch'),
    href: z.url({ protocol: /^https$/ }),
    actionText: text,
    metaText: text,
    lengthLabel: text,
  }),
]);

const bodies = import.meta.glob<string>('../content/articles/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const bodyFor = (id: string): string => {
  const body = bodies[`../content/articles/${id}.html`];
  if (body === undefined) throw new Error(`Missing article body: src/content/articles/${id}.html`);
  return body;
};

const WORDS_PER_MINUTE = 230;
const readMinutes = (html: string): number => {
  const words = html
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
};

export const articles = list(articleMeta)
  .parse(articlesJson)
  .map((meta) => {
    const body = bodyFor(meta.id);
    const duration = meta.kind === 'video' ? `${meta.watchMinutes} min watch` : `${readMinutes(body)} min read`;
    return { ...meta, body, duration };
  });
export type Article = (typeof articles)[number];

const orphans = Object.keys(bodies).filter((path) => !articles.some((a) => path.endsWith(`/${a.id}.html`)));
if (orphans.length) throw new Error(`Article bodies without metadata: ${orphans.join(', ')}`);

export const articlePath = (a: Pick<Article, 'id'>): string => `/articles/${a.id}.html`;
