import type { Meta, StoryObj } from '@storybook/react';
import { ALL, valueOf } from './token-data';
import { Page, Section, Table } from './token-ui';

/** Tokens in a group, in declaration order, excluding metadata entries. */
const group = (prefix: string) =>
  ALL.filter((t) => t.name === prefix || t.name.startsWith(`${prefix}-`));

/**
 * The non-colour scales: spacing, elevation, radius, motion, stacking and control
 * heights. Less glamorous than the palette and the source of more inconsistency,
 * because a bespoke number here is invisible in review and obvious on screen.
 */
function Scales() {
  const spacing = group('spacing');
  const shadows = group('shadow');
  const radii = group('radius');
  const durations = group('motion-duration');
  const easings = group('motion-easing');
  const layers = group('z-index');
  const heights = group('shared-height');

  const unit = parseFloat(valueOf('spacing-unit')) || 4;
  const steps = [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16];

  return (
    <Page
      title="Scales"
      lede={
        <p>
          Spacing, elevation, radius, motion, stacking and control heights. A component that
          invents its own number here does not look broken — it looks slightly off, everywhere, in
          a way nobody can point at.
        </p>
      }
    >
      <Section
        title="Spacing"
        note={
          <>
            One token drives the whole numeric scale: Tailwind derives <code>p-4</code> as{' '}
            <code>calc(var(--spacing) * 4)</code>. Change <code>spacing.unit</code> and every gap,
            padding and margin in the system moves together.{' '}
            <strong>
              Tailwind ships its own default of 0.25rem, which happens to equal this token — so if
              the binding ever breaks, nothing changes visually until someone edits the token and
              nothing moves.
            </strong>{' '}
            The build fails rather than let that happen silently.
          </>
        }
      >
        <div className="mb-4 space-y-2">
          {steps.map((s) => (
            <div key={s} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs text-fg-subtle">{`p-${s}`}</span>
              <div
                className="h-4 rounded-sm bg-surface-brand-bold"
                style={{ width: `${unit * s}px` }}
              />
              <span className="text-xs text-fg-subtle">{unit * s}px</span>
            </div>
          ))}
        </div>
        <Table head={['Token', 'Value']}>
          {spacing.map((t) => (
            <tr key={t.name} className="border-b border-outline-subtle">
              <td className="py-2 pr-4">{t.name}</td>
              <td className="py-2 text-fg-subtle">{t.value}</td>
            </tr>
          ))}
        </Table>
      </Section>

      <Section
        title="Elevation"
        note="Surfaces separate by shadow rather than by hue, which is why surface-raised and surface-default are the same colour. Four steps is the whole budget."
      >
        <div className="flex flex-wrap gap-6 p-2">
          {shadows.map((t) => (
            <div key={t.name} className="text-center">
              <div
                className="mb-2 size-24 rounded-md bg-surface-default"
                style={{ boxShadow: t.value }}
              />
              <div className="text-xs text-fg-default">{t.name}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Radius">
        <div className="flex flex-wrap gap-6">
          {radii.map((t) => (
            <div key={t.name} className="text-center">
              <div
                className="mb-2 size-20 border border-outline-strong bg-surface-neutral-subtlest"
                style={{ borderRadius: t.value }}
              />
              <div className="text-xs">{t.name}</div>
              <div className="text-xs text-fg-subtle">{t.value}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Control heights"
        note="Shared across every control, which is what keeps a Button, an Input and a Select the same height without any of them knowing about the others."
      >
        <div className="flex flex-wrap items-end gap-4">
          {heights.map((t) => (
            <div key={t.name} className="text-center">
              <div
                className="mb-2 flex w-28 items-center justify-center rounded-md bg-surface-neutral-subtle text-xs"
                style={{ height: t.value }}
              >
                {t.value}
              </div>
              <div className="text-xs text-fg-subtle">{t.name.replace('shared-height-', '')}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Motion"
        note="A component needing a duration picks one of these. A bespoke number is felt before it is noticed, which is why inconsistent timing survives review so easily."
      >
        <Table head={['Token', 'Value', 'Preview']}>
          {durations.map((t) => (
            <tr key={t.name} className="border-b border-outline-subtle">
              <td className="py-2 pr-4">{t.name.replace('motion-duration-', '')}</td>
              <td className="py-2 pr-4 text-fg-subtle">{t.value}</td>
              <td className="py-2">
                <div className="h-2 w-64 overflow-hidden rounded-full bg-surface-neutral-subtle">
                  <div
                    className="h-full rounded-full bg-surface-brand-bold"
                    style={{
                      width: '100%',
                      animation: `slide ${t.value} ${valueOf('motion-easing-ease-in-out')} infinite alternate`,
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
          {easings.map((t) => (
            <tr key={t.name} className="border-b border-outline-subtle">
              <td className="py-2 pr-4">{t.name.replace('motion-easing-', '')}</td>
              <td className="py-2 pr-4 text-fg-subtle" colSpan={2}>
                {t.value}
              </td>
            </tr>
          ))}
        </Table>
        <style>{`@keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
      </Section>

      <Section
        title="Stacking"
        note="Named by what stacks rather than by number. A component inventing its own z-index is how an overlay ends up behind the thing it overlays."
      >
        <Table head={['Layer', 'Value']}>
          {layers.map((t) => (
            <tr key={t.name} className="border-b border-outline-subtle">
              <td className="py-2 pr-4">{t.name.replace('z-index-', '')}</td>
              <td className="py-2 text-fg-subtle">{t.value}</td>
            </tr>
          ))}
        </Table>
      </Section>
    </Page>
  );
}

const meta = {
  title: 'Foundations/Scales',
  component: Scales,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Scales>;

export default meta;

export const AllScales: StoryObj<typeof meta> = {};
