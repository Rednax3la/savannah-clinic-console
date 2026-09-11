<script setup lang="ts">
/**
 * Tabular stock list for tablet and desktop. Placeholder.
 *
 * A real <table> rather than a CSS grid: the data is tabular, and a table gives
 * screen readers row and column context for free.
 */
import type { Product } from '@/types/product'

withDefaults(defineProps<{ products?: Product[] }>(), { products: () => [] })
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
        <th scope="col">Price</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="product in products" :key="product.id">
        <td>
          <RouterLink :to="{ name: 'item-detail', params: { id: product.id } }">
            {{ product.title }}
          </RouterLink>
        </td>
        <td>{{ product.category }}</td>
        <td>{{ product.stock }}</td>
        <td>{{ product.price }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-surface);
}

th,
td {
  padding: var(--space-3);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

th {
  background-color: var(--color-surface-sunken);
  font-size: var(--font-size-sm);
}
</style>
