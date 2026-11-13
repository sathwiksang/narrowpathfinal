/**
 * Contact details are stored and shipped only in sealed form (UTF-8 bytes XORed with a fixed key, then base64), so
 * the plain email address and phone number appear nowhere in the repository, the built HTML/JS, or the page a
 * crawler renders. `ContactLink` unseals them in the browser after the first genuine user input.
 *
 * This module has no imports so `npm run contact:seal` can run it directly with Node.
 */
const KEY = new TextEncoder().encode('narrow-path/matthew-7:14');

const xor = (bytes: Uint8Array): Uint8Array => bytes.map((byte, i) => byte ^ (KEY[i % KEY.length] ?? 0));

export const seal = (plain: string): string => btoa(String.fromCharCode(...xor(new TextEncoder().encode(plain))));

export const unseal = (sealed: string): string =>
  new TextDecoder().decode(xor(Uint8Array.from(atob(sealed), (char) => char.charCodeAt(0))));
