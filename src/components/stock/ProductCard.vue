<script setup lang="ts">
import type { Product } from '@/types/product'
import ProductImage from '@/components/ui/ProductImage.vue'

withDefaults(defineProps<{ product: Product; listUrl?: string }>(), { listUrl: '/' })
</script>

<template>
  <article class="card">
    <RouterLink
      class="card__identity"
      :aria-labelledby="`product-title-${product.id}`"
      :to="{ name: 'item-detail', params: { id: product.id }, query: { from: listUrl } }"
    >
      <ProductImage class="card__image" :src="product.thumbnail" :title="product.title" />
      <h2 :id="`product-title-${product.id}`" class="card__title">{{ product.title }}</h2>
    </RouterLink>
    <p class="card__category">{{ product.category.replaceAll('-', ' ') }}</p>
    <dl class="card__meta">
      <div>
        <dt>In stock</dt>
        <dd class="card__stock">{{ product.stock }}</dd>
      </div>
      <div class="card__price">
        <dt>Price (USD)</dt>
        <dd>{{ product.price.toFixed(2) }}</dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  height: 100%;
  min-width: 0;
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}
.card:hover,
.card:focus-within {
  border-color: var(--color-grape-light);
  box-shadow: var(--shadow-md);
}
.card__identity {
  display: grid;
  gap: var(--space-4);
  min-width: 0;
  text-decoration: none;
  border-radius: var(--radius-md);
}
.card__image {
  width: 100%;
  max-width: 26rem;
  justify-self: center;
}
.card__title {
  font-family: var(--font-sans);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-base);
  overflow-wrap: anywhere;
}
.card__identity:hover .card__title {
  text-decoration: underline;
}
.card__category {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  text-transform: capitalize;
}
.card__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: end;
  gap: var(--space-3);
  margin-top: auto;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-soft);
}
.card__meta > div {
  min-width: 0;
  overflow-wrap: anywhere;
}
dt {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
dd {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  font-variant-numeric: tabular-nums;
}
.card__stock {
  color: var(--color-grape);
  font-family: var(--font-heading);
  font-size: 2rem;
}
.card__price {
  text-align: right;
}
</style>
