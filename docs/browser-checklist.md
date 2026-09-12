# Manual browser verification

Run `npm ci`, `npm run build`, then `npm run preview`. Use the URL printed by preview. Automated production-browser checks use controlled API fixtures; repeat these steps with real DummyJSON before submission. Repeat deep-link checks on Vercel after your own deployment.

- [ ] Sign in with `emilys` / `emilyspass`; confirm the stock list appears.
- [ ] Submit a wrong password; confirm a useful error and an enabled retry.
- [ ] Open `/items/17` while signed out; sign in and confirm the same item opens.
- [ ] Hard refresh `/items/17`; confirm session restoration and item loading.
- [ ] Inspect login and refresh request bodies: `expiresInMins: 1`. Access credentials must not be stored in localStorage/sessionStorage; the refresh token belongs in sessionStorage.
- [ ] Leave the authenticated page open for more than one minute. Confirm one refresh at JWT expiry, no login flash, and continued access. Public product endpoints alone do not validate expiry.
- [ ] Block `/auth/refresh` or return 500, then wait for expiry. Confirm recoverable session feedback. Unblock and select Restore session; confirm the route and an open correction draft survive.
- [ ] Return 401 for `/auth/refresh`, then trigger expiry. Confirm sign-in replaces protected content; successful sign-in restores the internal route. Remove the override afterward.
- [ ] On the list, verify titles, categories, prices, counts and item links. At desktop width use the table; at 360px use cards.
- [ ] Open `/?delay=2000`; confirm a visible loading state and the `delay=2000` API query.
- [ ] Type and replace several searches rapidly. Confirm only the latest term determines results; cancelled requests must not display errors or stop newer loading feedback.
- [ ] Combine search, category and each sort direction. Check the result count and ordering across pages. Changing any filter resets page to 1.
- [ ] Select another page; refresh, copy the URL to another browser and sign in, then use Back/Forward. Confirm the same controls and results for each URL.
- [ ] Open an item from a filtered list. Use Back to stock and confirm all previous query parameters are preserved.
- [ ] Search for an impossible term. Confirm the empty state and Clear filters action work.
- [ ] Return 500 for product-list GET, then remove the override and select Try again. Confirm recovery. Use `/http/500` to inspect a real DummyJSON 500 response; use a request override to exercise the app's specific GET/PUT paths.
- [ ] Open `/items/99999` and `/items/not-a-number`; confirm useful missing-item/missing-route screens.
- [ ] Delay a detail GET; confirm loading. Return 500 for it; confirm error and retry recovery.
- [ ] Open Correct count, enter a nonnegative integer and save. Confirm disabled controls while pending, unchanged confirmed stock until success, then updated count, brief status and focus on Correct count.
- [ ] Return 500 for the product PUT. Confirm the old count, preserved draft, enabled controls and error. Remove the override and retry without retyping.
- [ ] After saving a count, reload and revisit the item/list. Confirm the session correction remains even though DummyJSON GET returns its original count. Sign out and back in to confirm corrections are cleared.
- [ ] Start a delayed correction and navigate away. Confirm it cannot change another item's screen when it finishes.
- [ ] Complete login, filters, pagination, detail, correction, Cancel and sign-out using only Tab/Shift+Tab, Enter, Space and arrow keys. Check skip link, visible focus and sensible focus after route changes.
- [ ] With a screen reader, check labels, validation errors, result/loading feedback, save feedback and session recovery. Automated DOM checks do not establish full screen-reader compatibility.
- [ ] At 360px and at 200% browser zoom/text enlargement, confirm no critical horizontal clipping and that all controls and actions remain usable.
- [ ] After your Vercel deployment, open and hard refresh `/items/17` in a new tab. Verify the host serves the SPA and authentication returns to that item.

The automated companion is `npm run test:browser` after a build. It uses installed Chrome/Chromium (`CHROME_PATH` may override detection), starts local preview, injects deterministic API responses and writes ignored screenshots to `test-results/`.
