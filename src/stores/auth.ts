/**
 * Auth store. Holds the session and owns the token lifecycle.
 *
 * Storage split, per docs/design.md:
 *   access token  → memory only. Short-lived and replaceable, so persisting it
 *                   buys nothing and widens the XSS blast radius.
 *   refresh token → sessionStorage. Survives a reload (requirement 3) but dies
 *                   with the tab, which suits a shared ward tablet.
 *   user          → memory, re-fetched from /auth/me when a session is restored.
 *   intended route → sessionStorage, so a mid-session expiry can send the user
 *                   back where they were rather than to the list.
 *
 * Implemented here: state, token plumbing, intended-route handling.
 * Stubbed for Section 2: login, logout's server side, refresh.
 */

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { AuthUser, TokenPair } from '@/types/auth'

const REFRESH_TOKEN_KEY = 'clinic-console.refreshToken'
const INTENDED_ROUTE_KEY = 'clinic-console.intendedRoute'

/** sessionStorage throws in private-mode Safari and is absent in SSR. */
function safeSessionStorage(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage
  } catch {
    return null
  }
}

function readStored(key: string): string | null {
  return safeSessionStorage()?.getItem(key) ?? null
}

function writeStored(key: string, value: string | null): void {
  const store = safeSessionStorage()
  if (!store) return
  if (value === null) store.removeItem(key)
  else store.setItem(key, value)
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(readStored(REFRESH_TOKEN_KEY))
  const user = ref<AuthUser | null>(null)

  /** True once we hold a usable access token. */
  const isAuthenticated = computed(() => accessToken.value !== null)

  /**
   * True when there is a refresh token but no access token: a reloaded tab that
   * might still have a valid session. The router guard waits on this rather than
   * bouncing the user to /login before we have tried to restore.
   */
  const canRestoreSession = computed(
    () => accessToken.value === null && refreshToken.value !== null,
  )

  const isRestoring = ref(false)

  function setTokens(tokens: TokenPair): void {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    writeStored(REFRESH_TOKEN_KEY, tokens.refreshToken)
  }

  function clearSession(): void {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    writeStored(REFRESH_TOKEN_KEY, null)
  }

  /** Remembered before redirecting to /login, consumed once after sign-in. */
  function rememberIntendedRoute(fullPath: string): void {
    // Never send the user back to the login screen itself.
    if (fullPath.startsWith('/login')) return
    writeStored(INTENDED_ROUTE_KEY, fullPath)
  }

  function consumeIntendedRoute(): string | null {
    const route = readStored(INTENDED_ROUTE_KEY)
    writeStored(INTENDED_ROUTE_KEY, null)
    return route
  }

  function notImplemented(name: string): never {
    throw new Error(`${name} is not implemented yet`)
  }

  /** TODO(section 2): call api/auth login, store tokens and user. */
  function signIn(_username: string, _password: string): Promise<void> {
    return notImplemented('signIn')
  }

  /** TODO(section 2): exchange the refresh token; clear the session on failure. */
  function refreshSession(): Promise<boolean> {
    return notImplemented('refreshSession')
  }

  /** TODO(section 2): re-fetch /auth/me after a reload restores tokens. */
  function restoreSession(): Promise<void> {
    return notImplemented('restoreSession')
  }

  function signOut(): void {
    clearSession()
  }

  return {
    accessToken,
    refreshToken,
    user,
    isRestoring,
    isAuthenticated,
    canRestoreSession,
    setTokens,
    clearSession,
    rememberIntendedRoute,
    consumeIntendedRoute,
    signIn,
    refreshSession,
    restoreSession,
    signOut,
  }
})
