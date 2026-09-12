import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setTokenProvider, setSessionHandlers } from './api/client'
import { useAuthStore } from './stores/auth'
import './assets/styles/tokens.css'
import './assets/styles/base.css'
const app = createApp(App)
app.use(createPinia())
const auth = useAuthStore()
setTokenProvider(() => auth.accessToken)
setSessionHandlers({
  ensure: auth.ensureSession,
  refresh: auth.refreshSession,
  reject: auth.clearSession,
})
watch(
  () => auth.refreshToken,
  (token, previous) => {
    if (!token && previous && router.currentRoute.value.meta.requiresAuth !== false) {
      auth.rememberIntendedRoute(router.currentRoute.value.fullPath)
      void router.replace({ name: 'login' })
    }
  },
)
auth.startExpiryMonitor()
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && auth.refreshToken && !auth.sessionError) {
    void auth.ensureSession().catch(() => {
      /* App renders the store's recovery state. */
    })
  }
})
app.use(router)
app.mount('#app')
