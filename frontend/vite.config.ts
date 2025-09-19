import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const TUNNEL_HOST = env.VITE_TUNNEL_HOST // напр. disable-rochester-cells-rrp.trycloudflare.com

  return {
    plugins: [react()],
    server: {
      host: true,          // слушать 0.0.0.0
      port: 5173,
      // Вариант 1: безопаснее — явно указать домен туннеля
      allowedHosts: TUNNEL_HOST ? [TUNNEL_HOST] : true, // Вариант 2: true = разрешить все (только в дев!)
      hmr: {
        host: TUNNEL_HOST || 'localhost',
        protocol: TUNNEL_HOST ? 'wss' : 'ws',
        clientPort: TUNNEL_HOST ? 443 : 5173,
      },
    },
    preview: {
      port: 5173,
      allowedHosts: TUNNEL_HOST ? [TUNNEL_HOST] : true,
    }
  }
})

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
