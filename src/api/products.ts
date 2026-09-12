import { http } from './client'
import type { Category, Product, ProductListQuery, ProductListResponse } from '@/types/product'
export interface ListRequest {
  query: ProductListQuery
  signal?: AbortSignal
}
const LIST_FIELDS = 'id,title,description,category,price,stock,thumbnail,meta'
export function selectProductPage(
  products: Product[],
  query: ProductListQuery,
): ProductListResponse {
  const matching = products.filter(
    (product) => !query.category || product.category === query.category,
  )
  const direction = query.order === 'asc' ? 1 : -1
  matching.sort((a, b) => {
    let comparison: number
    if (query.sortBy === 'meta.createdAt')
      comparison = (a.meta?.createdAt ?? '').localeCompare(b.meta?.createdAt ?? '')
    else if (query.sortBy === 'title')
      comparison = a.title.localeCompare(b.title, 'en', { numeric: true, sensitivity: 'base' })
    else comparison = a[query.sortBy] - b[query.sortBy]
    return comparison * direction || a.id - b.id
  })
  const pageCount = Math.max(1, Math.ceil(matching.length / query.pageSize))
  const skip = (Math.min(query.page, pageCount) - 1) * query.pageSize
  return {
    products: matching.slice(skip, skip + query.pageSize),
    total: matching.length,
    skip,
    limit: query.pageSize,
  }
}
export async function listProducts({ query, signal }: ListRequest): Promise<ProductListResponse> {
  // Verified against DummyJSON: search supports sorting; limit=0 fetches the whole
  // matching set. Fetch selected fields, intersect category, apply corrected counts,
  // sort deterministically, THEN paginate. Never filter just the current page.
  // This bounded mock catalogue needs no query library or aggressive list cache.
  const result = await http.get<ProductListResponse>(query.q ? '/products/search' : '/products', {
    query: { q: query.q, limit: 0, select: LIST_FIELDS },
    delayMs: query.delayMs,
    ...(signal ? { signal } : {}),
  })
  signal?.throwIfAborted()
  return result
}
export function fetchCategories(): Promise<Category[]> {
  return http.get('/products/categories')
}
export function fetchProduct(id: number, signal?: AbortSignal, delayMs = 0): Promise<Product> {
  return http.get(`/products/${id}`, { delayMs, ...(signal ? { signal } : {}) })
}
export function updateProductStock(
  id: number,
  stock: number,
  signal?: AbortSignal,
): Promise<Product> {
  return http.put(`/products/${id}`, { stock }, { ...(signal ? { signal } : {}) })
}
