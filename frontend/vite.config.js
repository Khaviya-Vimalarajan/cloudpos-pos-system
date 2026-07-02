import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    },
    // Add watch options to bypass OneDrive locks and prevent "UNKNOWN: unknown error, read"
    watch: {
      usePolling: true,
      interval: 100,
    }
  }
})
