/** schema.org JSON-LD builders. Every page emits one @graph linking these nodes by @id. */
import { LINKS, SITE } from '../config/site';

export const absoluteUrl = (path: string): string => new URL(path, SITE.url).href;

/** Legacy public URL of the founder portrait; kept stable because social caches reference it. */
export const PORTRAIT_PATH = '/Images/about/johnmathew.jpg';
const LOGO_PATH = '/icon-512.png';

export const ID = {
  organization: absoluteUrl('/#organization'),
  website: absoluteUrl('/#website'),
  founder: absoluteUrl('/#founder'),
} as const;

type Node = Record<string, unknown>;
export interface Crumb {
  readonly name: string;
  readonly path: string;
}

export const organization = (): Node => ({
  '@type': 'Organization',
  '@id': ID.organization,
  name: SITE.name,
  legalName: SITE.legalName,
  url: absoluteUrl('/'),
  logo: { '@type': 'ImageObject', url: absoluteUrl(LOGO_PATH), width: 512, height: 512 },
  image: absoluteUrl(PORTRAIT_PATH),
  description: 'Christian ministry dedicated to biblical teaching, theological education, and spiritual growth',
  address: {
    '@type': 'PostalAddress',
    addressLocality: SITE.address.locality,
    addressRegion: SITE.address.region,
    postalCode: SITE.address.postalCode,
    addressCountry: SITE.address.country,
  },
  founder: { '@id': ID.founder },
  sameAs: [LINKS.facebook, LINKS.thekkel],
});

export const founder = (): Node => ({
  '@type': 'Person',
  '@id': ID.founder,
  name: SITE.founder,
  alternateName: ['Dr. John Mathew', 'John Thekkel Mathew', 'Sunny Ezhumattoor'],
  honorificPrefix: 'Dr.',
  jobTitle: 'Founder and Theologian',
  description: 'Distinguished theologian, author, and biblical scholar',
  image: absoluteUrl(PORTRAIT_PATH),
  url: absoluteUrl('/about.html'),
  worksFor: { '@id': ID.organization },
  sameAs: [LINKS.facebook],
});

export const website = (): Node => ({
  '@type': 'WebSite',
  '@id': ID.website,
  url: absoluteUrl('/'),
  name: SITE.name,
  description: 'Biblical teaching, online Bible courses, and theological resources',
  publisher: { '@id': ID.organization },
  inLanguage: 'en-US',
});

export const breadcrumbs = (url: string, crumbs: readonly Crumb[]): Node => ({
  '@type': 'BreadcrumbList',
  '@id': `${url}#breadcrumb`,
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: absoluteUrl(c.path),
  })),
});

export const webPage = (opts: {
  url: string;
  type: string;
  name: string;
  description: string;
  hasBreadcrumb: boolean;
  mainEntity?: Node;
}): Node => ({
  '@type': opts.type,
  '@id': `${opts.url}#webpage`,
  url: opts.url,
  name: opts.name,
  description: opts.description,
  isPartOf: { '@id': ID.website },
  about: { '@id': ID.organization },
  primaryImageOfPage: { '@type': 'ImageObject', url: absoluteUrl(PORTRAIT_PATH) },
  inLanguage: 'en-US',
  ...(opts.hasBreadcrumb ? { breadcrumb: { '@id': `${opts.url}#breadcrumb` } } : {}),
  ...(opts.mainEntity ? { mainEntity: opts.mainEntity } : {}),
});
