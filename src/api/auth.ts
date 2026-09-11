/**
 * Auth endpoints. Signatures are final; bodies are stubs for Section 2.
 */

import type { AuthUser, LoginCredentials, LoginResponse, RefreshResponse } from '@/types/auth'

/** Matches the design doc: one minute, so expiry happens while testing. */
export const DEFAULT_TOKEN_LIFETIME_MINS = 1

function notImplemented(name: string): never {
  throw new Error(`${name} is not implemented yet`)
}

/** POST /auth/login — no bearer token on this one, there isn't one yet. */
export function login(
  _credentials: LoginCredentials,
  _signal?: AbortSignal,
): Promise<LoginResponse> {
  return notImplemented('login')
}

/** GET /auth/me — used to restore a session on reload. */
export function fetchCurrentUser(_signal?: AbortSignal): Promise<AuthUser> {
  return notImplemented('fetchCurrentUser')
}

/** POST /auth/refresh — takes the refresh token in the body, not a header. */
export function refreshTokens(_refreshToken: string): Promise<RefreshResponse> {
  return notImplemented('refreshTokens')
}
