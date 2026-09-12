<script setup lang="ts">
withDefaults(
  defineProps<{
    page?: number
    pageCount?: number
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

    <!-- Native select exposes the current page and supports keyboard selection. -->
    <label class="pagination__status"
      >Page
      <select
        aria-label="Stock page"
        :value="page"
        :disabled="disabled"
        @change="$emit('update:page', Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="number in pageCount" :key="number" :value="number">{{ number }}</option>
      </select>
      of {{ pageCount }}
    </label>

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
