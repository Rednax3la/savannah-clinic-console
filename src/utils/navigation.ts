/** Only application destinations are accepted, never arbitrary redirect URLs. */
export function internalDestination(value: unknown): string | null {
  if (typeof value !== 'string' || /[\\\u0000-\u0020]/.test(value)) return null
  if (!value.startsWith('/') || value.startsWith('//')) return null
  try {
    const url = new URL(value, 'https://console.invalid')
    if (url.origin !== 'https://console.invalid') return null
    if (url.pathname !== '/' && !/^\/items\/\d+$/.test(url.pathname)) return null
    return url.pathname + url.search + url.hash
  } catch {
    return null
  }
}
export function listDestination(value: unknown): string {
  const safe = internalDestination(value)
  return safe && new URL(safe, 'https://console.invalid').pathname === '/' ? safe : '/'
}
