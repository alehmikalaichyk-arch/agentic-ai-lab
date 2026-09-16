import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/*
 * `@/` resolves to src/. It exists because the shadcn CLI writes that specifier
 * into every file it generates and resolves its own `aliases` through it — there
 * is no relative-path mode. The governed components under src/components/ do NOT
 * use it and are not being migrated to it: their relative imports are correct and
 * changing them would be churn.
 *
 * Declared in three places, and all three are load-bearing:
 *   tsconfig.json     typecheck
 *   this file         Storybook (@storybook/react-vite reads the project config)
 *   vitest.config.ts  both test projects — a project is its own Vite config and
 *                     inherits nothing from here
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
