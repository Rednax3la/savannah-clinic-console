import type * as ProductApi from '@/api/products'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, effectScope, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import StockEditor from '../StockEditor.vue'
import { useProduct } from '@/composables/useProduct'
import {
  beginProductSession,
  cachedProduct,
  clearProductSession,
} from '@/composables/productSession'
import { fetchProduct, updateProductStock } from '@/api/products'
import { ApiError, errorMessage } from '@/api/client'
vi.mock('@/api/products', async (original) => ({
  ...(await original<typeof ProductApi>()),
  fetchProduct: vi.fn(),
  updateProductStock: vi.fn(),
}))
const item = {
  id: 17,
  title: 'Stock item',
  description: '',
  category: 'beauty',
  stock: 14,
  price: 3,
}
beforeEach(() => {
  vi.resetAllMocks()
  sessionStorage.clear()
  clearProductSession()
  beginProductSession(1)
})
describe('pessimistic stock correction', () => {
  it('aborts a pending save on disposal and ignores a late successful response', async () => {
    vi.mocked(fetchProduct).mockResolvedValue(item)
    let finish!: (product: typeof item) => void
    vi.mocked(updateProductStock).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    const scope = effectScope()
    const detail = scope.run(() => useProduct(ref(17)))!
    await flushPromises()
    const saved = detail.saveStock(19)
    const signal = vi.mocked(updateProductStock).mock.calls[0]?.[2]
    expect(signal?.aborted).toBe(false)
    scope.stop()
    expect(signal?.aborted).toBe(true)
    finish({ ...item, stock: 19 })
    expect(await saved).toBe(false)
    expect(cachedProduct.value?.stock).toBe(14)
  })
  it('keeps confirmed stock and the draft after a failed PUT, then updates both cache and screen on retry', async () => {
    vi.mocked(fetchProduct).mockResolvedValue(item)
    let reject!: (error: Error) => void
    vi.mocked(updateProductStock)
      .mockReturnValueOnce(
        new Promise((_resolve, no) => {
          reject = no
        }),
      )
      .mockResolvedValueOnce({ ...item, stock: 17 })
    const Host = defineComponent({
      components: { StockEditor },
      setup() {
        return { ...useProduct(ref(17)), errorMessage }
      },
      template:
        '<StockEditor v-if="product" :current-stock="product.stock" :pending="isSaving" :error="saveError ? errorMessage(saveError) : String()" :save="saveStock" />',
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await flushPromises()
    await wrapper.get('button').trigger('click')
    expect(document.activeElement).toBe(wrapper.get('input').element)
    await wrapper.get('input').setValue('17')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button[type="submit"]').text()).toBe('Saving...')
    expect(wrapper.get('.editor__value').text()).toBe('14')
    reject(new ApiError('Server unavailable', { status: 500, url: '/products/17' }))
    await flushPromises()
    expect(wrapper.get('.editor__value').text()).toBe('14')
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('17')
    expect(wrapper.get('input').attributes('disabled')).toBeUndefined()
    expect(wrapper.get('[role="alert"]').text()).toContain('Server unavailable')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('.editor__value').text()).toBe('17')
    expect(wrapper.get('[role="status"]').text()).toContain('saved')
    expect(document.activeElement).toBe(wrapper.get('button').element)
    wrapper.unmount()
    // DummyJSON returns the old value again; the session correction wins.
    const reopened = mount(Host)
    await flushPromises()
    expect(reopened.get('.editor__value').text()).toBe('17')
    reopened.unmount()
  })
  it('validates counts and restores focus on Cancel without submitting', async () => {
    const save = vi.fn().mockResolvedValue(true)
    const wrapper = mount(StockEditor, {
      props: { currentStock: 14, pending: false, error: '', save },
      attachTo: document.body,
    })
    await wrapper.get('button').trigger('click')
    await wrapper.get('input').setValue('-1')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(save).not.toHaveBeenCalled()
    expect(wrapper.get('[role="alert"]').text()).toContain('whole number')
    await wrapper.get('button[type="button"]').trigger('click')
    await flushPromises()
    expect(document.activeElement).toBe(wrapper.get('button').element)
    wrapper.unmount()
  })
})
