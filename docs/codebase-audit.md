# 2026 production standards audit

Audit date: 2026-08-11

## Outcome

The portfolio has been remediated to a modern static-production baseline while retaining GitHub Pages, every public route, the visual design, and the résumé timeline interaction. The audit uses WCAG 2.2 AA, OWASP ASVS 5.0 principles appropriate to a public static site, current Core Web Vitals thresholds, the installed Next.js 16.3 documentation, and GitHub supply-chain hardening guidance.

## Findings and disposition

| ID | Severity | Finding | Evidence and remediation | Status |
| --- | --- | --- | --- | --- |
| PERF-01 | High | The homepage repeatedly produced an approximately 4.8-second mobile LCP because a 2160×1620, 461 KiB portrait was discovered late and rendered at a much smaller size. | Replaced it with an eager, high-priority responsive `<picture>`, one AVIF candidate-set preload, fixed dimensions, and committed 384/640/768/1024 AVIF, WebP, and JPEG variants. Every profile variant is below the 120 KiB gate; the largest is 32.9 KiB. Project detail heroes use 17 checked responsive WebP variants, while listing cards use 15 AVIF and 15 WebP variants. Representative routes now have no oversized-image finding. | Resolved |
| SUPPLY-01 | High | CI used mutable major action tags and materially outdated action releases. | Pinned checkout 7.0.1, setup-node 7.0.0, cache 6.1.0, upload-artifact 7.0.1, upload-pages-artifact 5.0.0, configure-pages 6.0.0, and deploy-pages 5.0.0 to verified full commit SHAs with version comments. Checkout credential persistence is disabled. | Resolved |
| SUPPLY-02 | High | Dependency review, code scanning, registry-signature verification, timeouts, and evidence retention were incomplete. | Added full-SHA-pinned dependency-review and CodeQL workflows, low-severity npm audit, `npm audit signatures`, job timeouts, report retention, and `npx --no-install`. | Resolved |
| TOOL-01 | High | Runtime and type definitions drifted: Node 22 was no longer Active LTS and `@types/node` targeted 26. | Pinned Node 24.19.0 and bundled npm 11.17.0 in `.nvmrc`, engines, `packageManager`, strict `devEngines`, CI, and a preinstall guard; aligned `@types/node` to 24. | Resolved |
| TOOL-02 | High | The requested TypeScript 7 and ESLint 10 releases require compatibility handling because TypeScript 7 has no legacy JavaScript compiler API and Next’s lint plugins predate ESLint 10’s rule API. | Type checking and Next builds use the project-local TypeScript 7.0.2 CLI. The isolated lint process maps TypeScript API imports to Microsoft’s side-by-side TypeScript 6 package and uses the official `@eslint/compat` adapter with ESLint 10.8.1. | Resolved |
| CONTENT-01 | Medium | Repository content was compiled as executable MDX even though the corpus used plain Markdown. | Migrated `.mdx` files to `.md`, removed `next-mdx-remote`, and render with `react-markdown` plus GFM and `skipHtml`. Raw HTML and JSX are not executed. | Resolved |
| DATA-01 | Medium | Featured-content fields, selectors, résumé flags, and stale exports created unused parallel APIs. | Removed `featured`, `getFeatured`, `featuredOnHome`, and related unused types/components/styles. Pages consume the validated ordered repositories directly. | Resolved |
| LINK-01 | High | Protocol-relative URLs such as `//host` were classified as internal; malformed, encoded-control, HTTP, executable, and credential-bearing destinations were not rejected consistently. | Centralized URL classification and external-link rendering. Internal Markdown/navigation/résumé links must resolve to generated routes; external links are HTTPS-only and receive locked new-tab safety plus screen-reader text. | Resolved |
| ROUTE-01 | High | Navigation, content, and résumé relationships could silently target nonexistent routes. | Added generated `Route` types, a canonical route set, build-time referential validation, and adversarial unit/browser coverage. | Resolved |
| META-01 | Medium | Detail and index routes had incomplete or inherited social metadata. | Added one route metadata builder. Every route now supplies a canonical URL, title, description, Open Graph URL and shared 1200×630 image fields, plus Twitter card fields. | Resolved |
| CONTENT-02 | Medium | Combat Chess duplicated the buck-converter claim and `/about` was orphaned. | Corrected Combat Chess to the verified C++/CMake/GoogleTest/Valgrind/Gcov/Lcov summary, enforced unique project summaries, and added About to footer navigation only. | Resolved |
| A11Y-01 | High | Skip-link focus, section naming, research hierarchy, narrow reflow, table overflow, landscape navigation, and forced-colors behavior were incompletely covered. | Made the main target programmatically focusable, corrected semantic headings/names, added a keyboard-focusable table reflow wrapper, capped landscape mobile navigation, and added 320 px, landscape, forced-colors, skip-link, route×theme axe, and open-menu tests. | Resolved |
| RELIABILITY-01 | Medium | Malformed percent encoding could crash the local export server. | Added explicit 400 handling, canonical root confinement including symlink checks, MIME protection, and a regression test that verifies the server remains available. | Resolved |
| TEST-01 | Medium | Browser checks rebuilt the same export repeatedly, the mobile theme test targeted a hidden desktop control, and two résumé screenshots were stale. | Browser and Lighthouse checks now reuse one validated export; Lighthouse owns an ephemeral port/profile. Mobile theme navigation scopes through the open menu, and only the reviewed résumé baselines are refreshed. | Resolved |
| HOST-01 | Medium | GitHub Pages does not expose repository-defined CSP, frame, permissions, referrer, or `nosniff` response headers. | The current published Pages origin was verified to return HSTS. The missing custom headers are accepted because the site has no authentication, forms, APIs, cookies, analytics, or sensitive runtime data; application-controlled content and URL execution paths are constrained. The remediated export has not been deployed from this workspace because no remote is configured. | Accepted host constraint |
| OBS-01 | Low | No field INP or other real-user Core Web Vitals data exists. | CI enforces three-run lab medians. Analytics/RUM remains intentionally absent to avoid adding a new external runtime dependency or data collection. | Accepted constraint |
| SETTINGS-01 | Medium | Secret scanning, push protection, branch protection, and required checks are repository settings and no remote is configured in this workspace. | Tracked CodeQL and dependency-review workflows are present. The remaining settings are recorded in the README owner checklist. | Owner action required |

## Automated acceptance gates

- Exact Node 24.19.0/npm 11.17.0 toolchain validation and deterministic `npm ci`.
- ESLint 10, TypeScript 7, Next route generation, production export, and bundle budgets.
- Vitest V8 coverage over logic-bearing content, schema, image, link, route, metadata, preview-server, and Lighthouse-audit modules: 90% lines/statements/functions and 85% branches.
- Zero npm vulnerabilities at low severity and no invalid or missing registry signatures.
- Exact responsive profile and project dimensions/formats: 12 profile outputs at or below 122,880 bytes and 47 project outputs (17 detail WebP, 15 listing-card AVIF, and 15 listing-card WebP) at or below 204,800 bytes.
- Semantic route checks across Chromium desktop/mobile, Firefox, and WebKit.
- Axe on every sitemap route in light and dark themes plus the open mobile-menu state, with no undocumented violations.
- 320 px portrait, landscape, forced-colors, Markdown-table overflow, skip-link activation, metadata completeness, route integrity, and malformed-preview regression coverage.
- Three-run median Lighthouse gates on representative routes: performance and accessibility at least 95, LCP at most 2.5 seconds, CLS at most 0.1, TBT at most 200 milliseconds, and no oversized-image finding.
- Tracked deployment smoke checks for the Pages site, all sitemap routes, robots, sitemap, icon, social image, and a project asset; these run after the next deployment.

## Verification evidence (2026-08-11)

- A clean `npm ci` installed 641 packages using the exact Node 24.19.0/npm 11.17.0 toolchain. The full `npm run validate` gate passed with TypeScript 7.0.2, ESLint 10.8.1, asset validation, static export, and bundle budgets.
- Vitest passed 95 of 95 tests. V8 coverage reached 98.51% statements, 96.05% branches, 100% functions, and 99.57% lines, exceeding the per-file thresholds of 90% statements, 85% branches, 90% functions, and 90% lines.
- The production build exported 17 static pages. Asset checks passed for all 12 profile outputs and all 47 project outputs: 17 detail WebP, 15 listing-card AVIF, and 15 listing-card WebP files.
- Playwright reported 53 passes from 96 cases, with 43 intentional project-matrix skips. Semantic coverage ran across Chromium desktop/mobile, Firefox, and WebKit; all six Chromium visual baselines passed, as did all-impact axe coverage for sitemap routes in both themes and the open-menu state.
- A fresh-cache registry check verified signatures for all 641 installed packages and 150 provenance attestations. `npm audit --audit-level=low` reported zero vulnerabilities.

| Route | Performance | Accessibility | Median LCP | Median CLS | Median TBT | Oversized-image findings |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 99 | 100 | 2,159 ms | 0 | 7 ms | 0 |
| `/projects/` | 98 | 100 | 2,381 ms | 0 | 2 ms | 0 |
| `/projects/12v-to-3v3-buck-converter/` | 99 | 100 | 2,238 ms | 0 | 5 ms | 0 |
| `/research/optimal-read-selection/` | 99 | 100 | 2,167 ms | 0 | 7 ms | 0 |
| `/resume/` | 98 | 100 | 2,322 ms | 0 | 8 ms | 0 |

These values are three-run Lighthouse medians against the validated local export. No field INP or other RUM data is collected; the lab gates remain the accepted proxy. This export, including the new social and responsive assets, was not deployed because the workspace has no configured remote. Only the current published origin's HSTS behavior was verified. The tracked deployment smoke workflow remains pending until the next deployment, as do the repository-owner settings listed below.

## Maintenance rules

- Keep the production URL in `config/site.ts`; derive the Pages base path from it.
- Add content through validated `.md` front matter and keep project summaries unique.
- Keep internal links within the generated route set and external links on validated HTTPS destinations.
- Regenerate responsive assets only with `npm run assets:generate`; do not hand-edit derived binaries.
- Update action SHAs together with their version comments after verifying upstream release tags and action inputs.
- Refresh visual snapshots only for reviewed, intentional rendering changes.
- Revisit the hosting layer if custom security headers or sensitive runtime features become requirements.
- Revisit field monitoring only if collecting production performance data becomes proportionate and privacy requirements are defined.
