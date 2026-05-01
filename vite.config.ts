import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  publicDir: 'public',
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // PERF: keep the tiny core (React + router + Helmet) in its own chunk
        // so the app shell can boot before any large icon-data chunk arrives.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            id.includes('react-helmet') ||
            id.includes('/react/') ||
            id.includes('scheduler')
          ) {
            return 'react-core';
          }
          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'ui-vendor';
          }
          if (id.includes('@tanstack')) {
            return 'query-vendor';
          }
        },
      },
    },
  },
}));
