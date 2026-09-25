import { fileURLToPath } from 'node:url';
import { defineConfig, defaultExclude } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';

// Same reason plugins are per-project below: a project is its own Vite config and
// does NOT inherit the root's resolve.alias either. Declared once, spread twice.
const alias = { '@': fileURLToPath(new URL('./src', import.meta.url)) };

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
        resolve: { alias },
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./src/test-setup.ts'],
          /*
           * `prototypes/` is included deliberately, and it is the one place a prototype
           * reaches into the repository's quality machinery.
           *
           * The zone is ungated by design: no spec, no review budget, no gates. Tests
           * are not a gate — they are how a prototype answers its own question. The
           * Waypoint filter model carries defects that are invisible without them (the
           * spec it is built from says so in §9, and the composition test proves it), so
           * a prototype holding that model without tests answers nothing.
           *
           * THE COST, stated: these tests now run in `npm test`, which the DS quality
           * gate invokes by name. A broken prototype test therefore reds the repository's
           * build. That is the trade — narrow this glob if the zone should stay fully
           * outside CI.
           */
          include: ['src/**/*.test.{ts,tsx}', 'prototypes/**/*.test.{ts,tsx}'],
          exclude: [...defaultExclude, BROWSER_TESTS],
        },
      },
      {
        // Tailwind is loaded here and not in `unit` because it is only load-bearing
        // here: measuring a box is measuring what the utility classes resolved to,
        // so the browser project has to serve the same stylesheet Storybook serves.
        plugins: [react(), tailwindcss()],
        resolve: { alias },
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
