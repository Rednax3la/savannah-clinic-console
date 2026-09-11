<script setup lang="ts">
/**
 * Stock correction form. Placeholder.
 *
 * The typed value and the open/closed flag are local state: they are scratch
 * input, not something a reload should restore or a URL should carry. The save
 * itself is pessimistic per the design doc — controls lock until the server
 * answers — because a stock count that appears corrected and silently is not
 * is worse than a slow one.
 */
import { ref } from 'vue'

withDefaults(
  defineProps<{
    /** Server-held count, shown when the editor is closed. */
    currentStock?: number
  }>(),
  { currentStock: 0 },
)

const isOpen = ref(false)
const draftStock = ref('')

// TODO(section 2): submit handler, pending/success/failure states. On failure
// the input must re-enable with the typed value intact so the user can retry
// without retyping.
</script>

<template>
  <section class="editor" aria-labelledby="stock-editor-heading">
    <h2 id="stock-editor-heading" class="editor__heading">Stock count</h2>

    <p class="editor__current">
      <span class="editor__value">{{ currentStock }}</span>
      <span class="editor__unit">in stock</span>
    </p>

    <button v-if="!isOpen" class="editor__toggle" type="button" @click="isOpen = true">
      Correct count
    </button>

    <form v-else class="editor__form" @submit.prevent>
      <label class="editor__label" for="new-stock">New count</label>
      <input
        id="new-stock"
        v-model="draftStock"
        class="editor__input"
        type="number"
        inputmode="numeric"
        min="0"
        step="1"
      />

      <div class="editor__actions">
        <button class="editor__save" type="submit" disabled>Save</button>
        <button class="editor__cancel" type="button" @click="isOpen = false">Cancel</button>
      </div>

      <p class="editor__note">Not wired up yet.</p>
    </form>
  </section>
</template>

<style scoped>
.editor {
  display: grid;
  gap: var(--space-3);
  justify-items: start;
  padding: var(--space-4);
  background-color: var(--color-surface-muted);
  border-radius: var(--radius-lg);
}

.editor__heading {
  font-size: var(--font-size-base);
}

.editor__current {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.editor__value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.editor__unit {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.editor__form {
  display: grid;
  gap: var(--space-2);
  width: 100%;
  max-width: 16rem;
}

.editor__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.editor__input {
  min-height: var(--tap-target-min);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
}

.editor__actions {
  display: flex;
  gap: var(--space-2);
}

.editor__save,
.editor__cancel,
.editor__toggle {
  min-height: var(--tap-target-min);
  padding-inline: var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

.editor__save,
.editor__toggle {
  color: var(--color-text-on-lime);
  background-color: var(--color-lime);
  border: 1px solid var(--color-lime-dark);
}

.editor__save:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.editor__cancel {
  color: var(--color-grape);
  background-color: transparent;
  border: 1px solid var(--color-border-strong);
}

.editor__note {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
</style>
