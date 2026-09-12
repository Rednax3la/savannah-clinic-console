<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StockToolbar from '@/components/stock/StockToolbar.vue'
import ProductList from '@/components/stock/ProductList.vue'
import PaginationControls from '@/components/stock/PaginationControls.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import { useProducts } from '@/composables/useProducts'
import { useCategories } from '@/composables/useCategories'
import { parseProductQuery, serializeProductQuery, changeProductQuery } from '@/utils/productQuery'
import { errorMessage } from '@/api/client'
import type { ProductListQuery } from '@/types/product'
const route = useRoute()
const router = useRouter()
const query = computed(() => parseProductQuery(route.query))
const { products, total, page, isLoading, error, retry } = useProducts(query)
const {
  categories,
  isLoading: categoriesLoading,
  error: categoriesError,
  reload: reloadCategories,
} = useCategories()
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / query.value.pageSize)))
async function change(
  value: Partial<Pick<ProductListQuery, 'q' | 'category' | 'sortBy' | 'order' | 'page'>>,
): Promise<void> {
  await router.push({
    name: 'stock-list',
    query: serializeProductQuery(changeProductQuery(query.value, value)),
  })
}
// Normalize bad query values, then canonicalize an out-of-range page after fetching.
watch(
  () => route.fullPath,
  () => {
    const target = router.resolve({
      name: 'stock-list',
      query: serializeProductQuery(query.value),
    }).fullPath
    if (target !== route.fullPath && route.name === 'stock-list') void router.replace(target)
  },
  { immediate: true },
)
watch(isLoading, (loading) => {
  if (!loading && !error.value && page.value !== query.value.page)
    void router.replace({
      name: 'stock-list',
      query: serializeProductQuery({ ...query.value, page: page.value }),
    })
})
</script>
<template>
  <section class="stock" aria-labelledby="stock-heading">
    <h1 id="stock-heading">Clinic stock</h1>
    <p>Find supplies and check recorded stock counts.</p>
    <StockToolbar
      :query="query"
      :categories="categories"
      :categories-loading="categoriesLoading"
      @change="change"
    />
    <ErrorState
      v-if="categoriesError"
      title="Categories could not load"
      :message="errorMessage(categoriesError)"
      :pending="categoriesLoading"
      @retry="reloadCategories"
    />
    <LoadingState v-if="isLoading" variant="skeleton" label="Loading stock results" />
    <ErrorState v-else-if="error" :message="errorMessage(error)" @retry="retry" />
    <template v-else>
      <p role="status">{{ total }} {{ total === 1 ? 'item' : 'items' }} found</p>
      <EmptyState
        v-if="!total"
        title="No matching stock"
        message="Try another search or clear the filters."
      >
        <template #action
          ><button type="button" @click="change({ q: '', category: null })">
            Clear filters
          </button></template
        >
      </EmptyState>
      <ProductList v-else :products="products" :list-url="route.fullPath" />
    </template>
    <PaginationControls
      :page="query.page"
      :page-count="pageCount"
      :disabled="isLoading || !!error || !total"
      @update:page="change({ page: $event })"
    />
  </section>
</template>
<style scoped>
.stock {
  display: grid;
  gap: var(--space-4);
  min-width: 0;
}
</style>
