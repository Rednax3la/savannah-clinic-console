<script setup lang="ts">
/**
 * Item detail screen at /items/:id. Placeholder.
 *
 * The id comes from the route, not from a prop passed by the list, so that a
 * pasted URL opens the same item with no list context loaded.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import StockEditor from '@/components/stock/StockEditor.vue'

const route = useRoute()

/** Route regex already restricts this to digits, so the parse cannot be NaN. */
const productId = computed(() => Number(route.params.id))

// TODO(section 2): useProduct(productId), loading / error states, back link
// that preserves the list query the user arrived from.
</script>

<template>
  <article class="item" aria-labelledby="item-heading">
    <p class="item__back">
      <RouterLink :to="{ name: 'stock-list' }">Back to stock</RouterLink>
    </p>

    <h1 id="item-heading">Stock item #{{ productId }}</h1>

    <StockEditor />
  </article>
</template>

<style scoped>
.item {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-5);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.item__back {
  font-size: var(--font-size-sm);
}
</style>
