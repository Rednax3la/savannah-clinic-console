import { readonly, shallowRef } from 'vue'
import type { Product } from '@/types/product'
import { readSession, writeSession } from '@/utils/storage'
const KEY = 'clinic-console.stockCorrections'
const lastProduct = shallowRef<Product | null>(null)
const corrections = shallowRef<Record<string, number>>({})
let owner: number | null = null
// Only corrected counts are persisted, not a second product catalogue. They belong
// to this signed-in tab session and survive reload; sign-out/account change clears them.
export function beginProductSession(userId: number): void {
  if (owner === userId) return
  owner = userId
  lastProduct.value = null
  corrections.value = {}
  try {
    const value: unknown = JSON.parse(readSession(KEY) ?? 'null')
    if (
      value &&
      typeof value === 'object' &&
      'userId' in value &&
      value.userId === userId &&
      'counts' in value &&
      value.counts &&
      typeof value.counts === 'object'
    ) {
      for (const [id, count] of Object.entries(value.counts)) {
        if (
          /^\d+$/.test(id) &&
          typeof count === 'number' &&
          Number.isSafeInteger(count) &&
          count >= 0
        )
          corrections.value[id] = count
      }
    }
  } catch {
    /* Ignore malformed browser storage. */
  }
}
export function clearProductSession(): void {
  owner = null
  lastProduct.value = null
  corrections.value = {}
  writeSession(KEY, null)
}
export function withStockCorrection(product: Product): Product {
  const stock = corrections.value[product.id]
  return stock === undefined ? product : { ...product, stock }
}
export function cacheProduct(product: Product): void {
  lastProduct.value = withStockCorrection(product)
}
export function confirmStock(product: Product): void {
  corrections.value = { ...corrections.value, [product.id]: product.stock }
  writeSession(KEY, JSON.stringify({ userId: owner, counts: corrections.value }))
  if (lastProduct.value?.id === product.id) cacheProduct(product)
}
export const cachedProduct = readonly(lastProduct)
