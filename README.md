# Vimal Selvarajan — Portfolio

A statically exported Next.js portfolio for Vimal Selvarajan, a UC Riverside computer science student and undergraduate researcher working across computer architecture, secure systems, computational genomics, embedded hardware, and software engineering.

## Production baseline

- Next.js 16.3 App Router and React 19 Server Components
- Node 24.19.0 LTS with npm 11.17.0, enforced exactly at install and validation time
- TypeScript 7.0.2 CLI checking with the supported TypeScript 6 compatibility API for ESLint
- ESLint 10, Vitest with V8 coverage, Playwright, axe, and three-run Lighthouse budgets
- Repository-authored Markdown rendered without raw HTML or JSX execution
- Static export for the `/Personal-Website` GitHub Pages base path
- Responsive profile and project assets with committed format, dimension, and size budgets

## Local development

Install the exact runtime from `.nvmrc` before installing dependencies:

```bash
nvm install
nvm use
npm ci
npm run dev
```

Open `http://localhost:3000`. Installs fail deliberately when Node or npm differs from the pinned toolchain.

The primary local gates are:

```bash
npm run validate
npm run test:e2e
npm run test:lighthouse
```

`npm run validate` checks the toolchain, ESLint, TypeScript, coverage, responsive assets, the production export, and bundle/image budgets. `npm run test:e2e` builds once and tests that export across Chromium desktop/mobile, Firefox, and WebKit. `npm run test:e2e:export` reuses an existing `out/` directory. Lighthouse also reuses `out/` and serves it on an isolated ephemeral port.

Use `npm run assets:generate` only when the source portrait or project artwork intentionally changes; `npm run assets:check` verifies all 12 profile outputs and 47 project outputs (17 detail WebP, 15 listing-card AVIF, and 15 listing-card WebP files).

## Content map

| Content | Location |
| --- | --- |
| Identity, links, navigation, production URL, and base path | `config/site.ts` |
| Project entries | `content/projects/*.md` |
| Research entries | `content/research/*.md` |
| Résumé data | `lib/resume-data.ts` |
| Project source images | `public/projects/` |
| Responsive profile and project images | `public/profile/`, `public/projects/responsive/` |
| Content schemas and repository | `lib/content-schema.ts`, `lib/content.ts` |
| Route and link validation | `lib/routes.ts`, `lib/site-routes.ts`, `lib/links.ts` |
| Shared route metadata | `lib/metadata.ts` |
| Social preview | `public/social-preview.png` |

Content is trusted and repository-authored, but it is still rendered as Markdown only: raw HTML and JSX are not executed. Internal content links must resolve to generated routes. External links must be valid HTTPS URLs; protocol-relative, HTTP, executable, credential-bearing, malformed, encoded-control, and control-character URLs are rejected.

### Project front matter

Each project filename must match its `slug`. Required fields are:

- `title`, `slug`, `summary`, and numeric `order`
- `stack` and an HTTPS `github` URL
- `image`, `imageAlt`, `imageWidth`, and `imageHeight`

An optional `cardImage` object (`src`, `width`, and `height`) can provide a smaller listing image. Project summaries must be unique. Projects are displayed by `order`, not filename.

### Research front matter

Each research filename must match its `slug`. Required fields are:

- `title`, `slug`, `summary`, and numeric `order`
- `status`, `researchArea`, `tools`, and `affiliation`

Markdown tables receive a keyboard-focusable horizontal reflow wrapper on narrow screens.

## Architecture and deployment

- Pages are Server Components unless interaction requires a client boundary.
- The résumé timeline remains a client component to preserve active-card behavior.
- Dynamic detail routes use `generateStaticParams`, `dynamicParams = false`, generated `Route` types, and `notFound()`.
- Navigation, sitemap entries, résumé related-work links, Markdown links, and content assets are validated from canonical repositories.
- Every route emits its own canonical URL, title, description, Open Graph URL/image fields, and Twitter card fields.
- Pushes to `main` validate one static export and deploy that same `out/` artifact to GitHub Pages.

## Repository-owner checklist

The repository has no configured remote in this workspace, so settings-level controls cannot be changed here. The owner should:

- enable secret scanning and push protection;
- protect `main` and require the quality, dependency-review, and CodeQL checks;
- require pull-request review and dismiss stale approvals;
- restrict GitHub Actions to approved, full-SHA-pinned actions; and
- periodically confirm the Pages environment protection and deployment source.

GitHub Pages controls production response headers. The current published Pages origin returns HSTS, but repository-defined CSP, `X-Content-Type-Options`, `Referrer-Policy`, frame, and permissions headers are unavailable on this host. That limitation is accepted for this public static site because it has no authentication, forms, APIs, cookies, analytics, or sensitive runtime data. The remediated export, including the new social and responsive assets, has not been deployed from this workspace because no remote is configured; the tracked deployment smoke checks remain pending until the next deployment.

No analytics or real-user monitoring is collected, so field INP data is unavailable. Three-run CI Lighthouse medians remain the enforced performance proxy. See `docs/codebase-audit.md` for the verification evidence, accepted constraints, and maintenance record.
