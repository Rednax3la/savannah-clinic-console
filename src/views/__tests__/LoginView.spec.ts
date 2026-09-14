import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import LoginView from '../LoginView.vue'
import { ApiError } from '@/api/client'

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  replace: vi.fn(),
  consumeIntendedRoute: vi.fn(),
}))
vi.mock('@/stores/auth', () => ({ useAuthStore: () => mocks }))
vi.mock('vue-router', () => ({ useRouter: () => ({ replace: mocks.replace }) }))

beforeEach(() => {
  vi.resetAllMocks()
  mocks.signIn.mockResolvedValue(undefined)
  mocks.replace.mockResolvedValue(undefined)
  mocks.consumeIntendedRoute.mockReturnValue('/items/17')
})

describe('login feedback', () => {
  it('does not show a required-password error after success while navigation is pending', async () => {
    let finishNavigation!: () => void
    mocks.replace.mockReturnValue(
      new Promise<void>((resolve) => {
        finishNavigation = resolve
      }),
    )
    const wrapper = mount(LoginView)
    await wrapper.get('#username').setValue('emilys')
    await wrapper.get('#password').setValue('emilyspass')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(mocks.replace).toHaveBeenCalledWith('/items/17')
    expect((wrapper.get('#password').element as HTMLInputElement).value).toBe('')
    expect(wrapper.find('#password-error').exists()).toBe(false)
    expect(wrapper.get('#password').attributes('aria-invalid')).toBe('false')
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    finishNavigation()
    await flushPromises()
    wrapper.unmount()
  })

  it('still validates genuinely missing credentials without sending a request', async () => {
    const wrapper = mount(LoginView)
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('#password-error').text()).toBe('Enter your password.')
    expect(wrapper.get('#username-error').text()).toBe('Enter your username.')
    expect(mocks.signIn).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('retains real login failures and allows a successful retry', async () => {
    mocks.signIn.mockRejectedValueOnce(
      new ApiError('Invalid credentials', { status: 400, url: '' }),
    )
    const wrapper = mount(LoginView)
    await wrapper.get('#username').setValue('emilys')
    await wrapper.get('#password').setValue('wrong')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Invalid credentials')
    expect(wrapper.get('button').attributes('disabled')).toBeUndefined()
    expect(mocks.replace).not.toHaveBeenCalled()
    await wrapper.get('#password').setValue('emilyspass')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.find('#password-error').exists()).toBe(false)
    expect(mocks.replace).toHaveBeenCalledWith('/items/17')
    wrapper.unmount()
  })
})
