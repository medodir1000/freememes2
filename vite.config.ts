import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // FIX: Replaced process.cwd() with '.' to resolve a TypeScript type error.
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    // Define global constants to be replaced during build. This makes env variables available to the client.
    define: {
      'process.env.VITE_BACKEND_API_URL': JSON.stringify(env.VITE_BACKEND_API_URL),
    },
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