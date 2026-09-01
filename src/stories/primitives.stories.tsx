import type { Meta, StoryObj } from '@storybook/react';
import { bareColours, primitiveFamilies } from './token-data';
import { Page, Ramp, Section, Swatch } from './token-ui';

/**
 * The primitive palette.
 *
 * Shown, but deliberately unreachable: no primitive is published to Tailwind, so
 * `bg-brand-500` is not a class. This page exists because a reviewer judging whether
 * `surface.brand-subtle` points at the right step has to see the family it came from.
 */
function Primitives() {
  const chartFamilies = primitiveFamilies.filter((f) => f.family.startsWith('chart-'));
  const paletteFamilies = primitiveFamilies.filter((f) => !f.family.startsWith('chart-'));

  return (
    <Page
      title="Primitives"
      lede={
        <>
          <p className="mb-2">
            Raw values with no meaning attached. {primitiveFamilies.length} families,{' '}
            {primitiveFamilies.reduce((n, f) => n + f.steps.length, 0)} steps.
          </p>
          <p>
            <strong>None of these has a Tailwind utility.</strong> The token build withholds them
            from <code>@theme</code>, so a component reaching for <code>bg-brand-500</code> gets no
            class at all — the primitive → semantic → component chain is enforced by what exists
            rather than by review. They are shown here because a reviewer judging whether a
            semantic role points at the right step needs to see the family behind it.
          </p>
        </>
      }
    >
      <Section
        title="Palette families"
        note="The families are named rather than numbered by hue, so re-pointing a role at a different family is a rename in one file and nothing else."
      >
        {paletteFamilies.map((f) => (
          <Ramp key={f.family} family={f.family} steps={f.steps} />
        ))}
      </Section>

      <Section
        title="Chart primitives"
        note="A separate scale. Chart colours are chosen for distinguishability in a series, which is a different problem from the interface palette — a hue that reads well as a surface can be indistinguishable from its neighbour in a legend."
      >
        {chartFamilies.map((f) => (
          <Ramp key={f.family} family={f.family} steps={f.steps} />
        ))}
      </Section>

      <Section title="Absolutes">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {bareColours.map((t) => (
            <Swatch key={t.name} token={t} />
          ))}
        </div>
      </Section>
    </Page>
  );
}

const meta = {
  title: 'Foundations/Primitives',
  component: Primitives,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Primitives>;

export default meta;

export const AllPrimitives: StoryObj<typeof meta> = {};
