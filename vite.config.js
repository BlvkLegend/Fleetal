import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Fleetal/',
  build: {
    chunkSizeWarningLimit: 1000,
  },
})
