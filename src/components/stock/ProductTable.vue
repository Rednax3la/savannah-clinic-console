<script setup lang="ts">
import type { Product } from '@/types/product'
import ProductImage from '@/components/ui/ProductImage.vue'

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
          <div class="table__identity">
            <ProductImage class="table__image" :src="product.thumbnail" :title="product.title" />
            <RouterLink
              class="touch-link"
              :to="{ name: 'item-detail', params: { id: product.id }, query: { from: listUrl } }"
            >
              {{ product.title }}
            </RouterLink>
          </div>
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
.table__identity {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.table__image {
  width: var(--image-size-row);
}
.table__identity a {
  min-width: 0;
}

th,
td {
  padding: var(--space-4) var(--space-5);
  text-align: left;
  overflow-wrap: anywhere;
  border-bottom: 1px solid var(--color-border-soft);
}

th {
  background: linear-gradient(180deg, var(--color-surface-muted), var(--color-surface-sunken));
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
th:first-child {
  width: 40%;
}
th:nth-child(n + 3),
td:nth-child(n + 3) {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
td:nth-child(3) {
  font-family: var(--font-heading);
  font-size: var(--font-size-xl);
  color: var(--color-grape);
}
td:nth-child(2) {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
tbody tr {
  transition: background-color var(--transition-fast);
}
tbody tr:hover,
tbody tr:focus-within {
  background: var(--color-surface-muted);
}
tbody tr:last-child td {
  border-bottom: 0;
}
.touch-link {
  font-weight: var(--font-weight-medium);
  text-decoration: none;
}
.touch-link:hover {
  text-decoration: underline;
}
@media (max-width: 64rem) {
  th,
  td {
    padding: var(--space-3);
  }
}
</style>
