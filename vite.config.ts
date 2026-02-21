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
            // Core-Bibliotheken
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-core';
            }
            // Animations-Bibliothek (groß!)
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            // Internationalisierung
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n';
            }
            // UI-Bibliotheken
            if (id.includes('@radix-ui') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'ui-libs';
            }
            // Icons
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Formular-Logik
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'forms';
            }
            
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
