import { readonly, ref } from 'vue'
import { fetchCategories } from '@/api/products'
import type { Category } from '@/types/product'
const categories = ref<Category[]>([])
const isLoading = ref(false)
const error = ref<unknown>(null)
let loaded = false
let pending: Promise<void> | null = null
export function useCategories() {
  function reload(): Promise<void> {
    if (pending) return pending
    isLoading.value = true
    error.value = null
    pending = fetchCategories()
      .then((result) => {
        categories.value = result
        loaded = true
      })
      .catch((cause: unknown) => {
        error.value = cause
      })
      .finally(() => {
        isLoading.value = false
        pending = null
      })
    return pending
  }
  if (!loaded && !pending) void reload()
  return {
    categories: readonly(categories),
    isLoading: readonly(isLoading),
    error: readonly(error),
    reload,
  }
}
