import type { Meta, StoryObj } from '@storybook/react';
import { chartSlots, contrast, primitiveFamilies, valueOf } from './token-data';
import { Chip, Page, Ramp, Section, Table } from './token-ui';

/**
 * Chart colours.
 *
 * A separate scale from the interface palette, and the separation is the point: an
 * interface colour is chosen to sit behind text, a chart colour is chosen to stay
 * distinguishable from its neighbours in a legend. Those two goals disagree often
 * enough that sharing one ramp between them degrades both.
 */
function Charts() {
  const chartPrimitives = primitiveFamilies.filter((f) => f.family.startsWith('chart-'));

  return (
    <Page
      title="Charts"
      lede={
        <>
          <p className="mb-2">
            {chartSlots.length} numbered slots, each with three steps. A chart assigns series by{' '}
            <em>position</em> — slot 1, slot 2 — rather than by colour name, so a chart with three
            series looks deliberate without anyone choosing hues.
          </p>
          <p>
            <strong>Series order is the contract.</strong> Two charts of the same data must use the
            same slots, or the reader re-learns the legend on every screen.
          </p>
        </>
      }
    >
      <Section
        title="Series slots"
        note="Use `default` for the mark itself, `subtle` for a secondary state such as a comparison period, and `subtlest` for a background band."
      >
        <div className="space-y-3">
          {chartSlots.map(({ slot, steps }) => (
            <div key={slot} className="flex items-start gap-3">
              <div className="w-20 shrink-0 pt-6 text-sm text-fg-subtle">{slot}</div>
              <div className="flex gap-2">
                {steps.map((s) => (
                  <Chip key={s.name} token={s} width="w-28" label={s.name.replace(`${slot}-`, '')} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="A five-series bar, rendered"
        note="Shown rather than described, because distinguishability is the one property of a palette that cannot be judged from a list of swatches."
      >
        <div className="flex h-40 max-w-2xl items-end gap-3 rounded-md border border-outline-subtle bg-surface-default p-4">
          {chartSlots.slice(0, 5).map(({ slot }, i) => (
            <div key={slot} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-sm"
                style={{
                  background: valueOf(`${slot}-default`),
                  height: `${40 + i * 22}px`,
                }}
              />
              <span className="text-xs text-fg-subtle">{slot.replace('chart-', 'S')}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Chart primitives"
        note="The raw ramps the slots resolve to. Unpublished to Tailwind like every other primitive — a chart component reads the slot, never the ramp."
      >
        {chartPrimitives.map((f) => (
          <Ramp key={f.family} family={f.family} steps={f.steps} />
        ))}
      </Section>

      <Section
        title="Contrast, and what it does and does not mean here"
        note="A chart mark is not text, so the 4.5:1 floor does not apply to it. Non-text contrast (WCAG 1.4.11) asks for 3:1 against the ADJACENT colour — usually the chart background. Measured against surface-default:"
      >
        <Table head={['Slot', 'Default value', 'vs surface-default', 'Meets 3:1']}>
          {chartSlots.map(({ slot }) => {
            const value = valueOf(`${slot}-default`);
            const ratio = contrast(value, valueOf('surface-default'));
            return (
              <tr key={slot} className="border-b border-outline-subtle">
                <td className="py-2 pr-4">{slot}</td>
                <td className="py-2 pr-4 text-fg-subtle">{value}</td>
                <td className="py-2 pr-4">{ratio ? `${ratio.toFixed(2)}:1` : '—'}</td>
                <td className="py-2">
                  {ratio && ratio >= 3 ? (
                    <span className="text-fg-status-success">yes</span>
                  ) : (
                    <span className="text-fg-status-warning">no — needs an outline or a label</span>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      </Section>
    </Page>
  );
}

const meta = {
  title: 'Foundations/Charts',
  component: Charts,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Charts>;

export default meta;

export const AllChartTokens: StoryObj<typeof meta> = {};
