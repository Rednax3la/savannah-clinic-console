# Clinic Stock Console

Vue 3 + TypeScript stock console using DummyJSON. UI state is local, list state is in Vue Router, and authentication is in Pinia.

## Local setup

Use Node **22.17.1** (`.nvmrc`), or a supported Node 22 release >=22.13. npm 10 works; npm 12 is not required.

```sh
npm ci
npm run dev
```

Demo credentials: **emilys / emilyspass**. No registration, API key or secret environment variable is required. `.env.example` documents the optional public API base URL.

## Commands

| Command                | Purpose                                                                  |
| ---------------------- | ------------------------------------------------------------------------ |
| `npm run dev`          | Development server                                                       |
| `npm run format:check` | Fail on unformatted files                                                |
| `npm run lint`         | ESLint; warnings fail                                                    |
| `npm run type-check`   | Strict application, configuration and test types                         |
| `npm run test:run`     | Vitest/Happy DOM behavior tests                                          |
| `npm run build`        | Type-check and build `dist`                                              |
| `npm run preview`      | Serve the production build locally                                       |
| `npm run test:browser` | Verify the built app in installed Chrome with deterministic API fixtures |
| `npm run prepare`      | Install the local Husky hooks                                            |

`test:browser` requires a completed build and installed Chrome/Chromium. Set `CHROME_PATH` if it is not at a detected location. It starts and stops a local preview on port 4178. Screenshots go to ignored `test-results/`. This test does not deploy or authenticate against a real account.

## Project files

- `src/api`: HTTP transport and DummyJSON endpoints.
- `src/composables`: request lifecycles, categories, last-item cache and session corrections.
- `src/stores/auth.ts`: in-memory tokens/user, refresh coordination and expiry scheduling.
- `src/utils`: URL normalization, safe destinations and browser storage access.
- `src/views`: login, stock list, detail and missing-route screens.
- `src/components`: presentation, controls, status states and the stock editor.
- `docs/design.md`: original design, left unchanged by this implementation.

## Factual API behavior and session scope

Login and refresh request a one-minute access token. A JWT-expiry timer and request preflight coordinate refresh without polling public products. Reload restoration exchanges the refresh token and fetches `/auth/me`. Transient failures preserve the refresh credential and offer retry; permanent credential failures require sign-in. A generation check prevents a late refresh restoring a signed-out session.

Intended destinations use **sessionStorage only**, with an in-memory fallback. Only the stock list and numeric item routes are accepted. Login consumes the destination once. Item links carry a validated `from` list URL for the Back to stock action.

DummyJSON search sorting and `limit=0` were checked against the live API during implementation. The list fetches the complete search-matching set with selected fields. Category filtering and stock overrides are applied before deterministic sorting and pagination. `q`, `category`, `sortBy`, `order` and `page` remain URL-owned. Newest/oldest use `meta.createdAt`, with ID breaking ties; equal source dates therefore produce a stable order. Totals come from returned data, not a hardcoded catalogue size.

**Mock writes are not persistent.** Confirmed count corrections are overlaid on subsequent GET results for the signed-in tab session. Only corrected counts and their user ID are stored in sessionStorage; they survive reload and are cleared on sign-out or account change. They are not shared with another browser or colleague. The detail cache itself holds only the last viewed item.

Storage-denied browsers retain an in-memory session, but cannot restore it after reload. Category data is cached for the current application lifetime.

Use `/?delay=2000` to forward DummyJSON's real server delay to product-list requests. Detail requests also accept `?delay=2000`. The client treats HTTP errors as failures even if the response contains valid JSON. Browser verification injects 500 responses for deterministic recovery checks.

## CI and local commits

`.github/workflows/ci.yml` runs on PRs targeting `main` and pushes to `main`. It installs from the lockfile, checks formatting/lint/types/tests, validates every PR commit with commitlint, and builds. Any failing command fails the job. Configure repository branch protection to require **CI / Required checks** before merging; branch protection is not configured by a workflow file alone.

Husky installs a local `commit-msg` hook through `npm ci` / `prepare`. Use Conventional Commits, for example `feat: implement stock corrections`. Formatting changes should be committed separately from features where practical. No commits were created by the implementation agent.

A bad-message check without a commit (PowerShell):

```powershell
$messageFile = Join-Path $env:TEMP 'savannah-commitlint-check.txt'
Set-Content -LiteralPath $messageFile -Value 'this is not a conventional commit' -Encoding ascii
& 'C:\Program Files\Git\bin\bash.exe' .husky/_/commit-msg "$messageFile"
# Expected: nonzero exit code. This invokes the installed hook and creates no commit.
Remove-Item -LiteralPath $messageFile
```

## Vercel configuration (not deployed)

| Setting           | Value           |
| ----------------- | --------------- |
| Framework         | Vite            |
| Node.js           | 22.x            |
| Install command   | `npm ci`        |
| Build command     | `npm run build` |
| Output directory  | `dist`          |
| Root directory    | Repository root |
| Production branch | `main`          |
| Required secrets  | None            |

Import the repository through Vercel's Git integration and select `main` as the production branch. Merges into `main` then trigger Vercel production builds; GitHub Actions does not deploy. Protect `main` with the required CI check. The root `vercel.json` configuration includes the history-mode SPA fallback to `/index.html`; verify a hard refresh of `/items/17` after the first deployment.

**Public deployment URL: [TO BE FILLED BY AUTHOR AFTER DEPLOYMENT]**

The pre-deployment browser checklist is in [docs/browser-checklist.md](docs/browser-checklist.md).

## Section 1: author-owned decision log

[AUTHOR TO WRITE: at least three actual decisions, rejected alternatives and reasons. Reference the original design. Proposed factual design corrections are listed in `docs/implementation-notes.md`; they have not been applied.]

## Section 4: author-owned AI reflection

[AUTHOR TO WRITE: per-section AI use; tools/workflow; a helpful suggestion and prompt; a wrong/incomplete suggestion and how it was caught; two decisions made without AI; code you would struggle to defend.]

[AUTHOR TO WRITE: actual time spent and verify historical entries in `docs/ai-log.md`.]
