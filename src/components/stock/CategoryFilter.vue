<script setup lang="ts">
/**
 * Category filter. Placeholder.
 *
 * A native <select> rather than a custom dropdown: it is keyboard operable and
 * screen-reader correct with no work from us, and on a ward tablet it opens the
 * platform picker, which is the larger tap target.
 */
import type { Category } from '@/types/product'

withDefaults(
  defineProps<{
    /** Empty string means "all categories". */
    modelValue: string
    categories?: Category[]
    disabled?: boolean
  }>(),
  { categories: () => [], disabled: false },
)

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="filter">
    <label class="filter__label" for="stock-category">Category</label>
    <select
      id="stock-category"
      class="filter__select"
      name="category"
      :value="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">All categories</option>
      <option v-for="category in categories" :key="category.slug" :value="category.slug">
        {{ category.name }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.filter {
  display: grid;
  gap: var(--space-1);
}

.filter__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.filter__select {
  min-height: var(--tap-target-min);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
}
</style>
