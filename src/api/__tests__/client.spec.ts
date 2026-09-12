import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, buildUrl, request, setTokenProvider, setSessionHandlers } from '../client'
describe('HTTP client boundaries', () => {
  beforeEach(() => {
    setSessionHandlers(null)
    setTokenProvider(() => null)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    setSessionHandlers(null)
  })
  it('normalizes failure reading a response body', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ text: () => Promise.reject(new TypeError('connection dropped')) }),
    )
    await expect(request('/products')).rejects.toMatchObject({ name: 'ApiError', status: 0 })
  })
  it('rejects malformed JSON success instead of pretending it is a product', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<html>proxy</html>', { status: 200 })),
    )
    await expect(request('/products')).rejects.toBeInstanceOf(ApiError)
  })
  it('preserves cancellation, including during body consumption', async () => {
    const cancellation = new DOMException('cancelled', 'AbortError')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ text: () => Promise.reject(cancellation) }))
    await expect(request('/products')).rejects.toBe(cancellation)
  })
  it('does not disguise a non-serializable request body as a network failure', async () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular
    await expect(request('/products/17', { method: 'PUT', body: circular })).rejects.toBeInstanceOf(
      TypeError,
    )
  })
  it('refreshes and replays an authenticated operation once with the new token', async () => {
    let token = 'old'
    setTokenProvider(() => token)
    const refresh = vi.fn(() => {
      token = 'new'
      return Promise.resolve(true)
    })
    const reject = vi.fn()
    setSessionHandlers({ ensure: () => Promise.resolve(true), refresh, reject })
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response('{"message":"expired"}', { status: 401 }))
      .mockResolvedValueOnce(new Response('{"stock":17}'))
    vi.stubGlobal('fetch', fetcher)
    await expect(request('/products/17', { method: 'PUT', body: { stock: 17 } })).resolves.toEqual({
      stock: 17,
    })
    expect(refresh).toHaveBeenCalledTimes(1)
    const options = fetcher.mock.calls[1]?.[1] as RequestInit
    expect(new Headers(options.headers).get('Authorization')).toBe('Bearer new')
    expect(options.body).toBe('{"stock":17}')
    expect(reject).not.toHaveBeenCalled()
  })
  it('does not recurse when replay or the refresh endpoint returns 401', async () => {
    const refresh = vi.fn().mockResolvedValue(true)
    const reject = vi.fn()
    setSessionHandlers({ ensure: () => Promise.resolve(true), refresh, reject })
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('{}', { status: 401 }))),
    )
    await expect(request('/products')).rejects.toMatchObject({ status: 401 })
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(reject).toHaveBeenCalledTimes(1)
    await expect(request('/auth/refresh', { auth: false })).rejects.toMatchObject({ status: 401 })
    expect(refresh).toHaveBeenCalledTimes(1)
  })
  it('builds encoded queries and forwards the real server delay', () => {
    const url = new URL(
      buildUrl('/products/search', { query: { q: 'hand & soap', category: null }, delayMs: 2000 }),
    )
    expect(url.searchParams.get('q')).toBe('hand & soap')
    expect(url.searchParams.has('category')).toBe(false)
    expect(url.searchParams.get('delay')).toBe('2000')
  })
})
