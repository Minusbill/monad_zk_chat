import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/login': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/messages': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});