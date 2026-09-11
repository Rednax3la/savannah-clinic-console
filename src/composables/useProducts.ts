/**
 * Stock list: URL query in, request state out. Skeleton.
 *
 * The composable owns the request lifecycle so no component has to. In
 * particular it will own the AbortController: the design doc rejects debounce
 * alone because debouncing delays a request but does not stop an earlier, slower
 * response from landing after a later one and overwriting it. Cancelling the
 * superseded request removes that race instead of narrowing it.
 */

import { computed, ref, type ComputedRef, type Ref } from 'vue'

import type { Product, ProductListQuery } from '@/types/product'
import type { ApiError } from '@/api/client'

export interface UseProductsResult {
  products: ComputedRef<Product[]>
  /** Total matching the query, used to derive the page count. */
  total: ComputedRef<number>
  isLoading: ComputedRef<boolean>
  /** Set only for a genuine failure; a cancelled request is not an error. */
  error: ComputedRef<ApiError | null>
  /** The recovery action every error state has to offer. */
  retry: () => void
}

/**
 * @param query reactive source of truth, derived from the URL by the view.
 *
 * TODO(section 2): watch `query`, abort the in-flight request, pick the right
 * endpoint (search vs category vs plain list), and clamp an out-of-range page
 * so a filter change never strands the user on an empty page.
 */
export function useProducts(_query: Ref<ProductListQuery>): UseProductsResult {
  const products = ref<Product[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<ApiError | null>(null)

  function retry(): void {
    throw new Error('useProducts.retry is not implemented yet')
  }

  // Exposed through computed rather than readonly(): callers get a read-only
  // view without Vue's deep-readonly wrapper rewriting the Product type.
  return {
    products: computed(() => products.value),
    total: computed(() => total.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    retry,
  }
}
