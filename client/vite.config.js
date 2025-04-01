import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Disables source maps completely
  },
  optimizeDeps: {
    include: ['lucide-react'], // Force optimize this package
  }
})