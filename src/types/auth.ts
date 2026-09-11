/** Shapes returned by the DummyJSON auth endpoints. */

export interface LoginCredentials {
  username: string
  password: string
  /**
   * Deliberately short in this app so token expiry happens during normal use
   * and the refresh path is exercised rather than theoretical.
   */
  expiresInMins: number
}

/** The authenticated user, as returned by /auth/login and /auth/me. */
export interface AuthUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender?: string
  image?: string
}

/** /auth/login returns the user fields and the tokens in one flat object. */
export interface LoginResponse extends AuthUser {
  accessToken: string
  refreshToken: string
}

/** /auth/refresh returns only the token pair. */
export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}
