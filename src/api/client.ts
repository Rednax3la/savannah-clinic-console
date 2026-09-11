/**
 * Base HTTP client. Skeleton only: the transport is real, the auth/refresh
 * behaviour is stubbed out and marked below.
 *
 * Everything that talks to DummyJSON goes through here so that auth headers,
 * 401 handling and cancellation live in exactly one place rather than being
 * re-derived in every composable.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://dummyjson.com'

/**
 * A failed request, normalised. Callers branch on `status`, so they never have
 * to know whether the failure came from fetch, from JSON parsing, or from the
 * server returning a 500.
 */
export class ApiError extends Error {
  /** HTTP status, or 0 when the request never reached the server. */
  readonly status: number
  readonly url: string
  readonly body: unknown

  constructor(message: string, options: { status: number; url: string; body?: unknown }) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.url = options.url
    this.body = options.body
  }

  /** True when the request failed for a reason a retry could plausibly fix. */
  get isRetryable(): boolean {
    return this.status === 0 || this.status >= 500 || this.status === 429
  }

  /** True when the caller should attempt a token refresh before giving up. */
  get isUnauthorized(): boolean {
    return this.status === 401
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Serialised as JSON. */
  body?: unknown
  /** Query params. Null and undefined values are dropped, not sent as "null". */
  query?: Record<string, string | number | boolean | null | undefined>
  /** Lets a composable cancel a request that a newer one has superseded. */
  signal?: AbortSignal
  /** Attach the bearer token. Off for /auth/login, which has no token yet. */
  auth?: boolean
  /**
   * Artificial server-side delay in ms, for testing slow connections.
   * DummyJSON accepts 0–5000.
   */
  delayMs?: number
}

/** Builds a URL, dropping empty params so we never send `?category=null`. */
export function buildUrl(path: string, options: RequestOptions = {}): string {
  const url = new URL(path.startsWith('/') ? path.slice(1) : path, `${API_BASE_URL}/`)

  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value === null || value === undefined || value === '') continue
    url.searchParams.set(key, String(value))
  }

  if (options.delayMs !== undefined && options.delayMs > 0) {
    url.searchParams.set('delay', String(Math.min(options.delayMs, 5000)))
  }

  return url.toString()
}

/**
 * Hook the auth store installs at startup so the client can read the current
 * access token without importing the store (which would be a circular import,
 * since the store calls the client).
 */
type TokenProvider = () => string | null
let getAccessToken: TokenProvider = () => null

export function setTokenProvider(provider: TokenProvider): void {
  getAccessToken = provider
}

/**
 * Hook invoked on a 401 so the client can attempt one refresh and replay the
 * request. Returns true if the refresh succeeded and a retry is worthwhile.
 */
type UnauthorizedHandler = () => Promise<boolean>
let onUnauthorized: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler
}

/** Performs a single request. No refresh, no retry — see `request`. */
async function requestOnce<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path, options)
  const headers = new Headers({ Accept: 'application/json' })

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth !== false) {
    const token = getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? null : JSON.stringify(options.body),
      ...(options.signal ? { signal: options.signal } : {}),
    })
  } catch (cause) {
    // AbortError is a deliberate cancellation, not a failure: let it through
    // untouched so callers can ignore it instead of rendering an error state.
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause
    throw new ApiError('Network request failed', { status: 0, url, body: cause })
  }

  // Parse before the ok check: DummyJSON puts its reason in the body.
  const raw = await response.text()
  let parsed: unknown = null
  if (raw.length > 0) {
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = raw
    }
  }

  if (!response.ok) {
    throw new ApiError(extractMessage(parsed) ?? `Request failed (${response.status})`, {
      status: response.status,
      url,
      body: parsed,
    })
  }

  return parsed as T
}

function extractMessage(body: unknown): string | null {
  if (typeof body === 'string' && body.length > 0) return body
  if (body !== null && typeof body === 'object' && 'message' in body) {
    // `in` has already narrowed `body`, so no cast is needed here.
    const { message } = body
    if (typeof message === 'string') return message
  }
  return null
}

/**
 * Performs a request, refreshing the token once on a 401 and replaying it.
 *
 * TODO(section 2): wire the refresh-and-replay path. Currently a 401 propagates
 * straight to the caller; `onUnauthorized` is read but not yet installed.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await requestOnce<T>(path, options)
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.isUnauthorized &&
      onUnauthorized &&
      options.auth !== false
    ) {
      const refreshed = await onUnauthorized()
      if (refreshed) return await requestOnce<T>(path, options)
    }
    throw error
  }
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),
}
