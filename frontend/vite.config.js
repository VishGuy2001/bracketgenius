import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000'
    }
  },
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || '')
  }
})