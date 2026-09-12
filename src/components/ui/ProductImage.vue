<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    src?: string | undefined
    fallbackSrc?: string | undefined
    title: string
    eager?: boolean
  }>(),
  { src: undefined, fallbackSrc: undefined, eager: false },
)
const failedSources = ref<string[]>([])
const source = computed(() =>
  [props.src, props.fallbackSrc].find((url) => url?.trim() && !failedSources.value.includes(url)),
)
watch(
  () => [props.src, props.fallbackSrc],
  () => {
    failedSources.value = []
  },
)
function imageFailed(): void {
  if (source.value) failedSources.value.push(source.value)
}
</script>

<template>
  <div class="product-image">
    <img
      v-if="source"
      :key="source"
      :src="source"
      :alt="title"
      width="320"
      height="320"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      @error="imageFailed"
    />
    <div
      v-else
      class="product-image__fallback"
      role="img"
      :aria-label="`Image unavailable for ${title}`"
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <rect x="4" y="4" width="24" height="24" rx="4" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="m5 24 7-7 5 5 4-4 6 6" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.product-image {
  width: 100%;
  aspect-ratio: 1;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface-muted);
}
.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: var(--space-1);
}
.product-image__fallback {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: var(--color-text-muted);
}
.product-image__fallback svg {
  width: 45%;
  max-width: 3rem;
}
</style>
