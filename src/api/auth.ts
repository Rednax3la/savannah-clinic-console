import { http } from './client'
import type { AuthUser, LoginResponse, RefreshResponse } from '@/types/auth'
export const DEFAULT_TOKEN_LIFETIME_MINS = 1
export function login(username: string, password: string): Promise<LoginResponse> {
  return http.post(
    '/auth/login',
    { username, password, expiresInMins: DEFAULT_TOKEN_LIFETIME_MINS },
    { auth: false },
  )
}
export function fetchCurrentUser(token: string): Promise<AuthUser> {
  // Explicit token, no refresh hooks: the session owner handles permanent failures.
  return http.get('/auth/me', { auth: false, headers: { Authorization: `Bearer ${token}` } })
}
export function refreshTokens(refreshToken: string): Promise<RefreshResponse> {
  return http.post(
    '/auth/refresh',
    { refreshToken, expiresInMins: DEFAULT_TOKEN_LIFETIME_MINS },
    { auth: false },
  )
}
