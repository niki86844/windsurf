import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom', // Simule un DOM navigateur pour tester les composants React
    globals: true,        // Permet d'utiliser describe/it sans import
    setupFiles: './vitest.setup.ts' // Setup global avant chaque test
  }
});
