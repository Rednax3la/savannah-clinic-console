/**
 * Single stock item by id. Skeleton.
 *
 * Caches the last viewed item so navigating back to it paints immediately while
 * a refresh runs in the background. The cache also gives the stock correction
 * somewhere to write the new count on success, per the design doc.
 */

import { computed, ref, type ComputedRef, type Ref } from 'vue'

import type { Product } from '@/types/product'
import type { ApiError } from '@/api/client'

/**
 * Module-level, not per-call: two components mounting useProduct for the same
 * id should share one entry rather than each holding a copy that can drift.
 */
const cache = new Map<number, Product>()

export function getCachedProduct(id: number): Product | undefined {
  return cache.get(id)
}

/** Called after a successful PUT so the detail view reflects the new count. */
export function setCachedProduct(product: Product): void {
  cache.set(product.id, product)
}

export interface UseProductResult {
  product: ComputedRef<Product | null>
  isLoading: ComputedRef<boolean>
  /** True during a background refresh of an already-cached item. */
  isRefreshing: ComputedRef<boolean>
  error: ComputedRef<ApiError | null>
  retry: () => void
}

/**
 * TODO(section 2): seed from the cache, fetch, and abort on id change or
 * unmount so a slow response for a previous item cannot land on this one.
 */
export function useProduct(_id: Ref<number>): UseProductResult {
  const product = ref<Product | null>(null)
  const isLoading = ref(false)
  const isRefreshing = ref(false)
  const error = ref<ApiError | null>(null)

  function retry(): void {
    throw new Error('useProduct.retry is not implemented yet')
  }

  // See useProducts: computed keeps the exposed type identical to Product.
  return {
    product: computed(() => product.value),
    isLoading: computed(() => isLoading.value),
    isRefreshing: computed(() => isRefreshing.value),
    error: computed(() => error.value),
    retry,
  }
}
