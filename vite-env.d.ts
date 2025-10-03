/// <reference types="vite/client" />

// This declaration makes TypeScript aware of the `process.env.API_KEY` global
// that is created by the `define` option in your `vite.config.ts`.
// It doesn't actually expose any environment variables to your client-side code.
// FIX: Use namespace augmentation to avoid redeclaring the `process` variable,
// which causes conflicts with other type definitions (e.g., from @types/node).
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string
  }
}
