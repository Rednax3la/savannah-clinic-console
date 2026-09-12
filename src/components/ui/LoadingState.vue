<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'skeleton' | 'spinner'
    rows?: number
    label?: string
  }>(),
  { variant: 'spinner', rows: 5, label: 'Loading' },
)
</script>

<template>
  <!-- A polite live region: a screen reader user is told that
       something is loading without the DOM churn being announced row by row. -->
  <div class="loading" role="status" aria-live="polite">
    <span class="visually-hidden">{{ label }}</span>

    <template v-if="variant === 'skeleton'">
      <div v-for="row in rows" :key="row" class="loading__row" />
    </template>

    <div v-else class="loading__spinner" />
  </div>
</template>

<style scoped>
.loading {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.loading__row {
  height: 4rem;
  background-image: linear-gradient(
    100deg,
    transparent 20%,
    rgb(255 255 255 / 70%) 50%,
    transparent 80%
  );
  background-size: 200% 100%;
  background-color: var(--color-surface-sunken);
  border-radius: var(--radius-md);
  animation: shimmer 1.8s ease-in-out infinite;
}

.loading__spinner {
  width: 2rem;
  height: 2rem;
  margin-inline: auto;
  border: 3px solid var(--color-surface-sunken);
  border-top-color: var(--color-grape);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

@keyframes spin {
  to {
    transform: rotate(1turn);
  }
}
</style>
