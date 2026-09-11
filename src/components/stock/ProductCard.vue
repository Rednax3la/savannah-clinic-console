<script setup lang="ts">
/**
 * Single stock item as a card, for narrow screens. Placeholder.
 */
import type { Product } from '@/types/product'

defineProps<{ product: Product }>()
</script>

<template>
  <article class="card">
    <h3 class="card__title">
      <!-- The whole title is the link target: a bigger tap area than an icon,
           and the accessible name is the item name rather than "view". -->
      <RouterLink :to="{ name: 'item-detail', params: { id: product.id } }">
        {{ product.title }}
      </RouterLink>
    </h3>

    <dl class="card__meta">
      <div>
        <dt>Category</dt>
        <dd>{{ product.category }}</dd>
      </div>
      <div>
        <dt>Stock</dt>
        <dd>{{ product.stock }}</dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
.card {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-4);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.card__title {
  font-size: var(--font-size-base);
}

.card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  font-size: var(--font-size-sm);
}

dt {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

dd {
  margin: 0;
  font-weight: var(--font-weight-medium);
}
</style>
