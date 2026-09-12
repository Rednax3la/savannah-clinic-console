<script setup lang="ts">
import type { ProductSortField, SortOrder } from '@/types/product'

defineProps<{
  sortBy: ProductSortField
  order: SortOrder
  disabled?: boolean
}>()

const emit = defineEmits<{ change: [value: { sortBy: ProductSortField; order: SortOrder }] }>()

const OPTIONS: { value: string; label: string; sortBy: ProductSortField; order: SortOrder }[] = [
  { value: 'meta.createdAt-desc', label: 'Newest first', sortBy: 'meta.createdAt', order: 'desc' },
  { value: 'meta.createdAt-asc', label: 'Oldest first', sortBy: 'meta.createdAt', order: 'asc' },
  { value: 'title-asc', label: 'Name (A–Z)', sortBy: 'title', order: 'asc' },
  { value: 'title-desc', label: 'Name (Z–A)', sortBy: 'title', order: 'desc' },
  { value: 'stock-asc', label: 'Stock (lowest first)', sortBy: 'stock', order: 'asc' },
  { value: 'stock-desc', label: 'Stock (highest first)', sortBy: 'stock', order: 'desc' },
  { value: 'price-asc', label: 'Price (lowest first)', sortBy: 'price', order: 'asc' },
  { value: 'price-desc', label: 'Price (highest first)', sortBy: 'price', order: 'desc' },
]

function onChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  const option = OPTIONS.find((candidate) => candidate.value === value)
  if (!option) return
  emit('change', { sortBy: option.sortBy, order: option.order })
}
</script>

<template>
  <div class="sort">
    <label class="sort__label" for="stock-sort">Sort by</label>
    <select
      id="stock-sort"
      class="sort__select"
      name="sort"
      :value="`${sortBy}-${order}`"
      :disabled="disabled"
      @change="onChange"
    >
      <option v-for="option in OPTIONS" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.sort {
  grid-template-columns: minmax(0, 1fr);
  display: grid;
  gap: var(--space-1);
}

.sort__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.sort__select {
  min-height: var(--tap-target-min);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
}
</style>
