/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the DummyJSON API. Overridable per environment. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
