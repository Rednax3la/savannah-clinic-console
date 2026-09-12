<script setup lang="ts">
import SearchInput from './SearchInput.vue'
import CategoryFilter from './CategoryFilter.vue'
import SortControl from './SortControl.vue'
import type { Category, ProductListQuery } from '@/types/product'
defineProps<{
  query: ProductListQuery
  categories: readonly Category[]
  categoriesLoading: boolean
}>()
defineEmits<{
  change: [value: Partial<Pick<ProductListQuery, 'q' | 'category' | 'sortBy' | 'order'>>]
}>()
</script>
<template>
  <section class="toolbar" role="search" aria-label="Filter stock">
    <SearchInput :model-value="query.q" @update:model-value="$emit('change', { q: $event })" />
    <CategoryFilter
      :model-value="query.category ?? ''"
      :categories="categories"
      :disabled="categoriesLoading"
      @update:model-value="$emit('change', { category: $event || null })"
    />
    <SortControl :sort-by="query.sortBy" :order="query.order" @change="$emit('change', $event)" />
  </section>
</template>
<style scoped>
.toolbar {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}
.toolbar > * {
  min-width: 0;
}
@media (min-width: 48rem) {
  .toolbar {
    grid-template-columns: minmax(0, 2fr) repeat(2, minmax(0, 1fr));
    align-items: end;
  }
}
</style>
