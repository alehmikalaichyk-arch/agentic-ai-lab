import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';

/**
 * The token layer, rendered.
 *
 * This is not a component story — there is no component yet. It exists so the
 * published Storybook shows what a reviewer needs at stage #4.5: the palette a
 * spec references, and whether a proposed pairing is legible. A spec that names
 * `surface-brand-subtlest` is much easier to review next to the actual colour.
 */

function readVar(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Relative luminance per WCAG 2.x. Accepts the #rrggbb the token build emits. */
function luminance(hex: string): number {
  const h = hex.replace('#', '');
  if (h.length < 6) return 0;
  const channel = (i: number) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function Swatch({ token }: { token: string }) {
  const value = readVar(`--ds-${token}`);
  return (
    <div className="flex items-center gap-3">
      <div
        className="size-10 shrink-0 rounded-md border border-border-default"
        style={{ background: value }}
      />
      <div className="min-w-0">
        <div className="truncate text-sm text-fg-default">{token}</div>
        <div className="truncate text-xs text-fg-subtle">{value || '—'}</div>
      </div>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-lg text-fg-default">{title}</h2>
      {note ? <p className="mb-4 max-w-2xl text-sm text-fg-subtle">{note}</p> : null}
      {children}
    </section>
  );
}

const SEMANTIC_FG = [
  'fg-default', 'fg-subtle', 'fg-subtlest', 'fg-disabled', 'fg-inverse',
  'fg-brand', 'fg-brand-bold', 'fg-link',
  'fg-status-danger', 'fg-status-warning', 'fg-status-success', 'fg-status-info',
];

const SEMANTIC_SURFACE = [
  'surface-page', 'surface-default', 'surface-sunken', 'surface-inverse',
  'surface-neutral-subtlest', 'surface-neutral-subtle', 'surface-neutral-bold', 'surface-neutral-boldest',
  'surface-brand-subtlest', 'surface-brand-subtle', 'surface-brand-bold',
  'surface-status-danger-subtlest', 'surface-status-warning-subtlest',
  'surface-status-success-subtlest', 'surface-status-info-subtlest',
];

const BORDERS = ['border-subtle', 'border-default', 'border-strong', 'border-brand', 'border-focused', 'border-danger'];

/** The pairings a component is allowed to use, checked live against the built tokens. */
const PAIRS: Array<[string, string]> = [
  ['fg-subtle', 'surface-neutral-subtlest'],
  ['fg-brand-bold', 'surface-brand-subtlest'],
  ['fg-status-success', 'surface-status-success-subtlest'],
  ['fg-status-warning', 'surface-status-warning-subtlest'],
  ['fg-status-danger', 'surface-status-danger-subtlest'],
  ['fg-default', 'surface-default'],
  ['fg-inverse', 'surface-neutral-boldest'],
  ['fg-disabled', 'surface-default'],
];

function Tokens() {
  return (
    <div className="bg-surface-page p-8 font-sans">
      <h1 className="mb-2 text-xl text-fg-default">Design tokens</h1>
      <p className="mb-8 max-w-2xl text-sm text-fg-subtle">
        Three layers: primitives hold raw values, semantic roles reference primitives, component
        tokens reference semantic roles. Only the semantic layer is published to Tailwind — a
        component reaching for a primitive finds no class at all.
      </p>

      <Section
        title="Foreground roles"
        note="Named by the job, not the colour. A role can be re-pointed at a different primitive without touching a single component."
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {SEMANTIC_FG.map((t) => <Swatch key={t} token={t} />)}
        </div>
      </Section>

      <Section
        title="Surface roles"
        note="-bold on a surface means a strong fill carrying inverse text. On a foreground role the same suffix means darker text. The two are not symmetrical, and reading one as the other is the most common mistake here."
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {SEMANTIC_SURFACE.map((t) => <Swatch key={t} token={t} />)}
        </div>
      </Section>

      <Section title="Borders">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {BORDERS.map((t) => <Swatch key={t} token={t} />)}
        </div>
      </Section>

      <Section
        title="Contrast, measured"
        note="Computed from the built tokens on render, not copied from a spec. The same pairs are asserted in src/tokens.test.ts, so a palette change that drops one below AA is a red build rather than something noticed later."
      >
        <table className="w-full max-w-3xl text-left text-sm">
          <thead>
            <tr className="border-b border-border-default text-fg-subtle">
              <th className="py-2 font-weight-medium">Foreground</th>
              <th className="py-2 font-weight-medium">Surface</th>
              <th className="py-2 font-weight-medium">Ratio</th>
              <th className="py-2 font-weight-medium">AA</th>
            </tr>
          </thead>
          <tbody>
            {PAIRS.map(([fg, bg]) => {
              const ratio = contrast(readVar(`--ds-${fg}`), readVar(`--ds-${bg}`));
              const passes = ratio >= 4.5;
              // fg-disabled is deliberately below AA — a disabled control is exempt.
              // Shown rather than hidden, so the exception is visible as an exception.
              const intentional = fg === 'fg-disabled';
              return (
                <tr key={`${fg}-${bg}`} className="border-b border-border-subtle">
                  <td className="py-2 text-fg-default">{fg}</td>
                  <td className="py-2 text-fg-subtle">{bg}</td>
                  <td className="py-2 text-fg-default">{ratio.toFixed(2)}:1</td>
                  <td className="py-2">
                    {passes ? (
                      <span className="text-fg-status-success">pass</span>
                    ) : intentional ? (
                      <span className="text-fg-subtle">exempt — disabled</span>
                    ) : (
                      <span className="text-fg-status-danger">FAIL</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      <Section title="Type scale">
        <div className="space-y-2">
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
            <div key={size} className="flex items-baseline gap-4">
              <span className="w-8 text-xs text-fg-subtlest">{size}</span>
              <span className={`text-${size} text-fg-default`}>
                The quick brown fox jumps over the lazy dog
              </span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

const meta = {
  title: 'Foundations/Tokens',
  component: Tokens,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Tokens>;

export default meta;

export const AllTokens: StoryObj<typeof meta> = {};
