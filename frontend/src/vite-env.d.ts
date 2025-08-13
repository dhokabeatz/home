/// <reference types="vite/client" />

interface ImportMetaEnv extends Readonly<Record<string, string | boolean>> {
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}