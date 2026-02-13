import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Deaktiviere Cache für HTML-Datei, damit Nutzer sofort Änderungen sehen
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`,
        // Code-Splitting für bessere Performance
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Teile große Bibliotheken in separate Chunks auf
            if (id.includes('@radix-ui')) return 'radix';
            if (id.includes('lucide-react')) return 'lucide';
            if (id.includes('react-router-dom')) return 'router';
            if (id.includes('react-hook-form')) return 'hook-form';
            if (id.includes('zod')) return 'zod';
            if (id.includes('date-fns')) return 'date-fns';
            if (id.includes('swr')) return 'swr';
            return 'vendor'; // Alle anderen node_modules in vendor chunk
          }
        },
      },
    },
    // Stelle sicher, dass die Basis-URL korrekt ist
    base: './',
    // Aktiviere Tree-Shaking und Minifizierung
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
}));
