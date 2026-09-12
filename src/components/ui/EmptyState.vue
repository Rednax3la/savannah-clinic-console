<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    message?: string
  }>(),
  { title: 'Nothing to show', message: '' },
)
</script>

<template>
  <div class="empty">
    <p class="empty__title">{{ title }}</p>
    <p v-if="message" class="empty__message">{{ message }}</p>
    <!-- Caller can offer a way out, e.g. "clear filters". -->
    <slot name="action" />
  </div>
</template>

<style scoped>
.empty {
  display: grid;
  gap: var(--space-2);
  justify-items: center;
  padding: var(--space-6) var(--space-4);
  text-align: center;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.empty__title {
  font-family: var(--font-heading);
  font-size: var(--font-size-xl);
  color: var(--color-grape);
}

.empty__message {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>
