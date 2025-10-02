import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This replaces `process.env.API_KEY` in the source code with a placeholder string during the build.
    // The entrypoint.sh script will then replace this placeholder with the actual key at runtime.
    'process.env.API_KEY': '"__API_KEY_PLACEHOLDER__"'
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
})
