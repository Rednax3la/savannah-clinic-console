import { createRouter, createWebHistory, type Router } from 'vue-router'
import { nextTick } from 'vue'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'
export function installAuthGuard(target: Router): void {
  target.beforeEach(async (to) => {
    if (to.meta.requiresAuth === false) return true
    const auth = useAuthStore()
    try {
      if (await auth.ensureSession()) return true
    } catch {
      // Retain the destination and render App's recoverable session error there.
      if (auth.refreshToken) return true
    }
    auth.rememberIntendedRoute(to.fullPath)
    return { name: 'login' }
  })
}
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false, title: 'Sign in' },
    },
    {
      path: '/',
      name: 'stock-list',
      component: () => import('@/views/StockListView.vue'),
      meta: { requiresAuth: true, title: 'Stock' },
    },
    {
      path: '/items/:id(\\d+)',
      name: 'item-detail',
      component: () => import('@/views/ItemDetailView.vue'),
      meta: { requiresAuth: true, title: 'Stock item' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { requiresAuth: false, title: 'Not found' },
    },
  ],
  scrollBehavior(to, from, saved) {
    return saved ?? (to.path === from.path ? false : { top: 0 })
  },
})
installAuthGuard(router)
router.afterEach((to, from, failure) => {
  if (failure) return
  document.title = `${typeof to.meta.title === 'string' ? to.meta.title : 'Stock'} | Clinic Stock Console`
  if (to.path !== from.path) void nextTick(() => document.getElementById('main-content')?.focus())
})
export default router
