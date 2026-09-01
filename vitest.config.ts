import { defineConfig, defaultExclude } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';

/*
 * Two projects, one command.
 *
 * `unit` is the suite this repository has always had: jsdom, fast, no browser
 * binary needed. jsdom performs no layout — getBoundingClientRect() returns
 * zeroes there — so any assertion about a rendered box is meaningless in it.
 *
 * `browser` exists for exactly those assertions: real Chromium, real layout,
 * real computed styles. It is deliberately narrow. A test opts in by its
 * FILENAME (`*.browser.test.tsx`), never by a flag, so it is visible in the
 * file tree which tests pay the browser's start-up cost.
 *
 * The two include globs overlap — `foo.browser.test.tsx` also matches
 * `src/**\/*.test.tsx` — so `unit` must exclude the browser convention
 * explicitly. Without that line every browser test also runs headless in jsdom
 * and fails on zeroes, which reads as a broken test rather than a config error.
 *
 * Plugins are per-project on purpose: with `test.projects`, a project is its
 * own Vite config and does NOT inherit the root's plugins.
 */

const BROWSER_TESTS = 'src/**/*.browser.test.{ts,tsx}';

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react()],
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./src/test-setup.ts'],
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: [...defaultExclude, BROWSER_TESTS],
        },
      },
      {
        // Tailwind is loaded here and not in `unit` because it is only load-bearing
        // here: measuring a box is measuring what the utility classes resolved to,
        // so the browser project has to serve the same stylesheet Storybook serves.
        plugins: [react(), tailwindcss()],
        test: {
          name: 'browser',
          globals: true,
          setupFiles: ['./src/browser-test-setup.ts'],
          include: [BROWSER_TESTS],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            // A failing browser test writes a PNG of the page. Left at its
            // default that PNG lands in `src/__screenshots__/`, next to the
            // source — untracked binary output inside a tracked directory, one
            // `git add -A` away from being committed. Both this directory and
            // `.vitest-attachments/` are gitignored.
            screenshotDirectory: '.vitest-screenshots',
          },
        },
      },
    ],
  },
});
