<script setup lang="ts">
/**
 * Chooses between the table and the card layout. Placeholder.
 *
 * The switch is a CSS media query, not a JS width watcher: both layouts are in
 * the DOM and CSS hides one, so there is no resize listener, no hydration
 * mismatch, and no flash of the wrong layout on first paint. The cost is that
 * the hidden branch is still rendered — acceptable at a page size of 20, and
 * the reason the page size is not much larger.
 */
import type { Product } from '@/types/product'

import ProductTable from '@/components/stock/ProductTable.vue'
import ProductCard from '@/components/stock/ProductCard.vue'

withDefaults(defineProps<{ products?: Product[] }>(), { products: () => [] })
</script>

<template>
  <div class="list">
    <div class="list__table">
      <ProductTable :products="products" />
    </div>

    <ul class="list__cards">
      <li v-for="product in products" :key="product.id">
        <ProductCard :product="product" />
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
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
  }

  .list__cards {
    display: none;
  }
}
</style>
