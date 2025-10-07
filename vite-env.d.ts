// FIX: Commented out the line below to resolve a "Cannot find type definition file" error.
// Since the project uses `process.env` (via Vite's `define` config) instead of `import.meta.env`,
// these client-specific types are not strictly necessary.
// /// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    VITE_BACKEND_API_URL: string;
  }
}
