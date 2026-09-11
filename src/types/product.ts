/**
 * Shapes returned by the DummyJSON product endpoints.
 *
 * Only the fields the console actually renders are modelled. The API returns
 * more (reviews, meta, dimensions); adding them here would imply we depend on
 * them, and every extra field is another thing to keep in sync.
 */

export interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  /** The stock count. This is the field the stock correction writes to. */
  stock: number
  brand?: string
  sku?: string
  rating?: number
  thumbnail?: string
  images?: string[]
  availabilityStatus?: string
}

/** Envelope used by /products, /products/search and /products/category/{slug}. */
export interface ProductListResponse {
  products: Product[]
  /** Total matching the query, not the page size. Pagination is derived from this. */
  total: number
  skip: number
  limit: number
}

/**
 * /products/categories returns objects, not strings. The `slug` is what
 * /products/category/{slug} expects, and the `name` is what we show.
 */
export interface Category {
  slug: string
  name: string
  url: string
}

/** Sort fields we expose in the UI, not every field the API would accept. */
export type ProductSortField = 'title' | 'price' | 'stock' | 'id'

export type SortOrder = 'asc' | 'desc'

/**
 * The canonical list query. Derived from the URL, never held as component
 * state — see the URL-state section of docs/design.md.
 */
export interface ProductListQuery {
  /** Search term. Empty string means "no search", not "search for nothing". */
  q: string
  /** Category slug, or null for all categories. */
  category: string | null
  sortBy: ProductSortField
  order: SortOrder
  /** 1-based, to match what the pagination control shows the user. */
  page: number
  pageSize: number
}

/** Payload for PUT /products/{id} when correcting a count. */
export interface StockCorrection {
  stock: number
}
