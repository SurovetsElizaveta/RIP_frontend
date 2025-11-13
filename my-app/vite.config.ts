import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "/RIP_frontend/",
  server: {
    proxy: {
      "/api": {
        target: "http://host.docker.internal:8080", // ← ИЗМЕНИТЕ ЗДЕСЬ
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"), // можно удалить
      },
    },
    watch: {
        usePolling: true,
    }, 
    host: true,
    strictPort: true,
    port: 3000,
  },
  build: {
    assetsDir: 'assets',
  }
});