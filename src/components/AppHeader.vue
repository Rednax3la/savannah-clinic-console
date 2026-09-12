<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
async function signOut(): Promise<void> {
  auth.signOut()
  await router.replace({ name: 'login' })
}

const displayName = computed(() => {
  const user = auth.user
  if (!user) return null
  return `${user.firstName} ${user.lastName}`.trim() || user.username
})
</script>

<template>
  <!-- First focusable element on the page, so a keyboard user can jump the
       header instead of tabbing through it on every navigation. -->
  <a class="skip-link" href="#main-content">Skip to main content</a>

  <header class="app-header">
    <div class="app-header__inner">
      <RouterLink class="app-header__brand" :to="{ name: 'stock-list' }">
        Clinic Stock Console
      </RouterLink>

      <div class="app-header__user">
        <span v-if="displayName">{{ displayName }}</span>
        <button v-if="auth.refreshToken" type="button" @click="signOut">Sign out</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: var(--color-grape);
  color: var(--color-text-on-grape);
  box-shadow: var(--shadow-sm);
}

.app-header__inner {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
  max-width: var(--layout-max-width);
  margin-inline: auto;
  padding: var(--space-3) var(--space-4);
  min-height: var(--tap-target-min);
}

.app-header__brand {
  color: inherit;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  text-decoration: none;
}

.app-header__user {
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  overflow-wrap: anywhere;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-sm);
}
</style>
