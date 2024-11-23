import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/PromptLaibrary2/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: ['express', 'cors'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'react-hot-toast']
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'Logo.svg') {
            return 'Logo.svg';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './public')
    }
  }
});
