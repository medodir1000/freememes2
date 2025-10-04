// FIX: Remove reference to vite/client to resolve type error and update comment.
// This declaration makes TypeScript aware of the `process.env.API_KEY` global
// that is created by the `define` option in your `vite.config.ts`.
// It doesn't actually expose any environment variables to your client-side code.
// Use namespace augmentation to avoid redeclaring the `process` variable,
// which causes conflicts with other type definitions (e.g., from @types/node).
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string
  }
}
