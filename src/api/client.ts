export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://dummyjson.com').replace(
  /\/+$/,
  '',
)
export class ApiError extends Error {
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
  get isRetryable(): boolean {
    return this.status === 0 || this.status >= 500 || this.status === 429
  }
  get isUnauthorized(): boolean {
    return this.status === 401
  }
}
export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Something unexpected happened. Please try again.'
}
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT'
  body?: unknown
  query?: Record<string, string | number | boolean | null | undefined>
  signal?: AbortSignal
  auth?: boolean
  headers?: HeadersInit
  delayMs?: number
}
export function buildUrl(path: string, options: RequestOptions = {}): string {
  const url = new URL(path.replace(/^\//, ''), `${API_BASE_URL}/`)
  if (url.origin !== new URL(API_BASE_URL).origin)
    throw new Error('API requests must use the configured origin')
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== null && value !== undefined && value !== '')
      url.searchParams.set(key, String(value))
  }
  if (options.delayMs && Number.isFinite(options.delayMs))
    url.searchParams.set('delay', String(Math.min(5000, Math.max(0, options.delayMs))))
  return url.toString()
}
let getAccessToken: () => string | null = () => null
let beforeRequest: (() => Promise<boolean>) | null = null
let onUnauthorized: (() => Promise<boolean>) | null = null
let onRejectedToken: (() => void) | null = null
export function setTokenProvider(provider: () => string | null): void {
  getAccessToken = provider
}
export function setSessionHandlers(
  handlers: {
    ensure: () => Promise<boolean>
    refresh: () => Promise<boolean>
    reject: () => void
  } | null,
): void {
  beforeRequest = handlers?.ensure ?? null
  onUnauthorized = handlers?.refresh ?? null
  onRejectedToken = handlers?.reject ?? null
}
function messageFrom(body: unknown): string | null {
  return body !== null &&
    typeof body === 'object' &&
    'message' in body &&
    typeof body.message === 'string'
    ? body.message
    : null
}
async function requestOnce<T>(path: string, options: RequestOptions): Promise<T> {
  const url = buildUrl(path, options)
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  const token = getAccessToken()
  if (options.auth !== false && token) headers.set('Authorization', `Bearer ${token}`)
  // Serialize outside the transport catch: a circular body is a programming error.
  const body = options.body === undefined ? null : JSON.stringify(options.body)
  let response: Response
  let raw: string
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body,
      ...(options.signal ? { signal: options.signal } : {}),
    })
    raw = await response.text()
  } catch (cause) {
    if (isAbortError(cause)) throw cause
    throw new ApiError('The server could not be reached. Check your connection and retry.', {
      status: 0,
      url,
      body: cause,
    })
  }
  let parsed: unknown = null
  if (raw) {
    try {
      parsed = JSON.parse(raw)
    } catch {
      if (response.ok)
        throw new ApiError('The server returned an unreadable response. Please retry.', {
          status: response.status,
          url,
        })
    }
  }
  if (!response.ok)
    throw new ApiError(
      messageFrom(parsed) ?? `Request failed (${response.status}). Please retry.`,
      { status: response.status, url, body: parsed },
    )
  if (parsed === null && response.status !== 204)
    throw new ApiError('The server returned an empty response. Please retry.', {
      status: response.status,
      url,
    })
  return parsed as T
}
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  options.signal?.throwIfAborted()
  if (options.auth !== false && beforeRequest && !(await beforeRequest()))
    throw new ApiError('Please sign in again.', { status: 401, url: buildUrl(path) })
  options.signal?.throwIfAborted()
  const sentToken = getAccessToken()
  try {
    return await requestOnce<T>(path, options)
  } catch (error) {
    if (
      !(error instanceof ApiError) ||
      !error.isUnauthorized ||
      options.auth === false ||
      !onUnauthorized
    )
      throw error
    options.signal?.throwIfAborted()
    // A late 401 for an old token must reuse the token another caller just refreshed.
    const refreshed =
      (getAccessToken() !== sentToken && getAccessToken() !== null) || (await onUnauthorized())
    options.signal?.throwIfAborted()
    if (!refreshed) throw error
    try {
      return await requestOnce<T>(path, options)
    } catch (retryError) {
      if (retryError instanceof ApiError && retryError.isUnauthorized) onRejectedToken?.()
      throw retryError
    }
  }
}
export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),
}
