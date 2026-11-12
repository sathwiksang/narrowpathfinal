import { CONTACT } from '../config/site';

export type ContactKind = keyof typeof CONTACT;

/**
 * Contact details never appear in plain text in the HTML: they are reversed and base64-encoded
 * at build time and decoded in the browser (src/components/chrome/ContactLink.astro).
 */
export const encodedContact = (kind: ContactKind): string => btoa([...CONTACT[kind]].reverse().join(''));
