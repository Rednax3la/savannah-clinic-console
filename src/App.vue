<script setup lang="ts">
import { useRoute } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()

// The login screen is chromeless: there is no user to show in a header yet.
</script>

<template>
  <AppHeader v-if="route.meta.requiresAuth !== false" />

  <main id="main-content" class="app-main">
    <RouterView />
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
