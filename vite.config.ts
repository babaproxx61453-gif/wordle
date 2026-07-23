import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // @ts-ignore
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://kelime-backend-pl8m.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
} as any);