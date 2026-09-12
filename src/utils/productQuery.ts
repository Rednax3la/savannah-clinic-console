import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import type { ProductListQuery, ProductSortField } from '@/types/product'
export const PAGE_SIZE = 20
const fields: readonly ProductSortField[] = ['title', 'price', 'stock', 'meta.createdAt']
function first(value: LocationQuery[string] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? ''
}
export function parseProductQuery(query: LocationQuery): ProductListQuery {
  const sort = first(query.sortBy)
  const rawPage = first(query.page)
  const page = Number(rawPage)
  const delay = Number(first(query.delay))
  return {
    q: first(query.q),
    category: first(query.category).trim() || null,
    sortBy: fields.includes(sort as ProductSortField) ? (sort as ProductSortField) : 'title',
    order: first(query.order) === 'desc' ? 'desc' : 'asc',
    page: /^\d+$/.test(rawPage) && Number.isSafeInteger(page) && page > 0 ? page : 1,
    pageSize: PAGE_SIZE,
    delayMs: Number.isFinite(delay) ? Math.min(5000, Math.max(0, Math.floor(delay))) : 0,
  }
}
export function serializeProductQuery(query: ProductListQuery): LocationQueryRaw {
  return {
    q: query.q || undefined,
    category: query.category || undefined,
    sortBy: query.sortBy,
    order: query.order,
    page: String(query.page),
    delay: query.delayMs ? String(query.delayMs) : undefined,
  }
}
export function changeProductQuery(
  query: ProductListQuery,
  change: Partial<Pick<ProductListQuery, 'q' | 'category' | 'sortBy' | 'order' | 'page'>>,
): ProductListQuery {
  const filtersChanged = (['q', 'category', 'sortBy', 'order'] as const).some(
    (key) => key in change && change[key] !== query[key],
  )
  return { ...query, ...change, page: filtersChanged ? 1 : (change.page ?? query.page) }
}
