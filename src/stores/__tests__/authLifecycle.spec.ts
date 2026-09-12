import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, disposePinia, setActivePinia } from 'pinia'
import * as api from '@/api/auth'
import { ApiError } from '@/api/client'
import { useAuthStore } from '../auth'
vi.mock('@/api/auth')
const user = {
  id: 1,
  username: 'emilys',
  email: 'demo@example.test',
  firstName: 'Emily',
  lastName: 'Demo',
}
function token(seconds = 60): string {
  return `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + seconds }))}.signature`
}
let pinia: ReturnType<typeof createPinia>
beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  sessionStorage.clear()
  vi.resetAllMocks()
})
afterEach(() => {
  disposePinia(pinia)
  vi.useRealTimers()
})
describe('authentication lifecycle', () => {
  it('restores tokens and /auth/me after a reload, preserving the intended item', async () => {
    const first = useAuthStore()
    first.setTokens({ accessToken: token(), refreshToken: 'refresh' })
    first.rememberIntendedRoute('/items/17?from=%2F%3Fpage%3D2')
    disposePinia(pinia)
    pinia = createPinia()
    setActivePinia(pinia)
    vi.mocked(api.refreshTokens).mockResolvedValue({
      accessToken: token(),
      refreshToken: 'rotated',
    })
    vi.mocked(api.fetchCurrentUser).mockResolvedValue(user)
    const restored = useAuthStore()
    await restored.restoreSession()
    expect(restored.user).toEqual(user)
    expect(restored.isAuthenticated).toBe(true)
    expect(api.fetchCurrentUser).toHaveBeenCalledWith(restored.accessToken)
    expect(restored.consumeIntendedRoute()).toBe('/items/17?from=%2F%3Fpage%3D2')
    expect(restored.consumeIntendedRoute()).toBeNull()
  })
  it('shares exactly one refresh promise among concurrent callers', async () => {
    const auth = useAuthStore()
    auth.setTokens({ accessToken: token(-1), refreshToken: 'refresh' })
    auth.user = user
    let resolve!: (value: { accessToken: string; refreshToken: string }) => void
    vi.mocked(api.refreshTokens).mockReturnValue(
      new Promise((done) => {
        resolve = done
      }),
    )
    const first = auth.refreshSession()
    const second = auth.refreshSession()
    const third = auth.ensureSession()
    // Pinia wraps action return promises for subscriptions; the underlying refresh is shared.
    expect(api.refreshTokens).toHaveBeenCalledTimes(1)
    expect(auth.isRestoring).toBe(true)
    resolve({ accessToken: token(), refreshToken: 'new-refresh' })
    await expect(Promise.all([first, second, third])).resolves.toEqual([true, true, true])
    expect(api.refreshTokens).toHaveBeenCalledTimes(1)
    expect(sessionStorage.getItem('clinic-console.refreshToken')).toBe('new-refresh')
  })
  it('clears permanently rejected credentials, retaining a safe intended route', async () => {
    const auth = useAuthStore()
    auth.setTokens({ accessToken: token(-1), refreshToken: 'bad' })
    auth.rememberIntendedRoute('/items/17')
    vi.mocked(api.refreshTokens).mockRejectedValue(
      new ApiError('expired', { status: 401, url: '/auth/refresh' }),
    )
    await expect(auth.refreshSession()).resolves.toBe(false)
    expect(auth.refreshToken).toBeNull()
    expect(auth.user).toBeNull()
    expect(auth.consumeIntendedRoute()).toBe('/items/17')
  })
  it('retains refresh credentials on a transient failure and allows retry', async () => {
    const auth = useAuthStore()
    auth.setTokens({ accessToken: token(-1), refreshToken: 'keep-me' })
    auth.user = user
    vi.mocked(api.refreshTokens)
      .mockRejectedValueOnce(new ApiError('offline', { status: 0, url: '' }))
      .mockResolvedValueOnce({ accessToken: token(), refreshToken: 'recovered' })
    await expect(auth.refreshSession()).rejects.toMatchObject({ status: 0 })
    expect(auth.refreshToken).toBe('keep-me')
    expect(auth.sessionError).toBe('offline')
    await expect(auth.refreshSession()).resolves.toBe(true)
    expect(auth.sessionError).toBeNull()
  })
  it('does not resurrect a signed-out session when an old refresh completes', async () => {
    const auth = useAuthStore()
    auth.setTokens({ accessToken: token(-1), refreshToken: 'refresh' })
    let resolve!: (value: { accessToken: string; refreshToken: string }) => void
    vi.mocked(api.refreshTokens).mockReturnValue(
      new Promise((done) => {
        resolve = done
      }),
    )
    const pending = auth.refreshSession()
    auth.signOut()
    resolve({ accessToken: token(), refreshToken: 'late' })
    await expect(pending).resolves.toBe(false)
    expect(auth.accessToken).toBeNull()
    expect(auth.refreshToken).toBeNull()
  })
  it('refreshes once at actual JWT expiry without polling public product endpoints', async () => {
    vi.useFakeTimers()
    const auth = useAuthStore()
    auth.user = user
    auth.setTokens({ accessToken: token(60), refreshToken: 'refresh' })
    vi.mocked(api.refreshTokens).mockImplementation(() =>
      Promise.resolve({ accessToken: token(60), refreshToken: 'new' }),
    )
    auth.startExpiryMonitor()
    await vi.advanceTimersByTimeAsync(59_000)
    expect(api.refreshTokens).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1000)
    expect(api.refreshTokens).toHaveBeenCalledTimes(1)
  })
})
