<script setup lang="ts">
/**
 * Error state. Always carries a recovery action — the brief requires that every
 * error offers the user a way forward, so `retry` is part of the contract
 * rather than an optional extra.
 */
withDefaults(
  defineProps<{
    title?: string
    /** Human-readable detail. Never a raw stack trace. */
    message?: string
    retryLabel?: string
    /** Set while a retry is in flight, to stop repeat submissions. */
    pending?: boolean
  }>(),
  {
    title: 'Something went wrong',
    message: 'The request did not complete.',
    retryLabel: 'Try again',
    pending: false,
  },
)

defineEmits<{ retry: [] }>()
</script>

<template>
  <!-- role="alert" so the failure is announced immediately; a user who has just
       tapped a button needs to know it failed without hunting for the message. -->
  <div class="error" role="alert">
    <p class="error__title">{{ title }}</p>
    <p class="error__message">{{ message }}</p>

    <button class="error__retry" type="button" :disabled="pending" @click="$emit('retry')">
      {{ pending ? 'Retrying…' : retryLabel }}
    </button>
  </div>
</template>

<style scoped>
.error {
  display: grid;
  gap: var(--space-2);
  justify-items: start;
  padding: var(--space-4);
  background-color: var(--color-danger-surface);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-lg);
}

.error__title {
  color: var(--color-danger);
  font-weight: var(--font-weight-bold);
}

.error__message {
  font-size: var(--font-size-sm);
}

.error__retry {
  min-height: var(--tap-target-min);
  padding-inline: var(--space-4);
  color: var(--color-text-on-grape);
  background-color: var(--color-grape);
  border: 0;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

.error__retry:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
