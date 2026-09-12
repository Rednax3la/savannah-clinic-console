<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { errorMessage } from '@/api/client'
const auth = useAuthStore()
const router = useRouter()
const username = ref('')
const password = ref('')
const pending = ref(false)
const attempted = ref(false)
const error = ref('')
async function submit(): Promise<void> {
  if (pending.value) return
  attempted.value = true
  if (!username.value.trim() || !password.value) return
  error.value = ''
  pending.value = true
  try {
    await auth.signIn(username.value.trim(), password.value)
    password.value = ''
    await router.replace(auth.consumeIntendedRoute() ?? '/')
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    pending.value = false
  }
}
</script>
<template>
  <section class="login" aria-labelledby="login-title">
    <p class="login__brand">Clinic Stock Console</p>
    <h1 id="login-title">Sign in</h1>
    <p>Sign in to view the clinic stock catalogue.</p>
    <form class="login__form" novalidate @submit.prevent="submit">
      <div class="field">
        <label for="username">Username</label>
        <input
          id="username"
          v-model="username"
          name="username"
          autocomplete="username"
          required
          :disabled="pending"
          :aria-invalid="attempted && !username.trim()"
          :aria-describedby="attempted && !username.trim() ? 'username-error' : undefined"
        />
        <p v-if="attempted && !username.trim()" id="username-error" class="field-error">
          Enter your username.
        </p>
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
          :disabled="pending"
          :aria-invalid="attempted && !password"
          :aria-describedby="attempted && !password ? 'password-error' : undefined"
        />
        <p v-if="attempted && !password" id="password-error" class="field-error">
          Enter your password.
        </p>
      </div>
      <p v-if="error" role="alert" class="field-error">{{ error }} You can try signing in again.</p>
      <button type="submit" :disabled="pending">{{ pending ? 'Signing in...' : 'Sign in' }}</button>
      <p role="status" class="visually-hidden">{{ pending ? 'Signing in' : '' }}</p>
    </form>
    <p class="login__hint">Assessment demo · Authentication provided by DummyJSON.</p>
  </section>
</template>
<style scoped>
.login {
  max-width: 29rem;
  margin: clamp(1rem, 8vh, 6rem) auto;
  padding: clamp(1.5rem, 4vw, 3rem);
  display: grid;
  gap: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md), var(--shadow-inset);
  border-top: 4px solid var(--color-lime);
}
.login__brand {
  font-family: var(--font-heading);
  font-size: var(--font-size-lg);
  color: var(--color-grape);
  margin-bottom: var(--space-5);
}
.login > p:not(.login__brand) {
  color: var(--color-text-muted);
}
.login__form {
  margin-block: var(--space-4);
}
.login__form button {
  min-height: 3rem;
}
@supports (backdrop-filter: blur(1px)) {
  .login {
    background: var(--color-glass);
    backdrop-filter: var(--glass-blur);
  }
}
.login__form,
.field {
  display: grid;
  gap: var(--space-2);
  min-width: 0;
}
.login__form {
  gap: var(--space-4);
}
input {
  width: 100%;
  min-width: 0;
}
.login__hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
</style>
