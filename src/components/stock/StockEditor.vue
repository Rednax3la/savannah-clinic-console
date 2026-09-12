<script setup lang="ts">
import { nextTick, onUnmounted, ref } from 'vue'
const props = defineProps<{
  currentStock: number
  pending: boolean
  error: string
  save: (stock: number) => Promise<boolean>
}>()
const isOpen = ref(false)
const draftStock = ref<string | number>('')
const validation = ref('')
const success = ref('')
const input = ref<HTMLInputElement | null>(null)
const toggle = ref<HTMLButtonElement | null>(null)
let successTimer: ReturnType<typeof setTimeout> | undefined
onUnmounted(() => clearTimeout(successTimer))
async function open(): Promise<void> {
  draftStock.value = String(props.currentStock)
  validation.value = ''
  success.value = ''
  isOpen.value = true
  await nextTick()
  input.value?.focus()
  input.value?.select()
}
async function close(): Promise<void> {
  if (props.pending) return
  isOpen.value = false
  await nextTick()
  toggle.value?.focus()
}
async function submit(): Promise<void> {
  if (props.pending) return
  const text = String(draftStock.value).trim()
  const count = Number(text)
  if (!/^\d+$/.test(text) || !Number.isSafeInteger(count) || count < 0) {
    validation.value = 'Enter a whole number of zero or more.'
    await nextTick()
    input.value?.focus()
    return
  }
  validation.value = ''
  if (await props.save(count)) {
    isOpen.value = false
    success.value = `Stock count saved: ${count}.`
    clearTimeout(successTimer)
    successTimer = setTimeout(() => {
      success.value = ''
    }, 5000)
    await nextTick()
    toggle.value?.focus()
  } else {
    await nextTick()
    input.value?.focus()
  }
}
</script>
<template>
  <section class="editor" aria-labelledby="stock-editor-heading">
    <h2 id="stock-editor-heading">Stock correction</h2>
    <p>
      <strong class="editor__value">{{ currentStock }}</strong> in stock
    </p>
    <button v-if="!isOpen" ref="toggle" type="button" @click="open">Correct count</button>
    <form v-else class="editor__form" novalidate @submit.prevent="submit">
      <label for="new-stock">New count</label>
      <input
        id="new-stock"
        ref="input"
        v-model="draftStock"
        type="number"
        inputmode="numeric"
        min="0"
        step="1"
        required
        :disabled="pending"
        :aria-invalid="!!validation"
        :aria-describedby="validation || error ? 'stock-error' : undefined"
      />
      <p v-if="validation || error" id="stock-error" role="alert" class="field-error">
        {{ validation || error }}
      </p>
      <div class="editor__actions">
        <button type="submit" :disabled="pending">{{ pending ? 'Saving...' : 'Save' }}</button>
        <button type="button" :disabled="pending" @click="close">Cancel</button>
      </div>
    </form>
    <p role="status" :class="{ editor__success: success }">
      {{ pending ? 'Saving stock count...' : success }}
    </p>
  </section>
</template>
<style scoped>
.editor {
  display: grid;
  gap: var(--space-3);
  justify-items: start;
  padding: var(--space-4);
  background: var(--color-surface-muted);
  border-radius: var(--radius-lg);
  min-width: 0;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-inset), var(--shadow-sm);
}
.editor__value {
  font-size: var(--font-size-2xl);
  font-family: var(--font-heading);
  font-weight: 500;
  color: var(--color-grape);
  font-variant-numeric: tabular-nums;
  margin-right: var(--space-2);
}
.editor__success {
  color: var(--color-success);
  background: var(--color-success-surface);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
}
.editor__actions button {
  min-width: 7rem;
}
.editor__actions button[type='button'] {
  background: var(--color-surface);
  color: var(--color-grape);
}
.editor__form {
  display: grid;
  gap: var(--space-2);
  width: 100%;
  max-width: 20rem;
  min-width: 0;
}
.editor__form input {
  width: 100%;
  min-width: 0;
}
.editor__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
