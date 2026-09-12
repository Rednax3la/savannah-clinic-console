import { readonly, ref, watch, type Ref } from 'vue'
import { listProducts, selectProductPage } from '@/api/products'
import { withStockCorrection } from './productSession'
import { isAbortError } from '@/api/client'
import type { Product, ProductListQuery } from '@/types/product'
export function useProducts(query: Readonly<Ref<ProductListQuery>>) {
  const products = ref<Product[]>([])
  const total = ref(0)
  const page = ref(1)
  const isLoading = ref(false)
  const error = ref<unknown>(null)
  const reload = ref(0)
  let generation = 0
  watch(
    [query, reload],
    ([current], _previous, onCleanup) => {
      const controller = new AbortController()
      const requestId = ++generation
      let active = true
      onCleanup(() => {
        active = false
        controller.abort()
      })
      const ownsView = () => active && requestId === generation
      // Clear old content synchronously: the new query never labels old results.
      products.value = []
      total.value = 0
      error.value = null
      isLoading.value = true
      void (async () => {
        try {
          const response = await listProducts({ query: current, signal: controller.signal })
          const result = selectProductPage(response.products.map(withStockCorrection), current)
          if (!ownsView()) return
          products.value = result.products
          total.value = result.total
          page.value = Math.floor(result.skip / current.pageSize) + 1
        } catch (cause) {
          if (ownsView() && !isAbortError(cause)) error.value = cause
        } finally {
          if (ownsView()) isLoading.value = false
        }
      })()
    },
    { immediate: true, flush: 'sync' },
  )
  function retry(): void {
    reload.value++
  }
  return {
    products: readonly(products),
    total: readonly(total),
    page: readonly(page),
    isLoading: readonly(isLoading),
    error: readonly(error),
    retry,
  }
}
