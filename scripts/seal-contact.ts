// Usage: npm run contact:seal -- "new value"   → prints the sealed string to paste into CONTACT_SEALED (src/config/site.ts).
import { seal, unseal } from '../src/lib/contact-seal.ts';

const value = process.argv[2];
if (!value) {
  console.error('Usage: npm run contact:seal -- "<email address or phone number>"');
  process.exit(1);
}
const sealed = seal(value);
if (unseal(sealed) !== value) throw new Error('Round trip failed; the value was not sealed.');
console.log(sealed);
