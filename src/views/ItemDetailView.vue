<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import StockEditor from '@/components/stock/StockEditor.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useProduct } from '@/composables/useProduct'
import { ApiError, errorMessage } from '@/api/client'
import { listDestination } from '@/utils/navigation'
import { parseProductQuery } from '@/utils/productQuery'
const route = useRoute()
const id = computed(() => Number(route.params.id))
const delay = computed(() => parseProductQuery(route.query).delayMs)
const { product, isLoading, isRefreshing, error, isSaving, saveError, retry, saveStock } =
  useProduct(id, delay)
const back = computed(() => listDestination(route.query.from))
const missing = computed(() => error.value instanceof ApiError && error.value.status === 404)
</script>
<template>
  <article class="item" aria-labelledby="item-heading">
    <RouterLink class="touch-link" :to="back">Back to stock</RouterLink>
    <h1 id="item-heading">{{ product?.title ?? 'Stock item' }}</h1>
    <LoadingState v-if="isLoading" label="Loading stock item" />
    <EmptyState
      v-else-if="missing"
      title="Item not found"
      message="This item may no longer be in the catalogue."
    >
      <template #action
        ><RouterLink class="touch-link" :to="back">Browse stock</RouterLink></template
      >
    </EmptyState>
    <template v-else>
      <ErrorState v-if="error" :message="errorMessage(error)" @retry="retry" />
      <template v-if="product">
        <p v-if="isRefreshing" role="status">Checking for updated item details...</p>
        <div class="item__details">
          <img
            v-if="product.thumbnail"
            :src="product.thumbnail"
            :alt="product.title"
            width="240"
            height="240"
          />
          <div>
            <p>{{ product.description }}</p>
            <dl>
              <dt>Category</dt>
              <dd>{{ product.category }}</dd>
              <dt>Price (USD)</dt>
              <dd>{{ product.price.toFixed(2) }}</dd>
              <template v-if="product.sku"
                ><dt>SKU</dt>
                <dd>{{ product.sku }}</dd></template
              >
              <template v-if="product.brand"
                ><dt>Brand</dt>
                <dd>{{ product.brand }}</dd></template
              >
            </dl>
          </div>
        </div>
        <StockEditor
          :key="product.id"
          :current-stock="product.stock"
          :pending="isSaving"
          :error="saveError ? errorMessage(saveError) : ''"
          :save="saveStock"
        />
      </template>
    </template>
  </article>
</template>
<style scoped>
.item {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  min-width: 0;
}
.item__details {
  display: grid;
  gap: var(--space-4);
}
.item__details img {
  object-fit: contain;
  height: auto;
}
dl {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-2) var(--space-4);
  margin-top: var(--space-4);
}
dt {
  font-weight: var(--font-weight-bold);
}
dd,
h1 {
  overflow-wrap: anywhere;
}
@media (min-width: 48rem) {
  .item__details {
    grid-template-columns: 15rem minmax(0, 1fr);
  }
}
</style>
