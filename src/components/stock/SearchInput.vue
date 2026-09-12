<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="search">
    <label class="search__label" for="stock-search">Search stock</label>
    <input
      id="stock-search"
      class="search__input"
      type="search"
      name="q"
      autocomplete="off"
      :value="modelValue"
      placeholder="Search by name"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<style scoped>
.search {
  display: grid;
  gap: var(--space-1);
}

.search__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.search__input {
  width: 100%;
  min-height: var(--tap-target-min);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  padding-inline-start: var(--space-6);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%235c5470' stroke-width='1.8'%3E%3Ccircle cx='10' cy='10' r='6'/%3E%3Cpath d='m15 15 5 5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: var(--space-2) center;
}
</style>
