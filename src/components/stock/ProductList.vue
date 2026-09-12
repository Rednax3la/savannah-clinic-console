<script setup lang="ts">
import type { Product } from '@/types/product'

import ProductTable from '@/components/stock/ProductTable.vue'
import ProductCard from '@/components/stock/ProductCard.vue'

withDefaults(defineProps<{ products?: readonly Product[]; listUrl?: string }>(), {
  products: () => [],
  listUrl: '/',
})
</script>

<template>
  <div class="list">
    <div class="list__table">
      <ProductTable :products="products" :list-url="listUrl" />
    </div>

    <ul class="list__cards">
      <li v-for="product in products" :key="product.id">
        <ProductCard :product="product" :list-url="listUrl" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.list__cards {
  display: grid;
  gap: var(--space-3);
  padding: 0;
  margin: 0;
  list-style: none;
}

.list__table {
  display: none;
}

@media (min-width: 48rem) {
  .list__table {
    display: block;
    overflow-x: auto;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }

  .list__cards {
    display: none;
  }
}
</style>
