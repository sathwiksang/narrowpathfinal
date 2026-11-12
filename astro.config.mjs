// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.narrowpathministries.net',
  // Emit `about.html` (not `about/index.html`) so every existing URL keeps working unchanged.
  build: { format: 'file' },
  // Astro 7 defaults to 'jsx' whitespace rules, which drop spaces between inline elements.
  compressHTML: true,
});
