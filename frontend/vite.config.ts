import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Read tunnel host from env (optional)
const TUNNEL_HOST = process.env.VITE_TUNNEL_HOST

export default defineConfig({
  plugins: [react()],
  server: {
    // Bind to all interfaces so tunnels can reach the dev server
    host: true,

    // ✅ Allow Cloudflare Quick Tunnels (ANY subdomain) and optionally your exact host
    // Using the wildcard means you don't need to change this on every new tunnel.
    allowedHosts: ['.trycloudflare.com', ...(TUNNEL_HOST ? [TUNNEL_HOST] : [])],

    // Optional but recommended for stable HMR via HTTPS tunnel
    // If you notice HMR not reconnecting, uncomment and set the host.
    ...(TUNNEL_HOST
      ? {
          hmr: {
            host: TUNNEL_HOST, // your *.trycloudflare.com host
            protocol: 'wss',
            clientPort: 443,
          },
        }
      : {}),
  },
})
