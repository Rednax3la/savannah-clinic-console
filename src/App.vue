<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/AppHeader.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
const route = useRoute()
const auth = useAuthStore()
</script>
<template>
  <AppHeader v-if="route.meta.requiresAuth !== false" />
  <main id="main-content" class="app-main" tabindex="-1">
    <template v-if="route.meta.requiresAuth !== false">
      <ErrorState
        v-if="auth.sessionError"
        title="Your session needs a connection"
        :message="auth.sessionError"
        :pending="auth.isRestoring"
        retry-label="Restore session"
        @retry="auth.retrySession"
      />
      <LoadingState v-else-if="!auth.user" label="Restoring your session" />
      <p v-if="auth.user && auth.isRestoring" role="status">Refreshing your session...</p>
      <RouterView v-if="auth.user" v-show="!auth.sessionError" />
    </template>
    <RouterView v-else />
  </main>
</template>
<style scoped>
.app-main {
  max-width: var(--layout-max-width);
  margin-inline: auto;
  padding: var(--space-5) var(--space-4) var(--space-7);
}
@media (max-width: 30rem) {
  .app-main {
    padding: var(--space-4) var(--space-3) var(--space-6);
  }
}
</style>
