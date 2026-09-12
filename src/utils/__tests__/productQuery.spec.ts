import { describe, expect, it } from 'vitest'
import { changeProductQuery, parseProductQuery, serializeProductQuery } from '../productQuery'
import { selectProductPage } from '@/api/products'
import { internalDestination, listDestination } from '../navigation'
import type { Product } from '@/types/product'
describe('URL-owned product state', () => {
  it('normalizes malformed numbers, arrays, missing values and unsupported sorts', () => {
    expect(
      parseProductQuery({
        q: [' soap ', 'ignored'],
        category: null,
        page: '-2',
        order: 'sideways',
        sortBy: 'password',
        delay: '9999',
      }),
    ).toEqual({
      q: ' soap ',
      category: null,
      page: 1,
      order: 'asc',
      sortBy: 'title',
      delayMs: 5000,
      pageSize: 20,
    })
    expect(parseProductQuery({ page: 'Infinity' }).page).toBe(1)
    expect(parseProductQuery({ page: '2.5' }).page).toBe(1)
  })
  it.each([
    { q: 'gel' },
    { category: 'beauty' },
    { sortBy: 'price' as const },
    { order: 'desc' as const },
  ])('resets page when filter changes: %j', (change) => {
    expect(changeProductQuery(parseProductQuery({ page: '7' }), change).page).toBe(1)
  })
  it('preserves filters when paginating and round-trips copied URL state', () => {
    const current = parseProductQuery({
      q: 'soap',
      category: 'beauty',
      sortBy: 'stock',
      order: 'desc',
      page: '3',
      delay: '2000',
    })
    const next = changeProductQuery(current, { page: 4 })
    expect(next).toEqual({ ...current, page: 4 })
    const serialized = serializeProductQuery(next)
    const copied = Object.fromEntries(
      Object.entries(serialized).map(([key, value]) => [key, String(value)]),
    )
    expect(parseProductQuery(copied)).toEqual(next)
  })
  it('filters and sorts the complete set before paginating, using correct totals and clamping', () => {
    const products: Product[] = Array.from({ length: 30 }, (_, index) => ({
      id: index + 1,
      title: `Item ${index}`,
      description: '',
      category: index % 2 ? 'beauty' : 'other',
      price: index,
      stock: index,
    }))
    const result = selectProductPage(products, {
      ...parseProductQuery({ category: 'beauty', sortBy: 'price', order: 'desc', page: '99' }),
      pageSize: 5,
    })
    expect(result.total).toBe(15)
    expect(result.skip).toBe(10)
    expect(result.products.map((product) => product.price)).toEqual([9, 7, 5, 3, 1])
  })
})
describe('internal navigation', () => {
  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/login',
    '/login?redirect=/',
    '/%2f%2fevil.example',
    '/items/17\n',
  ])('rejects unsafe or login destinations: %s', (path) => {
    expect(internalDestination(path)).toBeNull()
  })
  it('retains item/list queries and restricts the detail back-link to stock', () => {
    expect(internalDestination('/items/17?from=%2F%3Fq%3Dsoap')).toBe(
      '/items/17?from=%2F%3Fq%3Dsoap',
    )
    expect(listDestination('/?q=soap&page=2')).toBe('/?q=soap&page=2')
    expect(listDestination('/items/17')).toBe('/')
  })
})
