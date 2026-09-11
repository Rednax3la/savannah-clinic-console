<script setup lang="ts">
/**
 * Previous / page / next. Placeholder.
 *
 * Buttons that emit, not RouterLinks: the view owns the URL and knows which
 * other params have to be preserved when the page changes.
 */
withDefaults(
  defineProps<{
    /** 1-based, matching what the user sees. */
    page?: number
    pageCount?: number
    /** Dimmed rather than removed while a fetch is in flight. */
    disabled?: boolean
  }>(),
  { page: 1, pageCount: 1, disabled: false },
)

defineEmits<{ 'update:page': [page: number] }>()
</script>

<template>
  <nav class="pagination" aria-label="Stock pages">
    <button
      class="pagination__button"
      type="button"
      :disabled="disabled || page <= 1"
      @click="$emit('update:page', page - 1)"
    >
      Previous
    </button>

    <!-- aria-live: a keyboard user who activates Next hears the new position
         without having to go looking for it. -->
    <p class="pagination__status" aria-live="polite">Page {{ page }} of {{ pageCount }}</p>

    <button
      class="pagination__button"
      type="button"
      :disabled="disabled || page >= pageCount"
      @click="$emit('update:page', page + 1)"
    >
      Next
    </button>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
}

.pagination__button {
  min-height: var(--tap-target-min);
  padding-inline: var(--space-4);
  color: var(--color-text-on-grape);
  background-color: var(--color-grape);
  border: 0;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

.pagination__button:disabled {
  cursor: not-allowed;
  background-color: var(--color-border-strong);
}

.pagination__status {
  font-size: var(--font-size-sm);
}
</style>
