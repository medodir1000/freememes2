import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // FIX: Replaced `process.cwd()` with `''` to resolve a TypeScript error where the `process` global was not typed.
  // The `loadEnv` function will correctly use the project root as the directory for .env files.
  const env = loadEnv(mode, '', '');
  return {
    plugins: [react()],
    // Proxy API requests to the backend server during development
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001', // Your backend server URL
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        // These packages will not be bundled. Instead, they will be loaded
        // from the CDN URLs specified in the importmap in index.html.
        external: [
          'react',
          'react-dom',
          'react-dom/client',
          'react-router-dom',
          '@google/genai',
          '@supabase/supabase-js'
        ]
      }
    }
  }
})