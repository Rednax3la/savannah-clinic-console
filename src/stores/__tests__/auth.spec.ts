import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useAuthStore } from '@/stores/auth'

/**
 * These cover the parts of the store that are implemented: where each token is
 * kept, and the intended-route handling that the mid-session expiry redirect
 * depends on. The login/refresh stubs are deliberately untested until they do
 * something.
 */
describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  it('keeps the refresh token in sessionStorage but not the access token', () => {
    const auth = useAuthStore()
    auth.setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' })

    expect(auth.isAuthenticated).toBe(true)
    // The refresh token has to survive a reload for the session to be restorable.
    expect(sessionStorage.getItem('clinic-console.refreshToken')).toBe('refresh-1')
    // The access token must not be persisted anywhere.
    expect(JSON.stringify(Object.entries(sessionStorage))).not.toContain('access-1')
  })

  it('reports a restorable session after a reload drops the access token', () => {
    const first = useAuthStore()
    first.setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' })

    // Simulate a reload: fresh Pinia, same sessionStorage.
    setActivePinia(createPinia())
    const restored = useAuthStore()

    expect(restored.isAuthenticated).toBe(false)
    expect(restored.canRestoreSession).toBe(true)
    expect(restored.refreshToken).toBe('refresh-1')
  })

  it('clears both tokens on sign out', () => {
    const auth = useAuthStore()
    auth.setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' })

    auth.signOut()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.canRestoreSession).toBe(false)
    expect(sessionStorage.getItem('clinic-console.refreshToken')).toBeNull()
  })

  it('returns the intended route once and never the login page', () => {
    const auth = useAuthStore()

    auth.rememberIntendedRoute('/items/17?q=gel')
    expect(auth.consumeIntendedRoute()).toBe('/items/17?q=gel')
    // Consumed, so a later sign-in does not bounce the user somewhere stale.
    expect(auth.consumeIntendedRoute()).toBeNull()

    // Remembering /login would send the user back to the form after signing in.
    auth.rememberIntendedRoute('/login?redirect=/items/17')
    expect(auth.consumeIntendedRoute()).toBeNull()
  })
})
