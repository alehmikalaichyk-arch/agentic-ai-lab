import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Tests over the token layer itself.
 *
 * The governance rules state the primitive -> semantic -> component chain in prose.
 * Prose is checked by whoever remembers to check it. These are the same statements
 * as assertions, so a violation is a red build instead of a review finding someone
 * has to notice.
 */

const ROOT = join(__dirname, '..');
const TOKENS_DIR = join(ROOT, 'tokens');

function tokenFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return tokenFiles(full);
    return full.endsWith('.json') ? [full] : [];
  });
}

/** Every `{a.b.c}` reference in a token file, with the file it came from. */
function referencesIn(file: string): string[] {
  const raw = readFileSync(file, 'utf8');
  return [...raw.matchAll(/\{([a-z0-9.-]+)\}/gi)].map((m) => m[1]);
}

const files = tokenFiles(TOKENS_DIR);

describe('token sources', () => {
  it('finds the token files at all', () => {
    // Without this, every test below passes vacuously on an empty list — the
    // failure mode where a green suite means the glob broke, not that the rules hold.
    expect(files.length).toBeGreaterThanOrEqual(10);
  });

  it('primitives reference nothing — they are the bottom of the chain', () => {
    const primitives = files.filter((f) => f.endsWith('primitives.json'));
    expect(primitives.length).toBeGreaterThan(0);
    for (const file of primitives) {
      expect({ file, refs: referencesIn(file) }).toEqual({ file, refs: [] });
    }
  });

  it('semantic tokens reference primitives only, never each other', () => {
    const semantic = files.filter((f) => f.endsWith('semantic.json'));
    expect(semantic.length).toBeGreaterThan(0);
    // A primitive reference is a colour step: `brand-500`, `neutral-100`,
    // `chart-blue-300`, `black`. A semantic token pointing at ANOTHER semantic
    // token makes the palette impossible to reason about — changing one role
    // then silently changes the other.
    const isPrimitiveRef = (ref: string) =>
      /^[a-z][a-z-]*-\d{2,3}(\.|$)/.test(ref) || /^(black|white)(\.|$)/.test(ref);
    const offenders = semantic.flatMap((f) =>
      referencesIn(f).filter((ref) => !isPrimitiveRef(ref)).map((ref) => `${f}: ${ref}`),
    );
    expect(offenders).toEqual([]);
  });

  it('component tokens reference semantic roles, never primitives', () => {
    const componentFiles = files.filter((f) => f.includes('/component/'));
    expect(componentFiles.length).toBeGreaterThan(0);
    const isPrimitiveRef = (ref: string) =>
      /^[a-z][a-z-]*-\d{2,3}(\.|$)/.test(ref) || /^(black|white)(\.|$)/.test(ref);
    const offenders = componentFiles.flatMap((f) =>
      referencesIn(f).filter(isPrimitiveRef).map((ref) => `${f}: ${ref}`),
    );
    expect(offenders).toEqual([]);
  });
});

describe('generated artifacts', () => {
  const css = readFileSync(join(ROOT, 'generated', 'tokens.css'), 'utf8');
  const theme = readFileSync(join(ROOT, 'generated', 'tailwind-theme.css'), 'utf8');

  it('emits every token under the --ds- prefix', () => {
    const declarations = [...css.matchAll(/^\s*(--[a-z0-9-]+):/gim)].map((m) => m[1]);
    expect(declarations.length).toBeGreaterThan(100);
    expect(declarations.filter((d) => !d.startsWith('--ds-'))).toEqual([]);
  });

  it('withholds primitives from Tailwind, so no utility can reach past the semantic layer', () => {
    // This is the mechanism, not a convention: `bg-palette-brand-500` is not a
    // class that renders wrong, it is a class that does not exist.
    expect(theme).not.toMatch(/--color-brand-\d/);
    expect(theme).not.toMatch(/--color-neutral-\d/);
    expect(css).toMatch(/--ds-brand-500:/);
  });

  it('publishes no Tailwind variable twice', () => {
    const names = [...theme.matchAll(/^\s*(--[a-z0-9-]+):/gim)].map((m) => m[1]);
    const seen = new Set<string>();
    const duplicates = names.filter((n) => (seen.has(n) ? true : (seen.add(n), false)));
    // A duplicate is valid CSS and a silently missing token — the second
    // declaration wins and the first stops existing.
    expect(duplicates).toEqual([]);
  });
});

describe('contrast floor', () => {
  const css = readFileSync(join(ROOT, 'generated', 'tokens.css'), 'utf8');

  const value = (name: string): string => {
    const match = css.match(new RegExp(`--ds-${name}:\\s*([^;]+);`));
    if (!match) throw new Error(`token --ds-${name} not found in generated/tokens.css`);
    return match[1].trim();
  };

  const luminance = (hex: string): number => {
    const h = hex.replace('#', '');
    const channel = (i: number) => {
      const c = parseInt(h.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  };

  const ratio = (a: string, b: string): number => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  // The pairs a component is allowed to use together. Adding a variant to a
  // component means adding its pair here, which is the point: the palette cannot
  // drift below AA without a test noticing.
  // The pairings a component is allowed to use together, measured against the real
  // palette rather than assumed from the names. The lesson encoded here: on a SOFT
  // accent surface only the `-boldest` foreground clears AA. `fg-accent-red` on
  // `surface-accent-red-subtlest` is 3.12:1 — a pairing that reads as obviously
  // correct and is not.
  const PAIRS: Array<[string, string]> = [
    ['fg-accent-grey-boldest', 'surface-accent-grey-subtlest'],
    ['fg-accent-blue-boldest', 'surface-accent-blue-subtlest'],
    ['fg-accent-green-boldest', 'surface-accent-green-subtlest'],
    ['fg-accent-amber-boldest', 'surface-accent-amber-subtlest'],
    ['fg-accent-red-boldest', 'surface-accent-red-subtlest'],
    ['fg-default', 'surface-default'],
    ['fg-subtle', 'surface-default'],
    ['fg-subtle', 'surface-neutral-subtlest'],
    // NOT surface-neutral-boldest: in this palette `-boldest` on a neutral surface
    // is a light grey (#c5c8d1), not a dark fill. The suffix orders steps within a
    // family; it does not promise a dark background. `surface-inverse` is the one
    // that carries inverse text.
    ['fg-inverse', 'surface-inverse'],
  ];

  // Pairings that look right and are NOT. Asserted as failing, so that a palette
  // change which "fixes" one of them is a deliberate decision rather than a silent
  // shift — and so the rule above cannot rot into folklore.
  const KNOWN_BELOW_AA: Array<[string, string]> = [
    ['fg-accent-red', 'surface-accent-red-subtlest'],
    ['fg-accent-blue', 'surface-accent-blue-subtlest'],
    ['fg-brand-bold', 'surface-brand-subtlest'],
    // White on the bold brand fill is 3.85:1 — the pairing every "primary button"
    // reaches for first, and it does not clear AA in this palette.
    ['fg-inverse', 'surface-brand-bold'],
  ];

  it.each(PAIRS)('%s on %s meets WCAG AA (4.5:1)', (fg, bg) => {
    expect(ratio(value(fg), value(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(KNOWN_BELOW_AA)('%s on %s is below AA — recorded, not fixed silently', (fg, bg) => {
    expect(ratio(value(fg), value(bg))).toBeLessThan(4.5);
  });

  it('detects a failing pair rather than passing everything', () => {
    // The detector fixture. Without it, a bug in ratio() that returned a large
    // number would make every assertion above pass and mean nothing.
    expect(ratio('#ffffff', '#f7f9fc')).toBeLessThan(4.5);
  });

  it('fg-disabled is deliberately below AA, and is documented as such', () => {
    // Recorded as an assertion so that "raising" it later is a conscious change
    // rather than someone assuming it was an oversight.
    expect(ratio(value('fg-disabled'), value('surface-default'))).toBeLessThan(4.5);
  });
});
