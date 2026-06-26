import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/trackflow/',
  build: {
    chunkSizeWarningLimit: 1000,
  },
})
