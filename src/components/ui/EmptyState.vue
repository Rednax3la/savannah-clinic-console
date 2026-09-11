<script setup lang="ts">
/**
 * Empty result. Not an error: no ARIA alert, no red, and the message is passed
 * in by the caller so it can name what was actually searched for.
 */
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
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
}

.empty__title {
  font-weight: var(--font-weight-bold);
}

.empty__message {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>
