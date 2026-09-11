import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'

// Explicit extension: Vite's native config loader requires it, and omitting it
// warns on every run.
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // A DOM environment, not node: component tests need one, and the auth
      // store reads sessionStorage. happy-dom rather than jsdom because the
      // jsdom environment worker never finished starting on this machine, and
      // happy-dom covers everything these tests touch at a fraction of the
      // start-up cost.
      environment: 'happy-dom',
      // Threads rather than forked processes: nothing here needs process-level
      // isolation, and starting a worker thread is cheaper.
      pool: 'threads',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
