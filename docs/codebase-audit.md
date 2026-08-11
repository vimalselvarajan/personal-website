# Codebase audit

## Outcome

The portfolio now has an explicit static-hosting contract, one validated content repository, narrower data flow into client components, deterministic dependency/runtime versions, and automated quality gates. The current routes, content, and visual design are preserved.

## Findings and remediation

| ID | Severity | Finding | Remediation | Status |
| --- | --- | --- | --- | --- |
| DEP-01 | Critical | The canonical URL targeted a GitHub Pages project path, but the build had no export or base-path contract. | Added static export, `/Personal-Website` base path, trailing-slash routing, prefixed public assets, a production-like preview server, and Pages deployment automation. | Resolved |
| DATA-01 | High | Featured content, content ordering, experience selection, and test routes had competing sources of truth. | MDX owns featured selection; experience data has explicit classification; pages, sitemap, metadata, and tests derive from canonical repositories. | Resolved |
| DATA-02 | High | Frontmatter validation allowed weak invariants and route input was interpolated into filesystem paths. | Added strict Zod schemas, corpus-level uniqueness/featured checks, image existence and dimension checks, server-only access, and index-based route lookup. | Resolved |
| TEST-01 | High | Browser validation was a monolithic custom script with duplicated content and no CI lifecycle. | Replaced it with Vitest and Playwright suites covering discovered routes, browsers, accessibility, interactions, metadata, assets, 404s, responsiveness, and visuals. | Resolved |
| BUILD-01 | High | `latest` dependency declarations and generated `next-env.d.ts` changes made builds noisy and nondeterministic. | Pinned packages and Node/npm, added deterministic type generation, ignored the generated declaration file, and added dependency update automation. | Resolved |
| UI-01 | Medium | External-link and MDX-link behavior was inconsistent and caller-overridable. | Locked new-tab safety attributes and added explicit internal, HTTP(S), email, telephone, and rejected-protocol behavior. | Resolved |
| UI-02 | Medium | Mobile navigation lacked verified Escape and focus behavior. | Added focus entry/return, Escape handling, desktop-breakpoint cleanup, and keyboard tests. | Resolved |
| PERF-01 | Medium | A below-fold homepage image was high priority and responsive size hints exceeded their capped container. | Removed the incorrect homepage priority, capped responsive hints, and limited eager/high priority to the measured project-index LCP image. | Resolved |
| A11Y-01 | Medium | The subtle light-mode foreground narrowly missed WCAG AA contrast. | Increased subtle foreground contrast and enforced zero serious/critical axe violations. | Resolved |
| HOST-01 | Low | Custom application response headers were absent. | The preview models immutable asset caching, gzip, and MIME protection. GitHub Pages controls production headers; this limitation is documented and app-controlled URL/link safety is enforced. | Accepted host constraint |

## Verified baseline

- Strict TypeScript, ESLint, schema tests, content integrity, and dependency audits are automated.
- All 18 Next.js outputs are static or statically generated.
- Route JavaScript gzip baselines are stored in `performance-budgets.json`; CI rejects growth above 5%.
- Chromium desktop/mobile and Firefox browser suites pass locally. WebKit is part of CI, where Playwright installs its Linux system dependencies.
- Axe reports no serious or critical violations on the home, project detail, and résumé routes.
- Lighthouse runs three times per representative route in CI and requires performance/accessibility scores of at least 95, LCP at most 2.5 seconds, CLS at most 0.1, and TBT at most 200 milliseconds.
- The local three-run mobile baseline scored 98–99 for performance and 100 for accessibility; the slowest representative median LCP was 2,477 milliseconds.

## Maintenance rules

- Add portfolio content only through validated MDX or résumé/site data; do not duplicate route lists in tests.
- Keep filesystem and schema logic behind `lib/content.ts`; client components receive narrow serializable props.
- Update visual snapshots and bundle baselines only alongside a reviewed, intentional UI or dependency change.
- Do not add caching, Suspense, client boundaries, or optimization flags without a measured bottleneck.
- GitHub Pages cannot set repository-defined HTTP headers. Re-evaluate the hosting layer if a strict CSP or custom header policy becomes a requirement.
