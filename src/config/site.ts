/** Single source of truth for site-wide identity, navigation and external links. */

export const SITE = {
  name: 'Narrow Path Ministries',
  legalName: 'Narrow Path Ministries, Inc.',
  url: 'https://www.narrowpathministries.net',
  founder: 'Dr. Sunny Ezhumattoor',
  themeColor: '#2c3e50',
  locale: 'en_US',
  address: { locality: 'Houston', region: 'TX', postalCode: '77040', country: 'US' },
  geo: { latitude: '29.7604', longitude: '-95.3698' },
} as const;

export const LINKS = {
  askDrSunny: 'https://chatgpt.com/g/g-697e8963d13481919d16c33647c1db89-ask-dr-sunny',
  facebook: 'https://www.facebook.com/thekkel45/',
  thekkel: 'https://www.thekkel.com',
} as const;

/**
 * Email and phone, sealed (src/lib/contact-seal.ts): the plain values exist nowhere in this repository or the built
 * site. To change one, run `npm run contact:seal -- "<new value>"` and paste the output here.
 */
export const CONTACT_SEALED = {
  email: 'GgkXGQQSQURUNA9CDAgYWgsKGg==',
  phone: 'RVBSWldEH1lBQl0eQFlEQFA=',
} as const;
export type ContactKind = keyof typeof CONTACT_SEALED;

export interface NavItem {
  readonly href: string;
  readonly label: string;
}

export const NAV: readonly NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/about.html', label: 'About' },
  { href: '/books.html', label: 'Books' },
  { href: '/articles.html', label: 'Articles' },
  { href: '/bible-course.html', label: 'Bible Course' },
  { href: '/resources.html', label: 'Resources' },
  { href: '/sermons.html', label: 'Sermons' },
  { href: '/integrity-values.html', label: 'In-Reach' },
];

export const FOOTER_LINKS: readonly NavItem[] = [
  { href: '/about.html', label: 'About Us' },
  { href: '/books.html', label: 'Books' },
  { href: '/articles.html', label: 'Articles' },
  { href: '/bible-course.html', label: 'Bible Course' },
  { href: '/resources.html', label: 'Resources' },
  { href: '/sermons.html', label: 'Sermons' },
];
