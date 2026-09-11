/**
 * Routes and the auth guard.
 *
 * Views are lazy-loaded except the login screen: it is the first thing an
 * unauthenticated visitor sees, so it belongs in the initial bundle.
 *
 * The list query (q, category, sortBy, order, page) lives in the URL and is
 * deliberately *not* declared here — the route accepts any query string and the
 * list view is the one place that parses it.
 */

import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

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
      // Shareable per-item URL: pasting this into chat must open the same item.
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
  scrollBehavior(to, from, savedPosition) {
    // Returning to a list via the back button should land where the user left.
    return savedPosition ?? { top: 0 }
  },
})

/**
 * Guard skeleton.
 *
 * TODO(section 2): attempt `restoreSession()` when `canRestoreSession` is true,
 * so a reloaded tab is not bounced to /login before the refresh token is tried.
 * Until then the guard only handles the plain unauthenticated case.
 */
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth === false) {
    return true
  }

  if (auth.isAuthenticated) {
    return true
  }

  auth.rememberIntendedRoute(to.fullPath)
  return { name: 'login', query: { redirect: to.fullPath } }
})

export default router
