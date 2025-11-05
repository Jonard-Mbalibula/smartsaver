import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  // --- ADD THIS BLOCK ---
  build: {
    rollupOptions: {
      output: {
        // This function checks if a module comes from node_modules 
        // and bundles it into a separate 'vendor' file.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // All node_modules dependencies go into vendor.js
            return 'vendor';
          }
        }
      }
    }
  }
  // -----------------------
})
