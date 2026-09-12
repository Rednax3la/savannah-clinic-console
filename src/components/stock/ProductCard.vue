<script setup lang="ts">
import type { Product } from '@/types/product'
import ProductImage from '@/components/ui/ProductImage.vue'

withDefaults(defineProps<{ product: Product; listUrl?: string }>(), { listUrl: '/' })
</script>

<template>
  <article class="card">
    <div class="card__identity">
      <ProductImage class="card__image" :src="product.thumbnail" :title="product.title" />
      <h3 class="card__title">
        <!-- The whole title is the link target: a bigger tap area than an icon,
           and the accessible name is the item name rather than "view". -->
        <RouterLink
          class="touch-link"
          :to="{ name: 'item-detail', params: { id: product.id }, query: { from: listUrl } }"
        >
          {{ product.title }}
        </RouterLink>
      </h3>
    </div>

    <dl class="card__meta">
      <div class="card__quantity">
        <dt>Stock</dt>
        <dd class="card__stock">{{ product.stock }}</dd>
      </div>
      <div>
        <dt>Category</dt>
        <dd>{{ product.category }}</dd>
      </div>
      <div>
        <dt>Price (USD)</dt>
        <dd>{{ product.price.toFixed(2) }}</dd>
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
  box-shadow: var(--shadow-sm), var(--shadow-inset);
  border-top: 3px solid var(--color-border-strong);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  min-width: 0;
}
.card:hover,
.card:focus-within {
  border-color: var(--color-grape-light);
  box-shadow: var(--shadow-md);
}
.card__identity {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border-soft);
}
.card__image {
  width: var(--image-size-card);
}
.card__title {
  min-width: 0;
}
.card__title a {
  text-decoration: none;
}
.card__title a:hover {
  text-decoration: underline;
}
.card__stock {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  color: var(--color-grape);
  font-variant-numeric: tabular-nums;
}
.card__meta > div {
  min-width: 0;
  overflow-wrap: anywhere;
}

.card__title {
  font-size: var(--font-size-base);
}

.card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  font-size: var(--font-size-sm);
  align-items: center;
}
.card__quantity {
  padding-inline-end: var(--space-4);
  border-inline-end: 1px solid var(--color-border-soft);
}
.card__quantity dt {
  color: var(--color-grape);
  font-weight: var(--font-weight-bold);
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
