# Development

This document covers the local workflow and, in particular, how Lilac's tests
are structured and run. For the public API and usage, see the [README](README.md).

## Prerequisites

- **Node.js** ≥ 20 (the toolchain, vitest 4, requires 20+; CI exercises 20–26).
- **pnpm** — `npm i -g pnpm`.
- **Docker** — only needed to run or refresh the end-to-end visual baselines in
  the pinned environment (see [End-to-end tests](#end-to-end-tests-playwright)).

```bash
pnpm install
```

## Common tasks

| Command | What it does |
| --- | --- |
| `pnpm build` | Compile the library to `dist/`. |
| `pnpm dev` | `tsc --watch`. |
| `pnpm typecheck` | Type-check without emitting. |
| `pnpm test` | Unit + snapshot suites (vitest, jsdom). |
| `pnpm test:watch` | Vitest in watch mode. |
| `pnpm test:e2e` | Playwright browser suite (needs a local browser). |
| `pnpm test:e2e:novisual` | The browser suite minus the `@visual` screenshot specs. |
| `pnpm test:e2e:docker` | Run the browser suite inside the pinned Playwright image. |
| `pnpm test:e2e:update` | Refresh the visual baselines inside the pinned image. |
| `pnpm test:all` | `test` + `typecheck` + `test:e2e`. |

## Testing architecture

Lilac is tested at two altitudes, deliberately split so the fast feedback loop
stays fast and the slow, environment-sensitive checks stay isolated. This mirrors
the current guidance to separate functional feedback from visual regression and
quarantine pixel flake to a controlled environment.[^argos][^testquality]

### Unit and snapshot tests (vitest + jsdom)

Everything under `test/` runs in jsdom and covers behavior that does not need a
real rendering engine:

- **`test/*.test.ts`** — sanitizer rules (stored-XSS guard), undo/redo bounds,
  toolbar wiring, markdown, find/replace, plugins, and other core behavior.
- **`test/golden.test.ts`** — golden-master fixtures: each `test/fixtures/golden/*.html`
  input is loaded through the editor and the sanitized, normalized output is
  pinned as a snapshot.
- **`test/snapshot/`** — the rendering contract (DOM structure, classes,
  attributes) and the accessibility tree, pinned via the canonical serializer.
- **`test/helpers/serialize.ts`** — a dependency-free serializer that produces a
  stable, pretty-printed canonical form of a DOM subtree (and an ARIA tree). It
  is written to run **identically** under jsdom and, via `page.evaluate`, inside
  the browser, so both layers compare the same normalized output rather than raw
  `innerHTML` (whose attribute order and whitespace vary between engines).

### End-to-end tests (Playwright)

`jsdom` cannot run `document.execCommand`, so the toolbar and keyboard-shortcut
formatting paths — the heart of a WYSIWYG editor — only ever run for real in a
browser. The specs in `e2e/editor.spec.ts` drive the **built** library in
Chromium and verify four layers side by side: behavior, canonical HTML, the real
accessibility tree, and actual pixels.

Chromium only: the core is framework-agnostic, not browser-agnostic, and a single
engine keeps rendering deterministic.[^testquality]

#### Visual baselines and the pinned image

Screenshot baselines are **source code** and are committed to git, reviewed like
any other change.[^testquality] The hard part is that fonts and anti-aliasing
differ between operating systems, so a baseline generated in one environment
flakes when compared in another.[^font][^adequatica] The fix the ecosystem has
converged on is to make **one environment the single source of truth** — the
official, version-matched Playwright Docker image — and to generate *and* compare
baselines only there.[^argos][^adequatica]

Accordingly:

- Baselines live in `e2e/**/*-snapshots/` with the `-chromium-linux` suffix.
- The DOM/ARIA (`.txt`) baselines are environment-independent (pure
  serialization). Only the two `.png` screenshots are font-sensitive.
- Regenerate the PNGs **only** in the pinned image, never on a bare host:

  ```bash
  pnpm test:e2e:update
  ```

  This runs `mcr.microsoft.com/playwright:v1.59.0-noble` — the same image the CI
  e2e job uses — so screenshots compare byte-for-byte. When you bump
  `@playwright/test`, bump the image tag in `package.json` and
  `.github/workflows/test.yaml` together, then refresh the baselines.

- `toHaveScreenshot` carries a small `maxDiffPixels` budget with animations
  disabled, absorbing the residual jitter that survives an identical
  environment.[^oneuptime]

#### `@visual` tag

The two screenshot specs are tagged `@visual`. Run the functional subset with
`pnpm test:e2e:novisual` (`--grep-invert @visual`) for fast local feedback;
CI runs the full suite in the pinned container.[^argos]

## Continuous integration

`.github/workflows/test.yaml` runs on `pull_request` and on push to `main`:

- **unit** — `pnpm typecheck` + `pnpm test` on the runner.
- **e2e** — the Playwright suite inside `mcr.microsoft.com/playwright:v1.59.0-noble`.

The config also sets `forbidOnly`, `retries`, and a single worker under `CI`, so a
stray `test.only` fails the build, flake is retried-and-recorded rather than
hidden, and screenshots capture without resource contention.[^config][^testquality]

Other workflows: `checkcompatibility.yaml` (Node matrix), `takesnap.yaml`,
`toghpage.yaml` (docs to GitHub Pages), and `tonpm.yaml` (release publishing).

## References

<!-- Industry guidance consulted for the CI/visual-testing setup above. -->

[^testquality]: Playwright Visual Regression: Baselines, Flake & CI Guide (2026). https://testquality.com/playwright-visual-regression-guide/
[^argos]: Playwright Visual Regression Testing in CI: Complete Guide. https://argos-ci.com/blog/playwright-visual-regression-testing-ci
[^adequatica]: Operating System Independent Screenshot Testing with Playwright and Docker. https://adequatica.medium.com/operating-system-independent-screenshot-testing-with-playwright-and-docker-6e2251a9eb32
[^font]: Fix Font Rendering Differences in Playwright Screenshots. https://app.thetestingacademy.com/blog/playwright-screenshot-font-rendering-differences
[^config]: Playwright Test Automation in CI/CD: Best Practices 2026. https://it-next-gen.de/en/blog/playwright-test-automation-cicd-2026
[^oneuptime]: How to Implement Playwright Visual Testing. https://oneuptime.com/blog/post/2026-01-27-playwright-visual-testing/view
