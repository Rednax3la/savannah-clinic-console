import { computed, onScopeDispose, readonly, ref, watch, type Ref } from 'vue'
import { fetchProduct, updateProductStock } from '@/api/products'
import { ApiError, isAbortError } from '@/api/client'
import { cacheProduct, cachedProduct, confirmStock } from './productSession'
export function useProduct(id: Readonly<Ref<number>>, delayMs: Readonly<Ref<number>> = ref(0)) {
  const isLoading = ref(false)
  const isRefreshing = ref(false)
  const error = ref<unknown>(null)
  const saveError = ref<unknown>(null)
  const isSaving = ref(false)
  const reload = ref(0)
  const product = computed(() =>
    cachedProduct.value?.id === id.value ? cachedProduct.value : null,
  )
  let mutationController: AbortController | null = null
  let generation = 0
  onScopeDispose(() => {
    generation++
    mutationController?.abort()
  })
  let controller: AbortController | null = null
  watch(
    [id, delayMs, reload],
    ([current, delay], _previous, onCleanup) => {
      const requestId = ++generation
      const requestController = new AbortController()
      controller = requestController
      let active = true
      onCleanup(() => {
        mutationController?.abort()
        active = false
        requestController.abort()
      })
      const ownsView = () => active && generation === requestId
      error.value = null
      saveError.value = null
      isSaving.value = false
      if (!Number.isSafeInteger(current) || current < 1) {
        error.value = new ApiError('This item link is invalid.', { status: 404, url: '' })
        isLoading.value = false
        isRefreshing.value = false
        return
      }
      isLoading.value = !product.value
      isRefreshing.value = !!product.value
      void (async () => {
        try {
          const result = await fetchProduct(current, requestController.signal, delay)
          if (ownsView()) cacheProduct(result)
        } catch (cause) {
          if (ownsView() && !isAbortError(cause)) error.value = cause
        } finally {
          if (ownsView()) {
            isLoading.value = false
            isRefreshing.value = false
          }
        }
      })()
    },
    { immediate: true, flush: 'sync' },
  )
  function retry(): void {
    reload.value++
  }
  async function saveStock(stock: number): Promise<boolean> {
    if (isSaving.value || !product.value || !Number.isSafeInteger(stock) || stock < 0) return false
    const current = id.value
    const requestId = generation
    controller?.abort()
    isRefreshing.value = false
    isSaving.value = true
    saveError.value = null
    mutationController = new AbortController()
    try {
      const result = await updateProductStock(current, stock, mutationController.signal)
      // A navigation may dispose this consumer; never mutate a different item.
      if (requestId !== generation || current !== id.value) return false
      confirmStock(result)
      return true
    } catch (cause) {
      if (requestId === generation) saveError.value = cause
      return false
    } finally {
      if (requestId === generation) isSaving.value = false
    }
  }
  return {
    product,
    isLoading: readonly(isLoading),
    isRefreshing: readonly(isRefreshing),
    error: readonly(error),
    isSaving: readonly(isSaving),
    saveError: readonly(saveError),
    retry,
    saveStock,
  }
}
