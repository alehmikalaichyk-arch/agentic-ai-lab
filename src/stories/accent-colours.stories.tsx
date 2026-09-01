import type { Meta, StoryObj } from '@storybook/react';
import { accentFamilies, valueOf } from './token-data';
import { Page, PairPreview, Ratio, Section, Table } from './token-ui';

/**
 * The accent families — nine of them, each with a foreground pair and a surface ramp.
 *
 * This page earns its place by showing the trap rather than describing it: the
 * MATCHING foreground on a soft accent surface does not clear AA, and the pairing
 * that reads as obviously correct is the wrong one.
 */
function AccentColours() {
  return (
    <Page
      title="Accent colours"
      lede={
        <>
          <p className="mb-2">
            {accentFamilies.length} families for categorical colour — statuses that are not
            success/warning/danger, tags, chips, badges. Each carries a base and a{' '}
            <code>-boldest</code> foreground, and a surface ramp from{' '}
            <code>-subtlest</code> through <code>-bold</code> to <code>-boldest</code>.
          </p>
          <p>
            <strong>Read the ratio column before choosing a pair.</strong> The base foreground on
            its own subtlest surface — the pairing the names suggest — fails AA in every family
            but one.
          </p>
        </>
      }
    >
      {accentFamilies.map(({ family, fg, surface }) => {
        const base = fg.find((t) => t.name === `fg-accent-${family}`);
        const boldest = fg.find((t) => t.name === `fg-accent-${family}-boldest`);
        const subtlest = surface.find((t) => t.name === `surface-accent-${family}-subtlest`);

        return (
          <Section key={family} title={family}>
            <div className="mb-4 flex flex-wrap gap-1">
              {surface.map((s) => (
                <div
                  key={s.name}
                  className="h-14 w-28 rounded-sm border border-outline-subtle p-1 text-xs"
                  style={{ background: s.value }}
                  title={`${s.name} — ${s.value}`}
                >
                  <span style={{ color: valueOf(`fg-accent-${family}-boldest`) }}>
                    {s.name.replace(`surface-accent-${family}`, '') || 'base'}
                  </span>
                </div>
              ))}
            </div>

            {base && boldest && subtlest ? (
              <div className="flex flex-wrap items-start gap-6">
                <Table head={['Foreground', 'on', 'Contrast', 'Preview']}>
                  <tr className="border-b border-outline-subtle">
                    <td className="py-2 pr-4">{base.name}</td>
                    <td className="py-2 pr-4 text-fg-subtle">{subtlest.name}</td>
                    <td className="py-2 pr-4">
                      <Ratio fg={base} bg={subtlest} />
                    </td>
                    <td className="py-2">
                      <PairPreview fg={base} bg={subtlest} label="Sample label" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">{boldest.name}</td>
                    <td className="py-2 pr-4 text-fg-subtle">{subtlest.name}</td>
                    <td className="py-2 pr-4">
                      <Ratio fg={boldest} bg={subtlest} />
                    </td>
                    <td className="py-2">
                      <PairPreview fg={boldest} bg={subtlest} label="Sample label" />
                    </td>
                  </tr>
                </Table>
              </div>
            ) : null}
          </Section>
        );
      })}
    </Page>
  );
}

const meta = {
  title: 'Foundations/Accent colours',
  component: AccentColours,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AccentColours>;

export default meta;

export const AllAccents: StoryObj<typeof meta> = {};
