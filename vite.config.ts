import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      // All /api requests are forwarded to the backend by the Vite dev server.
      // The browser only ever sees localhost:5173 — same origin — so the
      // refresh_token cookie is sent correctly on every request including
      // the silent refresh POST.
      '/api': {
        target: 'http://10.237.213.69:8000',
        changeOrigin: true,
      },
    },
  },
})