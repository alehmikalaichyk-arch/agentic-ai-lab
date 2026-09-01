import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

/**
 * What classes actually EXIST after a Tailwind build.
 *
 * This suite exists because of a hole that every other check here missed. The
 * token build withholds our primitives from @theme, so `bg-brand-500` is not a
 * class — and that was asserted, and it was true, and it did not matter, because
 * Tailwind ships a full default palette of its own. `bg-red-500`, `text-neutral-900`
 * and `bg-slate-100` were all real, working classes reaching straight past the
 * semantic layer. Withholding our primitives was never sufficient; the framework's
 * had to be deleted too (`--color-*: initial` in src/styles.css).
 *
 * The test compiles Tailwind for real rather than reading the theme file, because
 * the theme file was exactly what said everything was fine.
 */

const ROOT = join(__dirname, '..');
const workdir = mkdtempSync(join(tmpdir(), 'tw-probe-'));

afterAll(() => rmSync(workdir, { recursive: true, force: true }));

/**
 * Compile the real stylesheet against a probe file placed INSIDE the project.
 *
 * Inside, deliberately: Tailwind 4 auto-detects sources from the project root and
 * a probe written to /tmp is silently not scanned — which produces a run where
 * every class is absent and the suite passes for the wrong reason.
 */
function classesFor(probeMarkup: string): string {
  const probe = join(ROOT, 'src', `_probe-${process.pid}.html`);
  writeFileSync(probe, `<div class="${probeMarkup}"></div>`);
  try {
    const out = join(workdir, 'out.css');
    execFileSync(
      'npx',
      ['@tailwindcss/cli', '-i', join(ROOT, 'src', 'styles.css'), '-o', out],
      { cwd: ROOT, stdio: 'pipe' },
    );
    return readFileSync(out, 'utf8');
  } finally {
    rmSync(probe, { force: true });
  }
}

const has = (css: string, cls: string) =>
  new RegExp(`^\\s*\\.${cls.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*\\{`, 'm').test(css);

describe('the Tailwind class surface', () => {
  const css = classesFor(
    'bg-red-500 text-neutral-900 bg-slate-100 bg-brand-500 ' +
      'text-fg-accent-red-boldest bg-surface-accent-red-subtlest text-fg-default font-body-sm-moderate',
  );

  it('compiles at all — otherwise every assertion below is vacuous', () => {
    expect(has(css, 'text-fg-default')).toBe(true);
  });

  it.each(['bg-red-500', 'text-neutral-900', 'bg-slate-100'])(
    "Tailwind's own %s does not exist",
    (cls) => {
      expect(has(css, cls)).toBe(false);
    },
  );

  it('our primitives do not exist either', () => {
    expect(has(css, 'bg-brand-500')).toBe(false);
  });

  it.each([
    'text-fg-accent-red-boldest',
    'bg-surface-accent-red-subtlest',
    'font-body-sm-moderate',
  ])('the semantic role %s does exist', (cls) => {
    expect(has(css, cls)).toBe(true);
  });
});
