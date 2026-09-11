# Clinic Stock Console — Design

## Task

The task is to develop an internal console for a clinic, to display its stock.

A user needs to:

* authenticate before viewing stock;
* browse the clinic's stock catalogue;
* search products;
* filter products by category;
* sort the stock list;
* move between pages of results;
* open an individual stock item using a shareable URL;
* correct a product's recorded stock quantity;
* continue working reasonably well on slow or unreliable Wi-Fi;
* use the application with a keyboard;
* use it on small screens, including a 360px-wide viewport.

## Data Source

DummyJSON product catalogue.

---

# Screen Structure

## Layout

Hybrid layout - tables at wider widths and card-like layouts for narrower widths, to accoodate the 360px views.

## Colour Scheme

* **Grape Deep Purple — `#351D5B`** - primary identity elements, headers and core styling blocks
* **Conifer Lime Green — `#BADA55`** - high visibility highlights, key CTAs
* **White** - background framing, text isolation

## Priorities

* Information must be readable at a glance
* High contrast
* Consistent spacing
* Large tap targets on mobile (44px minimum)

---

# Pages

## 1. Login

Comes first (user must authenticate before accessing stock information).

### Features

* username input;
* password input;
* submit button;
* loading state;
* authentication error;
* redirect to the user's intended route after login.

Validation errors to be inline messages, whereas failed form submissions and generic auth errors to be page-level.

---

## 2. Stock List

Allows staff to locate and inspect stock.

### Proposed Layout

```text
Name (Clinic Stock Console)          User

Search bar

Filters:
- Category
- sort - by price, latest/oldest

Pagination:
- previous
- specific page selector
- next
```

---

## 3. Item Detail

Proposed route:

```text
/items/:id
```

### Likely Information

* title;
* category;
* image;
* current stock;
* useful product metadata already available from DummyJSON;
* editable stock count.

---

# State Modeling

## i) Server State

Use custom composables i.e:

```text
useProducts()
useCategories()
useProduct()
```

to fetch and hold lists/single items.

---

## ii) URL State

The following:

```text
search term (q)
category
sortBy
order
page
```

should all refresh or open in another tab and display the exact same information.

Use VueRouter as the primary state source.

Reset page to `1` after applying query, category and sort filter.

---

## iii) Local UI State

Separate:

* username/password currently typed into the login form;
* whether the stock edit field is open;
* temporary stock input;
* whether a confirmation action is currently submitting;
* component-level visual state.

from actions that require URL state or API/server state.


---

# Authentication Lifecycle

Tokens should expire after one minute.

```text
LOGIN
│
receive access + refresh token
│
authenticated API request
│
├──── success ────> continue
│
401 Unauthorized
│
attempt token refresh
│
├──── success ────> retry original request
│
refresh fails (a minute completed)
│
require login again
```

To prevent loss of intended routes:

```text
remember intended route → login → return to intended route
```

## Ideal Redirect Scenario

```text
User is on /items/17
│
Token expires
│
App detects 401
│
App tries to refresh — that also fails
│
App saves "/items/17"
│
App redirects to /login
│
User logs in again
│
App reads saved route ──> sends user back to /items/17
```

access token → Pinia/in-memory
refresh token → sessionStorage
current user → Pinia
intended route → sessionStorage or router redirect parameter
---

# Data Fetching

## Conceptual Flow

```text
URL query parameters
│
derive request parameters
│
fetch DummyJSON
│
loading / success / empty / error
│
render
```

---

# Search Behaviour

Use `AbortController` instead of Debounce, which doesn't guarantee a previous search won't overwrite the current search.

---

# Caching Strategy

## Categories

Cache for the entire session. They never change.

Fetch once when the app loads, store in `useCategories`, never fetch again.

## Product List

Do not cache aggressively.

The list depends on 5 URL params.

When any param changes, fetch fresh.

This is natural because your composable watches the URL state and re-fetches when it changes.

## Product Detail

Cache the last viewed item in `useProduct`.

If the user navigates away and back to the same ID, show the cached value immediately while a background refresh happens silently.

## After Stock Correction

When `PUT` succeeds, update the local cached value directly with the new stock count.

---

# Stock Correction

Use pessimistic stock correction with this UI behavior:

```text
User sees current stock: 14
User types: 17
User clicks Save
```

Then:

* Button disables immediately
* Input disables immediately
* `"Saving..."` indicator appears
* `PUT /products/:id` fires

## Success

* Displayed stock updates to `17`
* Input closes or resets
* Success confirmation briefly shown

## Failure

* Error message appears
* Input re-enables with `17` still in it
* Save button re-enables
* User can retry without retyping

---

# Failure Handling Measures

## Loading

Show while fetch is in flight.

Skeleton rows on the list, a spinner on detail.

Never a blank screen.

## Empty

Not an error.

Specific messaging.

## Error

Always with a recovery action.

---

# Accessibility

## Keyboard Reachability

Every action must be executable with a keyboard only.

---

# Components and Final Structure

```text
src/
├── api/
│   ├── client.ts        ← base fetch with auth headers + 401 handling
│   ├── auth.ts          ← login, refresh, me
│   └── products.ts      ← list, search, categories, getById, update
│
├── composables/
│   ├── useProducts.ts   ← URL params → fetch → state
│   ├── useProduct.ts    ← single product by ID
│   └── useCategories.ts ← fetch once, cache session
│
├── stores/
│   └── auth.ts          ← Pinia: tokens, user, login, logout
│
├── router/
│   └── index.ts         ← routes + auth guard
│
├── views/
│   ├── LoginView.vue
│   ├── StockListView.vue
│   └── ItemDetailView.vue
│
├── components/
│   ├── AppHeader.vue
│   ├── stock/
│   │   ├── StockToolbar.vue
│   │   ├── SearchInput.vue
│   │   ├── CategoryFilter.vue
│   │   ├── SortControl.vue
│   │   ├── ProductTable.vue    ← tablet/desktop
│   │   ├── ProductCard.vue     ← mobile
│   │   ├── ProductList.vue     ← switches between the two
│   │   ├── PaginationControls.vue
│   │   └── StockEditor.vue
│   └── ui/
│       ├── LoadingState.vue
│       ├── EmptyState.vue
│       └── ErrorState.vue
│
└── types/
    ├── product.ts
    └── auth.ts
```
