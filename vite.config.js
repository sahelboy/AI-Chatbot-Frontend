import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = 'http://localhost:8000'
const apiPaths = ['/chat', '/activities', '/sessions', '/users', '/health']
const proxy = Object.fromEntries(
  apiPaths.map((p) => [p, { target: apiTarget, changeOrigin: true }]),
)

export default defineConfig({
  plugins: [react()],
  base: '/demo/',
  build: {
    outDir: '../app/static/demo',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy,
  },
})
