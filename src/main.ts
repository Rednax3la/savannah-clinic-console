import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setTokenProvider } from './api/client'
import { useAuthStore } from './stores/auth'

import './assets/styles/tokens.css'
import './assets/styles/base.css'

const app = createApp(App)

app.use(createPinia())

// Give the HTTP client a way to read the current token without importing the
// store into the client (which would be circular). Must run after Pinia is
// installed and before the router resolves its first route.
const auth = useAuthStore()
setTokenProvider(() => auth.accessToken)

app.use(router)

app.mount('#app')
