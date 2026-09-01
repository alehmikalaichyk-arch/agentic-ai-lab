import { tokens } from '../../generated/tokens';

/**
 * Everything the token pages render, derived from the built tokens rather than
 * listed by hand.
 *
 * A hand-written list is a second source of truth that silently goes stale: a token
 * added to `tokens/` simply never appears, and nothing says so. These pages are the
 * reviewer's view of the palette at stage #4.5, so a missing swatch is a decision
 * made without the evidence.
 */

export type TokenEntry = { name: string; value: string };

/** `fg.default` -> `fg-default`, matching the CSS custom property suffix. */
const flatName = (key: string) => key.replace(/\./g, '-');

export const ALL: TokenEntry[] = Object.entries(tokens).map(([key, value]) => ({
  name: flatName(key),
  value: String(value),
}));

const byName = new Map(ALL.map((t) => [t.name, t.value]));

export const valueOf = (name: string): string => byName.get(name) ?? '';

const isColour = (v: string) => /^#[0-9a-f]{3,8}$/i.test(v.trim()) || /^rgba?\(/i.test(v.trim());

export const colours = ALL.filter((t) => isColour(t.value));

/** A primitive step: `brand-500`, `chart-blue-300`, plus the two bare ends. */
const PRIMITIVE_STEP = /^([a-z][a-z-]*?)-(\d{2,3})$/;

export type Family = { family: string; steps: TokenEntry[] };

/**
 * Primitive families, each with its steps in numeric order.
 *
 * These have no Tailwind utility by design — a component cannot reach them. They
 * are shown because a reviewer reading `surface.brand-subtle` still needs to see
 * what the family looks like to judge whether a role points at the right step.
 */
export const primitiveFamilies: Family[] = (() => {
  const grouped = new Map<string, TokenEntry[]>();
  for (const token of colours) {
    const match = token.name.match(PRIMITIVE_STEP);
    if (!match) continue;
    const [, family] = match;
    if (!grouped.has(family)) grouped.set(family, []);
    grouped.get(family)!.push(token);
  }
  const order = (name: string) => Number(name.match(PRIMITIVE_STEP)![2]);
  return [...grouped.entries()]
    .map(([family, steps]) => ({ family, steps: [...steps].sort((a, b) => order(a.name) - order(b.name)) }))
    .sort((a, b) => {
      // brand and neutral first — they are the ones a reader looks for.
      const rank = (f: string) => (f === 'brand' ? 0 : f === 'neutral' ? 1 : f.startsWith('chart-') ? 3 : 2);
      return rank(a.family) - rank(b.family) || a.family.localeCompare(b.family);
    });
})();

export const bareColours = ALL.filter((t) => t.name === 'white' || t.name === 'black');

/** Semantic roles in a group, excluding anything that is a primitive step. */
export const rolesIn = (prefix: string): TokenEntry[] =>
  colours
    .filter((t) => t.name.startsWith(`${prefix}-`) && !PRIMITIVE_STEP.test(t.name))
    .sort((a, b) => a.name.localeCompare(b.name));

/** The accent families, with every role each one carries. */
export const accentFamilies = (() => {
  const families = [
    ...new Set(
      colours
        .filter((t) => t.name.startsWith('fg-accent-'))
        .map((t) => t.name.replace(/^fg-accent-([a-z]+).*$/, '$1')),
    ),
  ].sort();
  return families.map((family) => ({
    family,
    fg: colours.filter((t) => new RegExp(`^fg-accent-${family}(-|$)`).test(t.name)),
    surface: colours.filter((t) => new RegExp(`^surface-accent-${family}(-|$)`).test(t.name)),
  }));
})();

/** Semantic chart slots: chart-1 .. chart-N, each with its steps. */
export const chartSlots = (() => {
  const grouped = new Map<string, TokenEntry[]>();
  for (const token of colours) {
    const match = token.name.match(/^chart-(\d+)-([a-z]+)$/);
    if (!match) continue;
    const slot = `chart-${match[1]}`;
    if (!grouped.has(slot)) grouped.set(slot, []);
    grouped.get(slot)!.push(token);
  }
  return [...grouped.entries()]
    .sort((a, b) => Number(a[0].split('-')[1]) - Number(b[0].split('-')[1]))
    .map(([slot, steps]) => ({ slot, steps }));
})();

// ---------------------------------------------------------------------------
// Contrast
// ---------------------------------------------------------------------------

export function luminance(colour: string): number | null {
  const hex = colour.trim().replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** WCAG contrast ratio, or null when either colour is not a plain hex. */
export function contrast(a: string, b: string): number | null {
  const la = luminance(a);
  const lb = luminance(b);
  if (la === null || lb === null) return null;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export const contrastOf = (fg: string, bg: string) => contrast(valueOf(fg), valueOf(bg));
