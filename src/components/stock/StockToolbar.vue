<script setup lang="ts">
/**
 * Groups the three list controls. Placeholder.
 *
 * It exists so StockListView does not have to know how search, filter and sort
 * are arranged, and so the whole group can reflow as one unit at 360px.
 */
import SearchInput from '@/components/stock/SearchInput.vue'
import CategoryFilter from '@/components/stock/CategoryFilter.vue'
import SortControl from '@/components/stock/SortControl.vue'

// TODO(section 2): accept the current query as props and emit changes upward,
// so the view can write them to the URL.
</script>

<template>
  <!-- A labelled search landmark: on a screen reader this group is reachable
       directly instead of by scanning the page for the input. -->
  <section class="toolbar" role="search" aria-label="Filter stock">
    <SearchInput class="toolbar__search" model-value="" />
    <CategoryFilter model-value="" />
    <SortControl sort-by="title" order="asc" />
  </section>
</template>

<style scoped>
.toolbar {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

/* Side by side once there is room; stacked at 360px, where each control gets
   the full width and stays a comfortable tap target. */
@media (min-width: 48rem) {
  .toolbar {
    grid-template-columns: 2fr 1fr 1fr;
    align-items: end;
  }
}
</style>
