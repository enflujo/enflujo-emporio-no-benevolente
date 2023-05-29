import { defineConfig } from 'vite';

export default defineConfig({
  base: '/emporio',
  server: {
    port: 3000,
  },
  publicDir: 'estaticos',
  build: {
    outDir: 'publico',
    assetsDir: 'recursos',
    sourcemap: true,
  },
});
