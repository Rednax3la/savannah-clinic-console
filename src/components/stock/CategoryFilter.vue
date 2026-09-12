<script setup lang="ts">
import type { Category } from '@/types/product'

withDefaults(
  defineProps<{
    modelValue: string
    categories?: readonly Category[]
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
      <option
        v-if="modelValue && !categories.some((category) => category.slug === modelValue)"
        :value="modelValue"
      >
        {{ modelValue }} (unavailable category)
      </option>
      <option v-for="category in categories" :key="category.slug" :value="category.slug">
        {{ category.name }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.filter {
  grid-template-columns: minmax(0, 1fr);
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
