export interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  stock: number
  brand?: string
  sku?: string
  rating?: number
  thumbnail?: string
  images?: readonly string[]
  meta?: { createdAt: string }
}
export interface ProductListResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}
export interface Category {
  slug: string
  name: string
  url: string
}
export type ProductSortField = 'title' | 'price' | 'stock' | 'meta.createdAt'
export type SortOrder = 'asc' | 'desc'
export interface ProductListQuery {
  q: string
  category: string | null
  sortBy: ProductSortField
  order: SortOrder
  page: number
  pageSize: number
  /** Diagnostic delay forwarded to DummyJSON, never a client-side sleep. */
  delayMs: number
}
