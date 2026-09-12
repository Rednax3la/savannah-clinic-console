import type * as ProductApi from '@/api/products'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { useProducts } from '../useProducts'
import { listProducts } from '@/api/products'
import { parseProductQuery } from '@/utils/productQuery'
import type { ProductListResponse } from '@/types/product'
vi.mock('@/api/products', async (original) => ({
  ...(await original<typeof ProductApi>()),
  listProducts: vi.fn(),
}))
function deferred() {
  let resolve!: (value: ProductListResponse) => void
  let reject!: (error: Error) => void
  const promise = new Promise<ProductListResponse>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function result(title: string): ProductListResponse {
  return {
    products: [{ id: 1, title, description: '', category: 'beauty', stock: 10, price: 3 }],
    total: 1,
    skip: 0,
    limit: 20,
  }
}
afterEach(() => vi.resetAllMocks())
describe('request ownership', () => {
  it('ignores an older response even when transport ignores abort and resolves last', async () => {
    const old = deferred()
    const latest = deferred()
    vi.mocked(listProducts).mockReturnValueOnce(old.promise).mockReturnValueOnce(latest.promise)
    const query = ref(parseProductQuery({ q: 'old' }))
    const scope = effectScope()
    const state = scope.run(() => useProducts(query))!
    query.value = { ...query.value, q: 'new' }
    expect(vi.mocked(listProducts).mock.calls[0]?.[0].signal?.aborted).toBe(true)
    latest.resolve(result('New result'))
    await flushPromises()
    old.resolve(result('Stale result'))
    await flushPromises()
    expect(state.products.value[0]?.title).toBe('New result')
    expect(state.total.value).toBe(1)
    expect(state.error.value).toBeNull()
    expect(state.isLoading.value).toBe(false)
    scope.stop()
  })
  it('old catch/finally cannot clear newer loading or publish an error', async () => {
    const old = deferred()
    const latest = deferred()
    vi.mocked(listProducts).mockReturnValueOnce(old.promise).mockReturnValueOnce(latest.promise)
    const query = ref(parseProductQuery({ q: 'old' }))
    const scope = effectScope()
    const state = scope.run(() => useProducts(query))!
    query.value = { ...query.value, q: 'new' }
    old.reject(new Error('old request failed'))
    await flushPromises()
    expect(state.isLoading.value).toBe(true)
    expect(state.error.value).toBeNull()
    expect(state.total.value).toBe(0)
    latest.resolve(result('New'))
    await flushPromises()
    expect(state.products.value[0]?.title).toBe('New')
    scope.stop()
  })
  it('clears old visible results immediately and aborts on disposal', async () => {
    const latest = deferred()
    vi.mocked(listProducts).mockResolvedValueOnce(result('Old')).mockReturnValueOnce(latest.promise)
    const query = ref(parseProductQuery({ q: 'old' }))
    const scope = effectScope()
    const state = scope.run(() => useProducts(query))!
    await flushPromises()
    query.value = { ...query.value, q: 'new' }
    expect(state.products.value).toEqual([])
    scope.stop()
    expect(vi.mocked(listProducts).mock.calls[1]?.[0].signal?.aborted).toBe(true)
    latest.resolve(result('After disposal'))
    await flushPromises()
    expect(state.products.value).toEqual([])
  })
})
