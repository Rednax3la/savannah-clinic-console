/**
 * Categories. Skeleton.
 *
 * Fetched once per session and held at module scope: the list does not change
 * while the app is open, and every mount of the filter re-fetching it would be
 * wasted traffic on the patchy wifi this console has to work over.
 *
 * TODO(section 2): also hold the in-flight promise at module scope, so two
 * components mounting at once share one request rather than firing two.
 */

import { computed, ref, type ComputedRef } from 'vue'

import type { Category } from '@/types/product'
import type { ApiError } from '@/api/client'

const categories = ref<Category[]>([])
const isLoading = ref(false)
const error = ref<ApiError | null>(null)

export interface UseCategoriesResult {
  categories: ComputedRef<Category[]>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<ApiError | null>
  /** Re-fetches after a failure. The success path never re-fetches. */
  reload: () => Promise<void>
}

/** TODO(section 2): fetch once, dedupe concurrent callers, keep the result. */
export function useCategories(): UseCategoriesResult {
  function reload(): Promise<void> {
    return Promise.reject(new Error('useCategories.reload is not implemented yet'))
  }

  // See useProducts: computed keeps the exposed type identical to Category.
  return {
    categories: computed(() => categories.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    reload,
  }
}

/** Test hook: clears the module-level cache between test cases. */
export function resetCategoriesCache(): void {
  categories.value = []
  isLoading.value = false
  error.value = null
}
