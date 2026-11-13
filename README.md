# Narrow Path Ministries

Source for [www.narrowpathministries.net](https://www.narrowpathministries.net): biblical teaching, books,
sermons and the Thekkel Bible Course by Dr. Sunny Ezhumattoor. Built with [Astro](https://astro.build) as a
fully static site and deployed to GitHub Pages.

## Quick start

Requires Node.js 22.23.4 or newer.

```sh
npm install
npm run dev        # http://localhost:4321 with live reload
npm run build      # production build into dist/
npm test           # end-to-end, accessibility and SEO tests against dist/
```

`npm run verify` runs every quality gate in the same order as CI: type-check, lint, formatting, dead-code
scan, build and tests.

## Updating content

All content lives in plain data files. Every record is validated when the site builds, so a malformed URL,
unknown category or duplicate id stops the build with a clear error instead of publishing a broken page.
Counts shown on the site (books per language, episodes, resources, read times) are calculated from these files.

| To change…                       | Edit                             |
| -------------------------------- | -------------------------------- |
| Books & essays                   | `src/data/books.json`            |
| In-Reach PDFs                    | `src/data/inreach.json`          |
| Sermons (YouTube videos)         | `src/data/sermons.json`          |
| Resource links                   | `src/data/resources.json`        |
| Article list, dates, CTAs        | `src/data/articles.json`         |
| Article text                     | `src/content/articles/<id>.html` |
| Navigation, links, contact, name | `src/config/site.ts`             |

- **Add a book:** add an object to `books.json` (`id`, `title`, `description`, `language`, and the Google Drive
  `preview` / `view` URLs, or `null` until the file is shared). Order in the file is the order on the page.
- **Add a sermon:** add the 11-character YouTube id with a `category` and either an `episode` number or a
  `kicker` label such as `"Book Launch"`.
- **Add an article:** add its metadata to `articles.json` and its body to `src/content/articles/<id>.html`.
  It automatically gets its own page at `/articles/<id>.html`, a sitemap entry and structured data.
- **Resource without a website yet:** set `"url": null`; it is listed but not linked.
- **Change the email or phone number:** run `npm run contact:seal -- "new value"` and paste the printed string into
  `CONTACT_SEALED` in `src/config/site.ts`. Never write the plain value anywhere in the code.

### How the email and phone are protected

- They are stored only in sealed form (`src/lib/contact-seal.ts`), never in plain text in this repository or the
  built site. The tests scan every built file for the address and the number in all common formats.
- The page reveals them only after a person's first real input (moving the mouse, touching, scrolling with the wheel
  or pressing a key). Search-engine renderers and harvesting bots run the page's scripts but never produce such input,
  and events a script fabricates are ignored, so the contact details never appear in what they read. A tested check
  renders every page like a crawler does and confirms neither value is present.
- The contact areas carry `data-nosnippet`, so Google may not quote them even if they were ever seen.

## Project structure

```
src/
  config/site.ts        site identity, navigation, external links, sealed contact details
  data/*.json           content records (validated by src/lib/data.ts)
  content/articles/     article bodies
  lib/                  data validation, formatting, structured data, contact sealing
  layouts/BaseLayout    <head> (SEO, Open Graph, JSON-LD), navigation, footer, chatbot
  components/           chrome/, ui/, filter/, pdf/, sermons/, articles/, media/
  scripts/              shared browser modules: modal, filter/search, scroll lock
  styles/               base.css (all pages) → subpage/pdf-library/reader → pages/<page>.css
  pages/                one file per URL; articles/[id].astro generates article pages
scripts/seal-contact.ts  seals a new email or phone value (npm run contact:seal)
public/                 CNAME, robots.txt, icons, web manifest
tests/                  Playwright suites + a static server that mimics GitHub Pages
```

Styles are layered from shared to specific. Phase 1 preserves the original design exactly; the layering was
generated with automated checks that no rule changes precedence.

## Quality gates

| Gate                 | Tool                                                            |
| -------------------- | --------------------------------------------------------------- |
| Types                | `astro check` (TypeScript strictest)                            |
| Lint & accessibility | ESLint with `astro` and `jsx-a11y` rules                        |
| Formatting           | Prettier                                                        |
| Dead code            | Knip (unused files, exports, dependencies)                      |
| Behaviour            | Playwright on Chrome, Safari, Firefox, iPhone, Android and iPad |
| Accessibility        | axe-core, WCAG 2.2 AA                                           |
| SEO                  | metadata, canonical URLs, JSON-LD, sitemap, links, legacy URLs  |

## Deployment

Pushing to `master` runs the full CI suite, then builds and publishes to GitHub Pages
(`.github/workflows/deploy.yml`). The repository's **Settings → Pages → Source** must be set to
**GitHub Actions**. Pull requests run the same checks via `.github/workflows/ci.yml`.
