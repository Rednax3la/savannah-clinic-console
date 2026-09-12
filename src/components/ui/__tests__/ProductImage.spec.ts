import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProductImage from '../ProductImage.vue'

// URLs copied from the DummyJSON /products/1 response.
const primary =
  'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp'
const thumbnail =
  'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp'

describe('ProductImage', () => {
  it('falls back from a failed primary image, then shows an accessible placeholder', async () => {
    const wrapper = mount(ProductImage, {
      props: { src: primary, fallbackSrc: thumbnail, title: 'Mascara' },
    })
    expect(wrapper.get('img').attributes('alt')).toBe('Mascara')
    await wrapper.get('img').trigger('error')
    expect(wrapper.get('img').attributes('src')).toBe(thumbnail)
    await wrapper.get('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('[role="img"]').attributes('aria-label')).toBe(
      'Image unavailable for Mascara',
    )
    await wrapper.setProps({ src: thumbnail, fallbackSrc: undefined })
    expect(wrapper.get('img').attributes('src')).toBe(thumbnail)
  })

  it('handles absent sources without making an empty image request', () => {
    const wrapper = mount(ProductImage, { props: { title: 'Supply' } })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('[role="img"]').attributes('aria-label')).toContain('Supply')
  })

  it('loads list images lazily and the visible detail image eagerly with reserved dimensions', async () => {
    const wrapper = mount(ProductImage, { props: { src: thumbnail, title: 'Mascara' } })
    expect(wrapper.get('img').attributes('loading')).toBe('lazy')
    expect(wrapper.get('img').attributes('width')).toBe('320')
    expect(wrapper.get('img').attributes('height')).toBe('320')
    await wrapper.setProps({ eager: true })
    expect(wrapper.get('img').attributes('loading')).toBe('eager')
  })
})
