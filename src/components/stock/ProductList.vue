<script setup lang="ts">
import type { Product } from '@/types/product'

import ProductCard from '@/components/stock/ProductCard.vue'

withDefaults(defineProps<{ products?: readonly Product[]; listUrl?: string }>(), {
  products: () => [],
  listUrl: '/',
})
</script>

<template>
  <div class="list">
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
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
  gap: var(--space-5);
  padding: 0;
  margin: 0;
  list-style: none;
}

.list__cards > li {
  min-width: 0;
}
</style>
