<script setup lang="ts">
/**
 * Stock list screen. Placeholder.
 *
 * This view's only job is composition: it reads the query from the URL, hands
 * it to useProducts(), and lays out the toolbar, list and pagination. It holds
 * no list state of its own.
 */
import StockToolbar from '@/components/stock/StockToolbar.vue'
import ProductList from '@/components/stock/ProductList.vue'
import PaginationControls from '@/components/stock/PaginationControls.vue'

// TODO(section 2): parse the URL query, call useProducts(), render
// loading / empty / error states around ProductList.
</script>

<template>
  <section class="stock" aria-labelledby="stock-heading">
    <h1 id="stock-heading">Stock</h1>

    <StockToolbar />
    <ProductList />
    <PaginationControls />
  </section>
</template>

<style scoped>
.stock {
  display: grid;
  gap: var(--space-4);
}
</style>
