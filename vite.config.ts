import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/MIND-MAP-website/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
