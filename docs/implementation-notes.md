# Implementation facts and outstanding author work

The original `docs/design.md` has not been edited.

## Proposed factual corrections to the design (not applied)

- Replace the statement that tokens/refresh fail after a minute with: the requested **access token** lifetime is one minute; refresh validity is separate. JWT expiry detection and authenticated endpoints trigger the shared refresh flow.
- Clarify that cancellation and debounce address different problems. Cancellation plus request ownership protects correctness; debounce is optional request-rate control.
- Clarify that the last-item cache and confirmed-count session overrides serve different purposes. DummyJSON does not persist PUTs, so revalidation retains confirmed session counts rather than reverting them automatically.
- Specify that the current category cache lasts until a full page reload. Corrections and refresh credentials last for the signed-in tab session where browser storage is available.

## Implementation record

The HTTP client normalizes fetch/body-read failures and rejects malformed successful JSON. Serialization happens outside the transport catch. API calls perform session preflight, retry once on a 401 after a shared refresh, and never refresh recursively for login/refresh/current-user calls.

Product API requests fetch the full matching set with `limit=0` and selected fields. The composable applies confirmed session stock counts before category filtering, sorting and slicing into pages. This keeps stock sorting and pagination consistent after simulated corrections. It is scoped to DummyJSON's small catalogue; a production backend should supply combined filtering/sorting/pagination.

The latest test-utils dependency chain pulled transitive packages requiring a newer Node 22 patch. `@vue/test-utils` is pinned to a release compatible with the local Node 22.17.1 toolchain. CI reads `.nvmrc`; Vercel uses Node 22.x.

## Not configured by local implementation

- GitHub branch protection and repository access.
- Vercel project import, production-branch selection and a public deployment URL.
- The author's Section 1 decision log, Section 4 reflection and actual time spent.

No commits, pushes or deployments were performed.
