import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/node_modules/**']),

  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommendedTypeChecked,

  {
    name: 'app/rules',
    rules: {
      // Unused code is usually a leftover from a refactor, but an intentionally
      // ignored argument is normal in event handlers, so allow the _ prefix.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],

      // An unawaited promise in a Vue event handler is how a failed save ends up
      // silently swallowed. This is the single rule most likely to catch a real
      // bug in this app, so it is an error rather than a warning.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // `any` erases the API types that the client exists to provide.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],

      // npm run lint uses --max-warnings 0 locally and in the PR pipeline.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',

      // Keep component declarations ordered and use the same setup style.
      'vue/define-macros-order': ['error', { order: ['defineProps', 'defineEmits'] }],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],

      'vue/multi-word-component-names': 'error',
    },
  },

  {
    // Spread first: the preset carries its own `name`, and listing ours after it
    // is what makes this block identifiable in `eslint --inspect-config`.
    ...pluginVitest.configs.recommended,
    name: 'app/test-rules',
    files: ['src/**/__tests__/**/*'],
  },

  skipFormatting,
)
