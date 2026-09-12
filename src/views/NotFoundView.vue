<script setup lang="ts">
/**
 * Catch-all route. Not in the original design doc, but a shared link with a
 * typo in it is a realistic way into this app, and a blank screen is the one
 * outcome the brief rules out.
 */
</script>

<template>
  <section class="not-found">
    <h1>Page not found</h1>
    <p>That link does not point to anything in this console.</p>
    <RouterLink class="touch-link" :to="{ name: 'stock-list' }">Go to stock list</RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  display: grid;
  gap: var(--space-3);
  justify-items: start;
  padding: var(--space-5);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
</style>
