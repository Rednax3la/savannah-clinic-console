## 19:42

Tool: Claude Code

Task:
Asked it to scaffold typed DummyJSON API interfaces.

What I kept:
Product/User types.

What I changed:
Removed a generic repository layer since it added abstraction with no value.

---

## 20:10

Tool: Codex

Task:
Asked it to review search behavior under slow network conditions.

Finding:
It pointed out that debouncing did not prevent stale responses.

Action:
The review recommended AbortController cancellation. It was not implemented in the scaffold reviewed at that time.

What I learned:
Debouncing and cancellation solve different problems.

## 2026-09-11 to 2026-09-12: Current implementation task

Tool: Codex

Request: implement and test the required clinic console functionality and corrections from the previous repository review; configure local commit checks, GitHub Actions and Vercel readiness without committing, pushing or deploying.

Work performed: authentication and expiry coordination, URL-driven stock queries, AbortController cancellation and request ownership, detail/stock editing, session correction handling, accessibility/responsive changes, behavioral tests and project tooling. This entry records this task only; it does not verify the earlier historical entries or supply the author's assessment reflection.

##Example of Prompt used:
You previously reviewed this repository against the Savannah Informatics
Web Engineer assessment.

Now implement the fixes and required functionality.

You MAY modify project files.

Do NOT:

- make any git commits
- push anything
- deploy anything
- modify docs/design.md except where a factual contradiction must be corrected,
  and if so list the proposed change instead of editing it
- write my Section 1 decision log for me
- write my Section 4 AI reflection for me
- fabricate AI-log entries
- add optional features such as bulk correction, virtualization or offline mode
  unless they are necessary for a required behavior

I will handle all git commits manually.

The goal is to leave the repository IMPLEMENTED, TESTED, CI-READY,
and VERCEL-READY.

Before editing:

1. Read the full repository.
2. Read docs/design.md.
3. Read the Savannah assessment.
4. Re-read your previous review if available.
5. Print a concise implementation plan grouped into:
   - architecture corrections
   - required application functionality
   - tests
   - tooling / CI
   - deployment readiness

Then perform the work.

============================================================
A. AUTHENTICATION
============================================================

Implement the complete DummyJSON authentication flow.

Required:

- POST /auth/login
- request expiresInMins: 1
- GET /auth/me where appropriate
- POST /auth/refresh
- access token held in memory / Pinia
- refresh token persisted in sessionStorage
- current user held in Pinia
- session restoration after browser reload
- preserve the intended internal route through reauthentication
- no registration functionality

Important:
Do NOT assume the public /products endpoints will return 401 when the
access token expires.

Design and implement deliberate expiry detection that works with
DummyJSON.

Prefer an approach based on the actual token expiry / authenticated
endpoint behavior instead of repeatedly polling unnecessarily.

When the access token expires:

- attempt exactly one shared refresh when multiple requests notice expiry
- concurrent callers should await the same refresh promise
- a refresh request must never recursively trigger another refresh
- retry an appropriate failed authenticated operation once after refresh
- distinguish invalid/expired refresh credentials from transient network failure
- if restoration/refresh fails permanently, clear auth state and redirect to login
- preserve the route the user was using
- after successful login return them to that route
- never allow an external/open redirect
- do not preserve /login as an intended destination

Resolve the existing duplicate intended-route mechanisms.
There must be one clear precedence/consumption strategy.

Add useful tests for:

- restoration after reload
- intended-route handling
- successful refresh
- failed refresh
- concurrent refresh calls sharing one refresh request

============================================================
B. PRODUCT QUERY SEMANTICS
============================================================

Resolve the current ambiguity around simultaneous:

- search
- category
- sorting
- pagination

The UI must support all of these controls without displaying state in
the URL that is silently ignored.

Before implementing, inspect DummyJSON's current product API behavior.

Choose and document in code comments a simple, defensible rule that
preserves correct totals and pagination.

Do NOT filter only the currently returned page.

The URL remains the source of truth for:

- q
- category
- sortBy
- order
- page

Do not mirror these into Pinia.

Changing:

- q
- category
- sortBy
- order

must reset page to 1.

Browser reload, Back/Forward navigation and copying the URL to another
browser must reproduce the same list state.

The "Back to stock" action from an item detail must preserve the user's
previous list URL/query parameters where possible.

============================================================
C. PRODUCT LIST
============================================================

Implement StockListView completely.

Required:

- fetch product data
- search
- category filtering
- sorting
- pagination
- useful stock information per item
- loading state
- empty state
- recoverable error state
- retry action
- URL synchronization

Do not leave TODO-based placeholder behavior.

============================================================
D. SEARCH RACE CONDITIONS
============================================================

Implement the assessment's stale-search requirement.

Use AbortController as the primary cancellation mechanism.

A superseded request must NEVER update:

- products
- total count
- error state
- loading state

after a newer request owns the view.

An older request's catch/finally block must not overwrite state owned by
the newer request.

AbortError must not be displayed to the user as an application error.

You may debounce the input modestly for traffic reduction, but debounce
does not replace cancellation.

Add a meaningful test that deliberately resolves an older request after
a newer request and proves the old request cannot alter the visible state.

============================================================
E. PRODUCT DETAIL AND CACHE
============================================================

Implement /items/:id completely.

Required:

- direct URL loads correctly
- loading state
- error state
- retry
- invalid/missing product handling
- useful product information
- stock correction

Simplify the existing product cache.

The design intends to cache only the last viewed item.
Do not use an unrestricted module Map unless there is a strong reason.

The cached state must be reactive if a mounted consumer expects updates.

The successful stock update must update the product detail visible on
screen.

============================================================
F. DUMMYJSON NON-PERSISTENT WRITES
============================================================

DummyJSON simulates product PUT updates but does not persist them.

Do NOT implement behavior where:

1. user saves stock 17,
2. UI shows 17,
3. an automatic background GET immediately resets it to DummyJSON's
   original value.

Implement a consistent client behavior for the current session.

Keep it simple and defensible.

Document this limitation in a clearly marked factual section or code
comment so I can later describe it in README.

Do not write my personal reflection or decision reasoning.

============================================================
G. STOCK CORRECTION
============================================================

Implement the pessimistic stock update defined in docs/design.md.

Flow:

User edits stock.
User presses Save.

Immediately:

- disable input
- disable save
- show Saving...

Success:

- update confirmed displayed stock
- preserve the simulated corrected value for the intended session behavior
- close/reset editor appropriately
- show brief accessible success feedback

Failure:

- confirmed stock remains unchanged
- user's typed value remains
- input re-enables
- Save re-enables
- recoverable error is shown
- user can retry without retyping

The mutation ownership must be clear.
Avoid making StockEditor itself responsible for unrelated server-state
architecture.

Add a test for failed PUT preserving both:

- previous confirmed stock
- user's draft correction

============================================================
H. API CLIENT CORRECTIONS
============================================================

Fix the issues identified in the previous review.

Specifically:

- response body read failures must be normalized consistently
- malformed JSON on a declared JSON success response must not silently be
  cast to T
- AbortError must remain distinguishable
- ApiError should remain useful to consumers
- avoid hiding programming errors behind broad catch blocks

Do not add a large runtime schema-validation dependency merely for this
assessment unless genuinely needed.

============================================================
I. ACCESSIBILITY
============================================================

Retain semantic HTML and improve the existing accessibility foundation.

Required:

- all functionality keyboard accessible
- proper form labels
- visible focus
- no clickable divs when native controls exist
- useful accessible errors
- accessible loading/status feedback
- stock editor transfers/restores focus sensibly when controls appear/disappear

Fix the focus ring contrast issue noted in the review.
Ensure the authored focus indicator reaches an appropriate contrast level
against the surfaces it appears on.

Review LoadingState's aria-busy/live-region behavior and fix it rather
than leaving aria-busy permanently true.

Use ARIA only where semantic HTML does not already provide the behavior.

============================================================
J. RESPONSIVE UI
============================================================

Retain:

- table layout on wider screens
- card layout on narrow screens

Verify the CSS behavior at 360px.

Ensure:

- no critical horizontal clipping
- controls remain usable
- product links and actions have adequate touch targets
- desktop table handles long content reasonably
- zoom does not make core actions inaccessible

Do not add a component library.

============================================================
K. TESTS
============================================================

Keep the existing meaningful auth tests and add tests for the risky logic.

Required meaningful coverage:

1. stale request cannot overwrite newer search
2. search/category/sort change resets page
3. URL query state parses/normalizes correctly
4. token restoration
5. refresh-and-replay / refresh flow
6. concurrent refresh requests share a refresh
7. failed stock correction preserves confirmed value and draft
8. intended-route preservation

Avoid shallow tests added only to increase the count.

Continue using happy-dom unless there is a concrete reason to change it.

============================================================
L. NODE / TOOLCHAIN REPRODUCIBILITY
============================================================

The previous review found package.json declares Node >=20.19 while the
locked Vitest requires >=22.12.

Align the project to an actual supported Node 22 version range.

The developer's current environment is Node 22.x.

Make local, CI and Vercel runtime expectations consistent.

If useful add:

- .nvmrc or equivalent
- engines entry

Do not require npm 12.

============================================================
M. CONVENTIONAL COMMITS
============================================================

Install and configure:

- @commitlint/cli
- @commitlint/config-conventional
- Husky

Configure a local commit-msg hook so invalid Conventional Commit messages
actually fail locally.

Use a current Husky configuration compatible with the installed version.

Add/adjust package scripts as necessary.

DO NOT make any git commits yourself.

After setup, demonstrate how I can manually test the hook with a bad
commit message without permanently creating a bad commit.

============================================================
N. ESLINT / PRETTIER / TYPES
============================================================

Retain the deliberately strict TypeScript configuration unless a rule is
proven counterproductive.

Keep:

- strict TypeScript
- noUncheckedIndexedAccess
- exactOptionalPropertyTypes

Ensure:

- npm run format:check
- npm run lint
- npm run type-check

are reliable CI commands.

CI lint must fail on warnings.

Correct any comments claiming CI behavior that does not actually exist.

Format vercel.json.

Do not format docs/design.md if it is intentionally excluded.

============================================================
O. GITHUB ACTIONS CI
============================================================

Create a GitHub Actions workflow.

On every pull request targeting main, it must run:

- npm ci
- npm run format:check
- npm run lint
- npm run type-check
- npm run test:run
- Conventional Commit validation for the PR commits
- npm run build

Use fetch-depth: 0 if required for commitlint range validation.

The workflow must fail when any required command fails.

Do not perform deployment from GitHub Actions if Vercel's Git integration
will handle deployment after merge.

Do not add secrets that are unnecessary.

Do not commit or push the workflow.

============================================================
P. VERCEL READINESS
============================================================

Retain/fix the root vercel.json SPA fallback so Vue Router history mode
works when directly opening or refreshing URLs such as:

/items/17

Ensure vercel.json itself passes formatting.

Confirm the production configuration should be:

Framework:
Vite

Build:
npm run build

Output:
dist

Production branch:
main

Ensure the application requires no secret environment variables for
DummyJSON.

Ensure there are no absolute localhost URLs in production code.

Do NOT deploy.

============================================================
Q. README
============================================================

If README.md already contains factual/project sections, you may update
ONLY factual portions that can be derived directly from the repository,
such as:

- installation commands
- scripts
- project structure
- test credentials
- technical stack
- CI command names
- deployment configuration

DO NOT write:

- my design decision log
- rejected alternatives and reasoning
- my AI reflection
- personal claims about my process
- time spent
- examples of where AI helped or failed

Leave clearly marked placeholders for those sections.

============================================================
R. AI LOG
============================================================

Correct any factual statement in docs/ai-log.md that claims functionality
exists when it does not.

In particular, do not claim AbortController was implemented until it
actually is.

Do not invent historical AI usage.

You may append an entry that truthfully records THIS implementation task,
including that Codex was asked to implement/fix the repository based on
the previous review.

Do not write the final Savannah reflection.

============================================================
S. FINAL VERIFICATION
============================================================

After implementation, run:

npm run format:check
npm run lint
npm run type-check
npm run test:run
npm run build

Also inspect npm scripts and ensure npm ci works from the lockfile.

If possible, run production preview and validate application behavior.

Report separately:

1. files changed
2. architectural decisions you had to make
3. tests added
4. exact test results
5. build result
6. anything you could not verify automatically
7. manual checks I must perform before deployment
8. README sections I still have to write myself
9. commands I should run manually before my next git commit
10. exact Vercel import settings

Finally give me a checklist for manual browser verification:

- successful login using DummyJSON credentials
- invalid login
- access token expiry
- successful token refresh
- failed refresh / login recovery
- route restoration
- stock list
- search under ?delay=2000
- rapidly replaced searches
- category filter
- sorting
- pagination
- URL reload persistence
- copied URL persistence
- browser Back/Forward
- item deep link
- stock correction success
- stock correction failure using a real 500 path/mocked failure where appropriate
- loading states
- empty states
- error/retry states
- keyboard-only flow
- 360px viewport
- hard refresh on /items/:id

Do not make commits.
Do not push.
Do not deploy.
