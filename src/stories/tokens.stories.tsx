import type { Meta, StoryObj } from '@storybook/react';
import { ALL, colours, primitiveFamilies, rolesIn, valueOf } from './token-data';
import { Page, Ratio, Section, Swatch, Table } from './token-ui';

/**
 * The semantic layer: the roles a component is actually allowed to use.
 *
 * Everything here is published to Tailwind. Everything on the Primitives page is
 * not — that asymmetry is the mechanism the whole token architecture rests on.
 */

/** Pairs a component may use, with the measurement rather than the promise. */
const PAIRS: Array<[string, string]> = [
  ['fg-accent-grey-boldest', 'surface-accent-grey-subtlest'],
  ['fg-accent-blue-boldest', 'surface-accent-blue-subtlest'],
  ['fg-accent-green-boldest', 'surface-accent-green-subtlest'],
  ['fg-accent-amber-boldest', 'surface-accent-amber-subtlest'],
  ['fg-accent-red-boldest', 'surface-accent-red-subtlest'],
  ['fg-default', 'surface-default'],
  ['fg-subtle', 'surface-default'],
  ['fg-subtlest', 'surface-default'],
  ['fg-inverse', 'surface-inverse'],
];

/** Pairings that read as obviously correct and are not. Shown, not hidden. */
const TRAPS: Array<[string, string, string | undefined]> = [
  ['fg-accent-red', 'surface-accent-red-subtlest', undefined],
  ['fg-accent-blue', 'surface-accent-blue-subtlest', undefined],
  ['fg-brand-bold', 'surface-brand-subtlest', undefined],
  ['fg-inverse', 'surface-brand-bold', undefined],
  ['fg-disabled', 'surface-default', 'exempt — disabled controls'],
];

const entry = (name: string) => ({ name, value: valueOf(name) });

function SemanticTokens() {
  const fg = rolesIn('fg').filter((t) => !t.name.startsWith('fg-accent-'));
  const surface = rolesIn('surface').filter((t) => !t.name.startsWith('surface-accent-'));
  const outline = rolesIn('outline');

  return (
    <Page
      title="Semantic colours"
      lede={
        <>
          <p className="mb-2">
            {colours.length} colour tokens in total; {fg.length + surface.length + outline.length}{' '}
            semantic roles here, {primitiveFamilies.length} primitive families on the{' '}
            <strong>Primitives</strong> page, and nine accent families on{' '}
            <strong>Accent colours</strong>.
          </p>
          <p>
            Roles are named by the job, not the colour, so a palette change is a rename in one file
            rather than a sweep through every component. Only this layer is published to Tailwind.
          </p>
        </>
      }
    >
      <Section
        title="Foreground"
        note={
          <>
            <code>-bold</code> on a foreground role means <em>darker text</em>. On a surface role
            the same suffix means a strong fill. The two are not symmetrical, and reading one as
            the other is the most common mistake here.
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {fg.map((t) => (
            <Swatch key={t.name} token={t} />
          ))}
        </div>
      </Section>

      <Section
        title="Surface"
        note={
          <>
            <code>-boldest</code> orders steps within a family. It does <strong>not</strong> promise
            a dark value — <code>surface-neutral-boldest</code> is a light grey. Inverse text
            belongs on <code>surface-inverse</code>.
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {surface.map((t) => (
            <Swatch key={t.name} token={t} />
          ))}
        </div>
      </Section>

      <Section
        title="Outline"
        note="Borders are an outline-* role, not border-*. One focus role for every component, so focus looks identical everywhere."
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {outline.map((t) => (
            <Swatch key={t.name} token={t} />
          ))}
        </div>
      </Section>

      <Section
        title="Contrast, measured"
        note="Computed from the built tokens on render, not copied from a document. src/tokens.test.ts asserts the same pairs, so a palette change that drops one below AA is a red build rather than something noticed later."
      >
        <Table head={['Foreground', 'Surface', 'Ratio']}>
          {PAIRS.map(([f, b]) => (
            <tr key={`${f}-${b}`} className="border-b border-outline-subtle">
              <td className="py-2 pr-4">{f}</td>
              <td className="py-2 pr-4 text-fg-subtle">{b}</td>
              <td className="py-2">
                <Ratio fg={entry(f)} bg={entry(b)} />
              </td>
            </tr>
          ))}
        </Table>

        <h3 className="mt-8 mb-1 text-md">Pairings that look right and are not</h3>
        <p className="mb-3 max-w-3xl text-sm text-fg-subtle">
          Shown rather than hidden. A rule whose evidence nobody can see decays into folklore
          within a few components — and these are asserted as <em>failing</em> in the test suite,
          so a palette change that fixes one is a deliberate decision.
        </p>
        <Table head={['Foreground', 'Surface', 'Ratio']}>
          {TRAPS.map(([f, b, exempt]) => (
            <tr key={`trap-${f}-${b}`} className="border-b border-outline-subtle">
              <td className="py-2 pr-4">{f}</td>
              <td className="py-2 pr-4 text-fg-subtle">{b}</td>
              <td className="py-2">
                <Ratio fg={entry(f)} bg={entry(b)} exempt={exempt} />
              </td>
            </tr>
          ))}
        </Table>
      </Section>

      <Section
        title="Type scale"
        note="Composite: one utility sets family, size, weight and line-height together. A call site able to set the size without the line-height is a call site where the two drift apart."
      >
        <div className="space-y-3">
          {ALL.filter((t) => t.name.startsWith('font-') && t.value.includes('/')).map((t) => (
            <div key={t.name} className="flex items-baseline gap-4">
              <span className="w-64 shrink-0 text-xs text-fg-subtle">{t.name}</span>
              <span style={{ font: t.value }}>The quick brown fox jumps over the lazy dog</span>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  );
}

const meta = {
  title: 'Foundations/Semantic colours',
  component: SemanticTokens,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SemanticTokens>;

export default meta;

export const AllSemanticTokens: StoryObj<typeof meta> = {};
