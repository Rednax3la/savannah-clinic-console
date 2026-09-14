# Clinic Stock Console

I built this as my submission for the Savannah Informatics Web Engineer take-home assessment.

It is a Vue 3 + TypeScript stock management console using DummyJSON. A user can sign in, search and filter stock, sort and paginate products, open individual product pages through shareable URLs, and make stock corrections.

**Live application:**
https://savannah-stock-console.vercel.app/

**Repository:**
https://github.com/Rednax3la/savannah-clinic-console/

---

## Local setup

I used Node **22.17.1**, which is also specified in `.nvmrc`. npm 10 works fine; npm 12 is not required.

```sh
npm ci
npm run dev
```

Demo credentials:

```text
Username: emilys
Password: emilyspass
```

There is no registration flow because the application uses users already provided by DummyJSON.

No API key or secret environment variable is required.

---

## Main technologies

I used:

- Vue 3
- TypeScript
- Vue Router
- Pinia
- Vite
- Vitest and Happy DOM
- ESLint
- Prettier
- EditorConfig
- Husky
- Commitlint
- GitHub Actions
- Vercel

The interface uses custom CSS rather than a component framework.

---

## Useful commands

| Command                | Purpose                              |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start the development server         |
| `npm run format:check` | Check formatting                     |
| `npm run lint`         | Run ESLint                           |
| `npm run type-check`   | Run TypeScript checks                |
| `npm run test:run`     | Run Vitest tests                     |
| `npm run build`        | Build the production application     |
| `npm run preview`      | Preview the production build locally |
| `npm run test:browser` | Run browser-level verification       |
| `npm run prepare`      | Install Husky hooks                  |

`test:browser` expects a completed build and Chrome/Chromium. It uses deterministic API fixtures and does not deploy the application.

---

## Project structure

The main areas of the project are:

- `src/api` — HTTP client and DummyJSON endpoint functions.
- `src/composables` — product requests, categories, caching and stock correction behaviour.
- `src/stores/auth.ts` — authentication state, token refresh and session restoration.
- `src/utils` — URL handling, safe navigation and browser storage helpers.
- `src/views` — login, stock list, product detail and missing-route pages.
- `src/components` — reusable controls, stock components and UI states.
- `docs/design.md` — my original design document.
- `docs/ai-log.md` — record of how I used AI during the assessment.
- `docs/browser-checklist.md` — manual verification checklist.

---

## State management

I deliberately separated state depending on what owns it.

### URL state

I keep the following in Vue Router query parameters:

- search
- category
- sort field
- sort order
- page

For example:

```text
/items?q=phone&category=smartphones&sortBy=price&order=asc&page=2
```

This means refreshing the page or copying the URL can reproduce the same stock-list view.

### Authentication state

I use Pinia for authentication.

The access token stays in memory, while the refresh token is stored in `sessionStorage`.

When the browser reloads, the application can use the refresh token to restore the session without keeping the short-lived access token permanently in browser storage.

### Server state

Products, categories and product details are handled mainly through composables instead of putting everything inside Pinia.

---

## Authentication behaviour

Login requests a one-minute access-token lifetime so that I could properly test token expiry.

When the access token expires, the app attempts to refresh it instead of immediately logging the user out.

The refresh logic also avoids several requests starting separate refresh operations at the same time.

On a reload:

```text
refresh token
    ↓
/auth/refresh
    ↓
new access token
    ↓
/auth/me
    ↓
restore user session
```

If there is a temporary network failure, I preserve the refresh token and allow retry.

If the refresh credentials are permanently rejected, the user is sent back to login.

I also preserve the route the user was working on so that they can return there after signing in again.

---

## Product list behaviour

The URL remains the source of truth for:

```text
q
category
sortBy
order
page
```

When search, category or sorting changes, the page resets to page 1.

I fetch the complete matching result set needed for the current search, then apply category filtering, stock corrections, deterministic sorting and finally pagination.

This avoids the mistake of filtering only the products already shown on one page.

Search requests can also be cancelled. If a user types a new search before an older request completes, the old request is not allowed to replace the newer results.

---

## Stock correction and DummyJSON limitations

Stock correction uses a pessimistic update.

When I save:

- the input and Save button are disabled;
- the UI shows that the save is in progress;
- the displayed confirmed stock only changes after a successful response.

If the request fails, I keep the previous confirmed stock and also keep what the user typed so they can retry.

DummyJSON does **not** persist PUT changes permanently. It returns a successful simulated response, but a later GET normally returns the original value.

To deal with this, I keep confirmed stock corrections for the signed-in tab session and overlay them on later GET results.

These corrections:

- survive a refresh;
- belong to the signed-in user;
- are cleared during sign-out or account change;
- are not shared with another browser or another user.

This is only a workaround for the mock API and is not how I would build a real shared stock system.

---

## Loading, errors and accessibility

My data screens support:

- loading
- success
- empty
- error
- retry

The application is also designed for keyboard use.

I considered things such as:

- semantic controls;
- form labels;
- visible keyboard focus;
- colour contrast;
- accessible error messages;
- focus management;
- mobile touch targets;
- reduced motion.

The stock list uses a table on wider screens and cards on smaller screens, including 360px widths.

---

# Design decisions

## Decision 1 — Token storage

**Decision:**
I decided to keep the access token in Pinia/in-memory state and the refresh token in `sessionStorage`.

**Alternative I rejected:**
Keeping both tokens permanently in browser storage or keeping both only in memory.

**Why:**
The access token only lasts one minute, so I did not see much reason to persist it across reloads. Keeping it in memory also reduces how long that token is exposed through persistent browser storage, though it does not remove XSS risk completely.

The refresh token needs to survive a page refresh so that the session can be restored silently, hence `sessionStorage` made more sense for this assessment.

In a real production healthcare system I would prefer a proper backend-controlled session approach, for example secure HttpOnly cookies, instead of relying on frontend-accessible token storage.

---

## Decision 2 — URL state instead of Pinia

**Decision:**
I decided to keep search, category, sorting and page state in the URL.

**Alternative I rejected:**
Keeping all filters in Pinia.

**Why:**
The assessment required the same stock view to survive a refresh and to work when somebody copies the URL.

If I kept the filters only in Pinia, the URL would not fully represent what the user is seeing.

The URL was already the natural owner of navigation state, while Pinia was more useful for application-wide authentication state.

---

## Decision 3 — No registration

**Decision:**
I did not add a registration form or registration link.

**Alternative I rejected:**
Adding a separate registration page.

**Why:**
This is presented as an internal clinic console, and DummyJSON already provides the users required for the assessment.

I felt registration would add functionality that was not requested and would also introduce more authentication behaviour for me to design and defend without adding value to the actual task.

In a real internal system, staff accounts would normally be created through an authorised administration process instead of allowing anybody to register themselves.

---

# Testing

I focused tests mainly on behaviours that can easily fail in real use instead of only checking whether components render.

These include:

- authentication restoration;
- refresh-token behaviour;
- concurrent refresh requests;
- safe route restoration;
- stale search protection;
- URL query parsing;
- pagination reset;
- API errors;
- failed stock corrections;
- image fallbacks;
- focus behaviour.

I also used browser-level tests and still manually checked the application myself.

---

# CI/CD

I use Conventional Commits, with Commitlint and a Husky `commit-msg` hook checking messages locally.

For example:

```text
feat: implement stock corrections
```

GitHub Actions runs against pull requests targeting `main` and checks:

```text
npm ci
formatting
lint
type checking
tests
commit messages
production build
```

If one of the required commands fails, the CI job fails.

Vercel handles deployment separately through its Git integration.

Merging into `main` triggers a production deployment.

The application uses Vite with:

```text
Build command: npm run build
Output directory: dist
Production branch: main
```

`vercel.json` contains the SPA fallback needed so that a direct request such as:

```text
/items/17
```

still loads the Vue application instead of returning a Vercel 404.

---

# AI usage and reflection

## Section 1 — Design

**Tool used:** ChatGPT

I mainly used ChatGPT to help me organise my implementation workflow, question some of my choices, and structure detailed prompts before I gave implementation work to coding agents.

I wrote the original design document myself before using AI to implement the application.

---

## Section 2 — Build

**Tool used:** Claude Code

I used Claude Code mainly for the first application scaffold.

It created the Vue 3 and TypeScript structure, routing, Pinia setup, API skeletons, initial components and development tooling.

I did not treat the scaffold as finished. I later reviewed the generated structure, ran the checks myself and used another tool to review it for missing assessment requirements.

---

## Section 3 — Testing, CI/CD and refinement

**Tool used:** Codex

I used Codex to review the scaffold, identify missing and incorrect implementation details, implement functionality, add tests, fix bugs, configure CI/CD and later improve the UI.

I also ran the important commands and browser checks myself rather than relying only on the agent's final report.

---

## One example where AI improved my work

One area where AI helped me a lot was identifying race conditions in search and authentication.

For example, during review I asked Codex to specifically check whether an older slow request could overwrite a newer request.

That resulted in stronger request cancellation and ownership checks, including protecting not only the results but also the loading and error states.

An example of the type of prompt I used was:

> Review the current scaffold for stale search responses, authentication refresh races and state that could be overwritten by an older async request. Do not modify files yet. Explain any failures you find and why they matter.

---

## One example where AI was wrong or incomplete

I noticed that AI gave me different recommendations at different stages about where access and refresh tokens should be stored.

Some suggestions presented different storage approaches as if each was the best option.

During the first scaffold there were also some duplicated or conflicting configuration decisions that later had to be corrected.

### How I caught it

The different recommendations did not agree with each other, so I did not just pick the newest one.

I compared what the assessment actually required, checked how DummyJSON refresh works and thought through what must survive a browser refresh.

I eventually settled on:

- access token — memory;
- refresh token — `sessionStorage`;
- current user — Pinia;
- intended route — temporary session state.

That was easier for me to explain and matched the behaviour I needed.

---

## Two decisions I made without AI

### 1. Custom composables instead of TanStack Query

I decided not to introduce TanStack Query.

For this project the caching requirements are quite small. Categories can be cached for the application session, product requests react to URL changes, and only the most recently viewed product needs a small cache.

Adding another server-state library would have increased the abstraction I needed to understand and defend without giving me enough benefit for this project.

### 2. Original visual direction

I wrote the initial design myself.

The grape and lime colour direction came from looking at Savannah Informatics' visual identity and trying to make the assessment feel related without copying their website.

I later improved the interface, but the original visual direction and responsive table/card idea came from my own design.

---

## One part I would currently struggle most to defend

ProductSession.ts. The stock correction persistence layer is the most subtle piece.
The withStockCorrection overlay, the confirmStock write-through, the userId scoping — it works, but if I'm asked to trace a correction through from PUT response to re-render, I'll need some prep time.

---

# Time spent

My approximate time was:

| Area                       |               Time |
| -------------------------- | -----------------: |
| Design                     |            6 hours |
| Implementation             |             1 hour |
| Testing                    |         20 minutes |
| CI/CD and deployment       |            7 hours |
| Documentation and learning |           12 hours |
| **Total**                  | **About 26 hours** |

The implementation time above refers mainly to the direct hands-on implementation period. A significant amount of my overall time went into reviewing AI output, testing, correcting decisions, deployment work and learning the generated code well enough to explain it.
