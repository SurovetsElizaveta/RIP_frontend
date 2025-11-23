import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'
import fs from 'fs';
import path from 'path';
import {api_proxy_addr, img_proxy_addr, dest_root} from "./target_config"

export default defineConfig({
  plugins: [
    react(),
    mkcert(),
    VitePWA({
      registerType: 'prompt',
      devOptions: {
        enabled: true,
      },
      manifest:{
        "name": "Routes",
        "short_name": "Routes",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#09388A",
        "theme_color": "#F3F3F3",
        "orientation": "portrait-primary",
        "icons": [
          {
            "src": "images/main_ship.svg",
            "type": "image/svg", "sizes": "192x192"
          }
        ]
      }
    })
  ],
  base: dest_root,
  server: {
    https:{
      key: fs.readFileSync(path.resolve(__dirname, 'cert.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert.crt')),
    },
    proxy: {
         "/api": {
           target: api_proxy_addr,
           changeOrigin: true,
           rewrite: (path) => path.replace(/^\/api/, "/"),
         },
         "/img-proxy": {
           target: img_proxy_addr,
           changeOrigin: true,
           rewrite: (path) => path.replace(/^\/img-proxy/, "/"),
         },
       },
    watch: {
        usePolling: true,
    }, 
    host: true,
    strictPort: true,
    port: 3000,
  },
  publicDir: 'public',
});