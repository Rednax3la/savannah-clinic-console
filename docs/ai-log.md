## 19:42

Tool: Claude Code

Task:
Asked it to scaffold typed DummyJSON API interfaces.

What I kept:
Product/User types.

What I changed:
Removed a generic repository layer because it added abstraction with no value.

---

## 20:10

Tool: Codex

Task:
Asked it to review search behavior under slow network conditions.

Finding:
It pointed out that debouncing did not prevent stale responses.

Action:
Implemented AbortController cancellation.

What I learned:
Debouncing and cancellation solve different problems.
