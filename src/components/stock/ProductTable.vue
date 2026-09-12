<script setup lang="ts">
import type { Product } from '@/types/product'

withDefaults(defineProps<{ products?: readonly Product[]; listUrl?: string }>(), {
  products: () => [],
  listUrl: '/',
})
</script>

<template>
  <table class="table">
    <caption class="visually-hidden">
      Clinic stock items
    </caption>
    <thead>
      <tr>
        <th scope="col">Item</th>
        <th scope="col">Category</th>
        <th scope="col">Stock</th>
        <th scope="col">Price (USD)</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="product in products" :key="product.id">
        <td>
          <RouterLink
            class="touch-link"
            :to="{ name: 'item-detail', params: { id: product.id }, query: { from: listUrl } }"
          >
            {{ product.title }}
          </RouterLink>
        </td>
        <td>{{ product.category }}</td>
        <td>{{ product.stock }}</td>
        <td>{{ product.price.toFixed(2) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  background-color: var(--color-surface);
}

th,
td {
  padding: var(--space-3);
  text-align: left;
  overflow-wrap: anywhere;
  border-bottom: 1px solid var(--color-border);
}

th {
  background-color: var(--color-surface-sunken);
  font-size: var(--font-size-sm);
}
</style>
