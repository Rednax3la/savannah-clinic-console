<script setup lang="ts">
/**
 * Sign-in screen. Placeholder.
 *
 * The form fields are local component state by design: a half-typed password
 * belongs nowhere else. Submission is stubbed for Section 2.
 */
import { ref } from 'vue'

const username = ref('')
const password = ref('')

// TODO(section 2): submit handler, inline validation, page-level auth error,
// pending state on the button, redirect to the intended route.
</script>

<template>
  <section class="login">
    <h1 class="login__title">Sign in</h1>
    <p class="login__intro">Sign in to view the clinic stock catalogue.</p>

    <form class="login__form" novalidate @submit.prevent>
      <div class="field">
        <label class="field__label" for="username">Username</label>
        <input
          id="username"
          v-model="username"
          class="field__input"
          name="username"
          type="text"
          autocomplete="username"
          required
        />
      </div>

      <div class="field">
        <label class="field__label" for="password">Password</label>
        <input
          id="password"
          v-model="password"
          class="field__input"
          name="password"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>

      <button class="login__submit" type="submit" disabled>Sign in</button>

      <p class="login__note">Not wired up yet.</p>
    </form>
  </section>
</template>

<style scoped>
.login {
  max-width: 24rem;
  margin-inline: auto;
  padding: var(--space-5);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.login__intro {
  margin-top: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.login__form {
  display: grid;
  gap: var(--space-4);
  margin-top: var(--space-5);
}

.field {
  display: grid;
  gap: var(--space-1);
}

.field__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.field__input {
  min-height: var(--tap-target-min);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
}

.login__submit {
  min-height: var(--tap-target-min);
  padding-inline: var(--space-4);
  color: var(--color-text-on-lime);
  background-color: var(--color-lime);
  border: 1px solid var(--color-lime-dark);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
}

.login__submit:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.login__note {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
</style>
