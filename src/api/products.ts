/**
 * Product endpoints. Signatures are final; bodies are stubs for Section 2.
 *
 * Note the split below: DummyJSON has no single endpoint that accepts a search
 * term and a category together, so the caller has to choose one. That
 * limitation is why these are three functions rather than one.
 */

import type { Category, Product, ProductListQuery, ProductListResponse } from '@/types/product'

function notImplemented(name: string): never {
  throw new Error(`${name} is not implemented yet`)
}

export interface ListRequest {
  query: ProductListQuery
  signal?: AbortSignal
  /** Test-only slow-connection simulation, passed through to ?delay=. */
  delayMs?: number
}

/** GET /products — supports limit, skip, sortBy, order. */
export function listProducts(_request: ListRequest): Promise<ProductListResponse> {
  return notImplemented('listProducts')
}

/** GET /products/search?q= — ignores sortBy/order server-side. */
export function searchProducts(_request: ListRequest): Promise<ProductListResponse> {
  return notImplemented('searchProducts')
}

/** GET /products/category/{slug} */
export function listProductsByCategory(_request: ListRequest): Promise<ProductListResponse> {
  return notImplemented('listProductsByCategory')
}

/** GET /products/categories — returns objects with slug/name/url. */
export function fetchCategories(_signal?: AbortSignal): Promise<Category[]> {
  return notImplemented('fetchCategories')
}

/** GET /products/{id} */
export function fetchProduct(_id: number, _signal?: AbortSignal): Promise<Product> {
  return notImplemented('fetchProduct')
}

/**
 * PUT /products/{id} — the stock correction.
 *
 * DummyJSON simulates the write: it echoes the updated object back but does not
 * persist it, so a later GET returns the old count.
 */
export function updateProductStock(_id: number, _stock: number): Promise<Product> {
  return notImplemented('updateProductStock')
}
