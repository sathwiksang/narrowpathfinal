import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Keeps the legacy portrait URL alive (Open Graph images and JSON-LD reference it) while the
 * image itself has a single source in src/assets.
 */
export const GET: APIRoute = async () =>
  new Response(await readFile(join(process.cwd(), 'src/assets/images/dr-sunny-ezhumattoor.jpg')), {
    headers: { 'Content-Type': 'image/jpeg' },
  });
