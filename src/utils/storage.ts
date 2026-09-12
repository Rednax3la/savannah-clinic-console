/** Browser storage may be unavailable; keep the current tab usable. */
export function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}
export function writeSession(key: string, value: string | null): void {
  try {
    if (value === null) sessionStorage.removeItem(key)
    else sessionStorage.setItem(key, value)
  } catch {
    /* In-memory state remains usable when storage is blocked. */
  }
}
