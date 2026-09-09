import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom') || id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) {
              return 'vendor-react'
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase'
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts'
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'vendor-ui'
            }
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'vendor-utils'
            }
          }
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173
  }
})
