import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000, // Increased due to cities data
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: id => {
          // Isolate cities.json as a separate chunk
          if (id.includes('cities.json')) {
            return 'cities-data';
          }

          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            return 'vendor';
          }

          // Component chunks
          if (id.includes('src/components/weather/')) {
            return 'weather-components';
          }
          if (id.includes('src/components/search/')) {
            return 'search-components';
          }
          if (id.includes('src/components/layout/')) {
            return 'layout-components';
          }
        },
      },
    },

    target: 'esnext',
    minify: 'esbuild',
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'axios', 'zustand'],
  },
});
