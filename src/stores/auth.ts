import { computed, onScopeDispose, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import * as authApi from '@/api/auth'
import { ApiError, errorMessage } from '@/api/client'
import type { AuthUser, TokenPair } from '@/types/auth'
import { internalDestination } from '@/utils/navigation'
import { readSession, writeSession } from '@/utils/storage'
import { beginProductSession, clearProductSession } from '@/composables/productSession'
const REFRESH_TOKEN_KEY = 'clinic-console.refreshToken'
const INTENDED_ROUTE_KEY = 'clinic-console.intendedRoute'
export function tokenExpiry(token: string): number | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const payload: unknown = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')))
    return payload &&
      typeof payload === 'object' &&
      'exp' in payload &&
      typeof payload.exp === 'number' &&
      Number.isFinite(payload.exp)
      ? payload.exp * 1000
      : null
  } catch {
    return null
  }
}
export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(readSession(REFRESH_TOKEN_KEY))
  const user = ref<AuthUser | null>(null)
  const isRestoring = ref(false)
  const sessionError = ref<string | null>(null)
  const isAuthenticated = computed(() => accessToken.value !== null)
  const canRestoreSession = computed(
    () => accessToken.value === null && refreshToken.value !== null,
  )
  let intendedRoute = readSession(INTENDED_ROUTE_KEY)
  let refreshPromise: Promise<boolean> | null = null
  let generation = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let monitoring = false
  function setTokens(tokens: TokenPair): void {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    writeSession(REFRESH_TOKEN_KEY, tokens.refreshToken)
  }
  function clearSession(): void {
    generation++
    clearTimeout(timer)
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    sessionError.value = null
    refreshPromise = null
    isRestoring.value = false
    writeSession(REFRESH_TOKEN_KEY, null)
    clearProductSession()
  }
  function rememberIntendedRoute(path: string): void {
    const safe = internalDestination(path)
    if (!safe) return
    intendedRoute = safe
    writeSession(INTENDED_ROUTE_KEY, safe)
  }
  function consumeIntendedRoute(): string | null {
    const route = internalDestination(intendedRoute)
    intendedRoute = null
    writeSession(INTENDED_ROUTE_KEY, null)
    return route
  }
  async function signIn(username: string, password: string): Promise<void> {
    const current = ++generation
    clearTimeout(timer)
    refreshPromise = null
    const response = await authApi.login(username, password)
    if (current !== generation) return
    const { accessToken: access, refreshToken: refresh, ...profile } = response
    user.value = profile
    isRestoring.value = false
    beginProductSession(profile.id)
    sessionError.value = null
    setTokens({ accessToken: access, refreshToken: refresh })
  }
  function refreshSession(): Promise<boolean> {
    if (refreshPromise) return refreshPromise
    const refresh = refreshToken.value
    if (!refresh) {
      clearSession()
      return Promise.resolve(false)
    }
    const current = generation
    isRestoring.value = true
    sessionError.value = null
    const pending = (async () => {
      try {
        const tokens = await authApi.refreshTokens(refresh)
        if (current !== generation) return false
        setTokens(tokens)
        if (!user.value) {
          const profile = await authApi.fetchCurrentUser(tokens.accessToken)
          if (current !== generation) return false
          user.value = profile
          beginProductSession(profile.id)
        }
        return true
      } catch (error) {
        if (current !== generation) return false
        if (error instanceof ApiError && [400, 401, 403].includes(error.status)) {
          clearSession()
          return false
        }
        // Offline/5xx is recoverable. Keep the refresh token and require an explicit
        // retry rather than polling, clearing the session, or showing protected data.
        sessionError.value = errorMessage(error)
        clearTimeout(timer)
        throw error
      } finally {
        if (current === generation) {
          isRestoring.value = false
          refreshPromise = null
        }
      }
    })()
    refreshPromise = pending
    return pending
  }
  function ensureSession(): Promise<boolean> {
    if (refreshPromise) return refreshPromise
    const expiry = accessToken.value ? tokenExpiry(accessToken.value) : null
    if (accessToken.value && user.value && expiry !== null && expiry > Date.now() + 1000)
      return Promise.resolve(true)
    return refreshSession()
  }
  async function restoreSession(): Promise<void> {
    await ensureSession()
  }
  async function retrySession(): Promise<void> {
    try {
      await refreshSession()
    } catch {
      /* sessionError supplies the recovery UI. */
    }
  }
  function scheduleExpiry(): void {
    clearTimeout(timer)
    if (!monitoring || !accessToken.value) return
    const expiry = tokenExpiry(accessToken.value)
    // JWT decoding only schedules refresh; /auth/refresh and /auth/me validate credentials.
    timer = setTimeout(
      () => {
        void retrySession()
      },
      Math.min(2_147_483_647, Math.max(0, (expiry ?? Date.now()) - Date.now())),
    )
  }
  watch(accessToken, scheduleExpiry, { flush: 'sync' })
  function startExpiryMonitor(): void {
    monitoring = true
    scheduleExpiry()
  }
  onScopeDispose(() => {
    monitoring = false
    clearTimeout(timer)
  })
  function signOut(): void {
    clearSession()
    consumeIntendedRoute()
  }
  return {
    accessToken,
    refreshToken,
    user,
    isRestoring,
    sessionError,
    isAuthenticated,
    canRestoreSession,
    setTokens,
    clearSession,
    rememberIntendedRoute,
    consumeIntendedRoute,
    signIn,
    refreshSession,
    ensureSession,
    restoreSession,
    retrySession,
    startExpiryMonitor,
    signOut,
  }
})
