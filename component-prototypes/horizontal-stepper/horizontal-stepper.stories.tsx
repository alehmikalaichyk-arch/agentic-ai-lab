import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';

/**
 * HorizontalStepper — VISUAL DRAFT (pipeline stage #4.5).
 *
 * This is scaffolding for one decision meeting, not an implementation. It exists so the
 * owner can look at the component before `docs/component-specs/horizontal-stepper.md` is
 * frozen by a human merging PR-1, and it is deleted in PR-2.
 *
 * WHAT CARRIES OVER TO PR-2, and what does not (ds-component-pipeline, "Draft reuse"):
 *
 *   carries over  — appearance only: spacing, colour roles, density, which states are
 *                   visually distinct, whether the truncation lands where the spec says.
 *   does NOT      — every name and every boundary below. `Sketch`, its `fill` parameter,
 *                   the `div` nesting, where state lives. The spec's Public API section is
 *                   three props (`current`, `total`, `label`); the `fill` switch here is a
 *                   rendering fork for the OD-002 comparison and is NOT a proposed prop.
 *
 * TOKEN DISCIPLINE — the same floor as component source, deliberately:
 *   - every colour is a semantic role; no primitive, no hex, no inline style.
 *   - every dimension resolves through `--ds-spacing-unit` (`h-1.5`, `gap-2`, `w-64`,
 *     `max-w-160`) or through a bound radius (`rounded-xs`). No arbitrary values.
 *   - typography is the composite `font-body-*` utilities only. Tailwind's own `text-sm`
 *     is reachable here but bypasses the token layer, so it is not used — the same trap
 *     the spec documents for `duration-150` / `ease-out`.
 *   - NO MOTION, anywhere. Per spec D10: `duration-150` and `ease-out` compile and happen
 *     to match `--ds-motion-duration-normal` / `--ds-motion-easing-ease-out` byte for byte,
 *     which is the right rendering through entirely the wrong channel. There is no
 *     `transition-*` class in this file.
 */

/* ------------------------------------------------------------------ *
 * The sketch. Inline on purpose — nothing here is exported.
 * ------------------------------------------------------------------ */

type StepState = 'completed' | 'current' | 'upcoming';

/** Spec D5. Note that `-boldest` appears in both senses in adjacent rows: on the accent
 *  family it is nearly black (#2d3342), on the neutral family it is a light grey (#c5c8d1). */
const TONE: Record<StepState, string> = {
  completed: 'bg-surface-accent-grey-bold',
  current: 'bg-surface-accent-grey-boldest',
  upcoming: 'bg-surface-neutral-boldest',
};

function stateAt(oneBased: number, current: number): StepState {
  if (oneBased < current) return 'completed';
  if (oneBased === current) return 'current';
  return 'upcoming';
}

/** Spec "Behaviour / Input handling". Present because a story at `total = 0` should show
 *  the corrected rendering, not a blank strip. */
function clampInput(current: number, total: number): { current: number; total: number } {
  const t = Number.isInteger(total) && total >= 1 ? total : 1;
  const c = Number.isInteger(current) && current >= 1 ? current : 1;
  return { current: Math.min(c, t), total: t };
}

/** `tone`   — spec CR-007 as written: three solid tones, no segment ever partly filled.
 *  `extent` — the source design system's override: one fill colour at three extents.
 *             Rendered here only so OD-002 can be decided by looking. */
type Fill = 'tone' | 'extent';

function Sketch({
  current,
  total,
  label,
  fill = 'tone',
}: {
  current: number;
  total: number;
  label?: string;
  fill?: Fill;
}) {
  const c = clampInput(current, total);
  const steps = Array.from({ length: c.total }, (_, i) => i + 1);
  const hasLabel = typeof label === 'string' && label.trim().length > 0;

  return (
    <div className="flex flex-col gap-2 font-body-sm-moderate text-fg-default">
      {/* text row — one line, clipped, never wraps (spec Anatomy, CR-017) */}
      <div className="flex min-w-0 items-center gap-1">
        <span className="shrink-0">
          Step {c.current} of {c.total}
        </span>
        {hasLabel ? (
          <>
            <span aria-hidden="true" className="shrink-0 text-fg-subtle">
              ·
            </span>
            <span className="min-w-0 truncate font-body-sm-default text-fg-subtle">{label}</span>
          </>
        ) : null}
      </div>

      {/* indicator — aria-hidden in its entirety (spec A11Y-002) */}
      <div aria-hidden="true" className="flex gap-2">
        {steps.map((n) => {
          const state = stateAt(n, c.current);

          if (fill === 'tone') {
            return <div key={n} className={`h-1.5 flex-1 rounded-xs ${TONE[state]}`} />;
          }

          return (
            <div
              key={n}
              className="h-1.5 flex-1 overflow-hidden rounded-xs bg-surface-neutral-boldest"
            >
              {state === 'completed' ? (
                <div className="h-full w-full rounded-xs bg-surface-accent-grey-boldest" />
              ) : null}
              {state === 'current' ? (
                <div className="h-full w-1/2 rounded-xs bg-surface-accent-grey-boldest" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Draft chrome. Annotation only — none of this is the component.
 * ------------------------------------------------------------------ */

function Page({ surface = 'default', children }: { surface?: 'default' | 'page'; children: ReactNode }) {
  return (
    <div
      className={`min-h-screen p-8 ${surface === 'page' ? 'bg-surface-page' : 'bg-surface-default'}`}
    >
      <div className="flex w-full max-w-160 flex-col gap-10">{children}</div>
    </div>
  );
}

function Block({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-body-sm-emphasis text-fg-default">{title}</h2>
      {note ? <p className="font-body-xs-default text-fg-subtle">{note}</p> : null}
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return <p className="font-body-xs-default text-fg-subtle">{children}</p>;
}

function Specimen({ caption, children }: { caption: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Caption>{caption}</Caption>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Stories
 * ------------------------------------------------------------------ */

const meta = {
  title: 'Prototypes/HorizontalStepper (draft)',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Stage #4.5 visual draft. Not an implementation, not an API proposal. Deleted in PR-2.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The resting component at three positions in the same four-step flow, plus a key that
 * puts the three tones adjacent at their real 6px height.
 *
 * The middle row is the one that matters: it is the only rendering in which all three
 * step states are present at once, which is where CR-003 ("tellable apart at a glance")
 * either holds or does not.
 */
export const Positions: Story = {
  render: () => (
    <Page>
      <Block
        title="Resting — first, middle, last"
        note="Four steps. Current is the strongest tone at every index, including step 1 where nothing is completed yet (spec D5)."
      >
        <Specimen caption="First step — no completed segments. The marker is unmistakable because it is the darkest thing on the strip.">
          <Sketch current={1} total={4} />
        </Specimen>
        <Specimen caption="Middle step — all three states present in one view. Completed · current · upcoming, left to right.">
          <Sketch current={2} total={4} />
        </Specimen>
        <Specimen caption="Last step — three completed, one current. No rendering exists in which every segment reads as completed (spec Edge cases).">
          <Sketch current={4} total={4} />
        </Specimen>
      </Block>

      <Block
        title="The three tones, adjacent, at 6px"
        note="h-1.5 resolves to calc(var(--ds-spacing-unit) * 1.5) = 6px. This is the height the distinction has to survive."
      >
        <div className="flex flex-col gap-3">
          {(
            [
              ['current', 'surface-accent-grey-boldest', '#2d3342'],
              ['completed', 'surface-accent-grey-bold', '#6d7384'],
              ['upcoming', 'surface-neutral-boldest', '#c5c8d1'],
            ] as const
          ).map(([state, token, value]) => (
            <div key={state} className="flex items-center gap-4">
              <div className={`h-1.5 w-40 rounded-xs ${TONE[state]}`} />
              <span className="font-body-xs-default text-fg-subtle">
                {state} — {token} ({value})
              </span>
            </div>
          ))}
        </div>
        <Caption>
          Measured adjacent pairs: current vs completed 2.67:1, completed vs upcoming 2.83:1.
          Both below the 3:1 of SC 1.4.11 — which the spec argues does not apply, because the
          indicator is decorative and the count carries the whole of the information in text.
        </Caption>
      </Block>
    </Page>
  ),
};

/**
 * Segment rhythm across flow lengths. Three steps is the shortest a stepper is worth
 * having; eight is above the designed range of two to six, where the spec enforces no
 * ceiling (CR-011).
 */
export const FlowLengths: Story = {
  render: () => (
    <Page>
      <Block
        title="Segment rhythm — 2, 3, 4, 6, 8 steps"
        note="Equal-width segments (flex-1) with a constant gap-2 (8px). At eight steps the gap is a larger share of the strip than at three."
      >
        <Specimen caption="Two steps, on the first.">
          <Sketch current={1} total={2} />
        </Specimen>
        <Specimen caption="Three steps, on the second.">
          <Sketch current={2} total={3} />
        </Specimen>
        <Specimen caption="Four steps, on the third.">
          <Sketch current={3} total={4} />
        </Specimen>
        <Specimen caption="Six steps, on the fourth — the top of the designed range.">
          <Sketch current={4} total={6} />
        </Specimen>
        <Specimen caption="Eight steps, on the fifth — above the designed range. No warning, no ceiling; the segments simply narrow.">
          <Sketch current={5} total={8} />
        </Specimen>
      </Block>

      <Block
        title="The same five, in a narrow container"
        note="w-64 = 256px. Whether the strip still reads as discrete steps rather than as a dashed rule is the question."
      >
        <div className="flex w-64 flex-col gap-6">
          <Sketch current={1} total={2} />
          <Sketch current={2} total={3} />
          <Sketch current={3} total={4} />
          <Sketch current={4} total={6} />
          <Sketch current={5} total={8} />
        </div>
      </Block>
    </Page>
  ),
};

/**
 * Label present, absent, and long enough to truncate (CR-012). The count is `shrink-0`
 * and the label is `min-w-0 truncate`, so the label is the only thing that gives up space.
 */
export const LabelAndTruncation: Story = {
  render: () => (
    <Page>
      <Block
        title="Label absent — the default form (CR-005)"
        note="No separator is rendered. This is the recommended form, and it is what a consumer gets by supplying nothing."
      >
        <Sketch current={2} total={4} />
      </Block>

      <Block title="Label present" note="Count, middot, label. The middot is aria-hidden, so the announced reading is 'Step 2 of 4 Project Budget'.">
        <Sketch current={2} total={4} label="Project Budget" />
      </Block>

      <Block
        title="Long label, at four widths"
        note="The count never truncates; the label loses first. Widths are 640, 384, 256 and 224px, all from the spacing scale."
      >
        <Specimen caption="Full width — nothing truncates yet.">
          <Sketch current={2} total={4} label="Trade partners and subcontractor agreements" />
        </Specimen>
        <Specimen caption="w-96 (384px).">
          <div className="w-96">
            <Sketch current={2} total={4} label="Trade partners and subcontractor agreements" />
          </div>
        </Specimen>
        <Specimen caption="w-64 (256px).">
          <div className="w-64">
            <Sketch current={2} total={4} label="Trade partners and subcontractor agreements" />
          </div>
        </Specimen>
        <Specimen caption="w-56 (224px) — the count still complete, the label down to a few characters.">
          <div className="w-56">
            <Sketch current={2} total={4} label="Trade partners and subcontractor agreements" />
          </div>
        </Specimen>
        <Specimen caption="w-32 (128px) — the count is still whole and the label is down to four characters. Segments are 26px each.">
          <div className="w-32">
            <Sketch current={2} total={4} label="Trade partners and subcontractor agreements" />
          </div>
        </Specimen>
        <Specimen
          caption={
            <>
              w-20 (80px) — the label has given up all of its width (measured 0px) and the count, at
              71px, still fits. <b>The middot does not go with it.</b> The line reads &ldquo;Step 2
              of 4 ·&rdquo; with nothing after the separator, because the spec renders the separator
              on whether the <i>prop</i> is present, not on whether the label is still visible. The
              Anatomy and the Edge cases do not cover this.
            </>
          }
        >
          <div className="w-20">
            <Sketch current={2} total={4} label="Trade partners and subcontractor agreements" />
          </div>
        </Specimen>
        <Specimen
          caption={
            <>
              w-16 (64px) — narrower than &ldquo;Step 2 of 4&rdquo; itself, which measures 71px. The
              count is shrink-0 and nothing clips the text row, so below roughly 72px the count
              spills out of the component&apos;s own box rather than being cut. The spec&apos;s
              Anatomy says the text row &ldquo;clips&rdquo; but never says what clips it, and no edge
              case names a minimum width. Decide which you want: this overflow, a clip that cuts the
              count mid-word, or a stated floor.
            </>
          }
        >
          <div className="w-16">
            <Sketch current={2} total={4} label="Trade partners and subcontractor agreements" />
          </div>
        </Specimen>
      </Block>

      <Block
        title="Height invariance (CR-017)"
        note="Three renderings stacked with no gap between them other than the flex gap: no label, a label, a long truncated label. Any height difference shows up as a ragged left edge."
      >
        <div className="flex flex-col gap-6">
          <Sketch current={3} total={6} />
          <Sketch current={3} total={6} label="Review" />
          <div className="w-64">
            <Sketch current={3} total={6} label="Trade partners and subcontractor agreements" />
          </div>
        </div>
      </Block>

      <Block
        title="Empty and whitespace-only labels are treated as absent"
        note="Inherited from badge.md. No separator, no empty span."
      >
        <Sketch current={2} total={4} label="" />
        <Sketch current={2} total={4} label="   " />
      </Block>
    </Page>
  ),
};

/**
 * Both supported placements of spec D13. The component paints no background of its own,
 * so every contrast number in the spec is measured against whichever of these two the
 * consumer chose — and the upcoming tone is the one with something to lose (1.67:1 on
 * white, 1.59:1 on the page surface).
 */
export const OnSurfaceDefault: Story = {
  render: () => (
    <Page surface="default">
      <Block
        title="On surface-default (#ffffff)"
        note="current 12.62:1 · completed 4.73:1 · upcoming 1.67:1, all against this background."
      >
        <Sketch current={1} total={4} label="Project information" />
        <Sketch current={2} total={4} label="Trade partners" />
        <Sketch current={4} total={4} label="Review" />
      </Block>
    </Page>
  ),
};

export const OnSurfacePage: Story = {
  render: () => (
    <Page surface="page">
      <Block
        title="On surface-page (#f7f9fc)"
        note="current 11.97:1 · completed 4.49:1 · upcoming 1.59:1. The upcoming segments are the thing to look at: they are faint by design, and this is the surface they are faintest on."
      >
        <Sketch current={1} total={4} label="Project information" />
        <Sketch current={2} total={4} label="Trade partners" />
        <Sketch current={4} total={4} label="Review" />
      </Block>

      <Block
        title="The same, in a card on the page surface"
        note="A consumer commonly places this inside a panel, which puts it back on surface-default. Both are in contract; nothing else is."
      >
        <div className="rounded-md border border-outline-subtle bg-surface-default p-6">
          <Sketch current={2} total={4} label="Trade partners" />
        </div>
      </Block>
    </Page>
  ),
};

/**
 * ============================================================================
 * OD-002 / FB-2 — THE DECISION THIS DRAFT EXISTS FOR
 * ============================================================================
 *
 * The two input documents contradict each other and this repository's owner has not
 * chosen. Both options are rendered below, at every position in the same four-step flow,
 * so the choice can be made by looking rather than by reading.
 *
 * Neither column is a recommendation from this draft. The spec is authored on option A,
 * which means A is what happens if the owner says nothing — but that is the spec's
 * interim posture, not an answer to the question.
 */
export const PartialFillDecision: Story = {
  name: 'OD-002 — partial fill, both options',
  render: () => (
    <Page>
      <Block
        title="OD-002 — may the current segment be drawn partly filled?"
        note="A blocking open decision (freeze blocker FB-2). The spec is authored on option A; the source design system's owner overrode the same requirement in favour of option B, on their own authority, which does not transfer here."
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h3 className="font-body-sm-emphasis text-fg-default">
              A — three solid tones, no partial fill (CR-007 as written; what the spec specifies)
            </h3>
            <Caption>
              State distinction is carried by tone. Weakest adjacent pair: <b>2.67:1</b> (current
              vs completed). Risk it introduces: none.
            </Caption>
            {[1, 2, 3, 4].map((n) => (
              <Sketch key={n} current={n} total={4} fill="tone" />
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-body-sm-emphasis text-fg-default">
              B — one fill colour at three extents; the current segment half filled (the override)
            </h3>
            <Caption>
              State distinction is carried by extent, which is not a colour distinction at all.
              The source design system measured its fill against its track at <b>10.12:1</b>. Bound
              to <i>this</i> repository&apos;s tokens the same pair is{' '}
              <b>7.55:1</b> — still far above the 2.67:1 of option A, but the 10.12:1 in the spec
              is that system&apos;s number, not one reproducible here. Risk it introduces: a
              half-filled bar can read as &ldquo;50% of this step is done&rdquo;, which is the exact
              misreading CR-007 exists to prevent.
            </Caption>
            {[1, 2, 3, 4].map((n) => (
              <Sketch key={n} current={n} total={4} fill="extent" />
            ))}
          </div>
        </div>
      </Block>

      <Block
        title="Side by side, at the same position"
        note="Step 2 of 4, the rendering where the two options differ most visibly."
      >
        <Specimen caption="A — three solid tones.">
          <Sketch current={2} total={4} label="Trade partners" fill="tone" />
        </Specimen>
        <Specimen caption="B — half-filled current segment.">
          <Sketch current={2} total={4} label="Trade partners" fill="extent" />
        </Specimen>
      </Block>

      <Block
        title="Both options at six steps"
        note="The half fill has less room to be read as an extent when segments are narrow. Worth checking before choosing B."
      >
        <Specimen caption="A — six steps, on the fourth.">
          <Sketch current={4} total={6} fill="tone" />
        </Specimen>
        <Specimen caption="B — six steps, on the fourth.">
          <Sketch current={4} total={6} fill="extent" />
        </Specimen>
      </Block>

      <Block
        title="Both options in a narrow container"
        note="w-64 = 256px. B's distinction is an extent, so it is the one that has something to lose when a segment gets short — at six steps here a segment is 36px and its half is 18px."
      >
        <div className="flex w-64 flex-col gap-6">
          <Sketch current={4} total={6} fill="tone" />
          <Sketch current={4} total={6} fill="extent" />
          <Sketch current={5} total={8} fill="tone" />
          <Sketch current={5} total={8} fill="extent" />
        </div>
      </Block>
    </Page>
  ),
};

/**
 * Spec D6 and AC18: the component has no slack in its box, so the indicator's bottom edge
 * is the component's bottom edge and a bottom-placed stepper meets a filled panel flush.
 * Also spec CR-010: Back and Next are composed BESIDE the component and are never part of
 * it — a reader must not be able to infer otherwise from a story.
 */
export const InPlacement: Story = {
  render: () => (
    <Page surface="page">
      <Block
        title="Top placement"
        note="Above the step's content. The flow controls are elsewhere."
      >
        <div className="rounded-md border border-outline-subtle bg-surface-default">
          <div className="p-6">
            <Sketch current={2} total={4} label="Trade partners" />
          </div>
          <div className="border-t border-outline-subtle p-6 font-body-sm-default text-fg-subtle">
            The step&apos;s own content sits here.
          </div>
        </div>
      </Block>

      <Block
        title="Bottom placement, flush against an action panel (AC18)"
        note="The claim is that the component contributes no trailing whitespace of its own, so the last segment can meet a filled panel with no band of the wrong background between them. Below, the stepper is followed IMMEDIATELY by the panel — no consumer margin at all — so the seam is the component's own bottom edge and nothing else."
      >
        <div className="overflow-hidden rounded-md border border-outline-subtle bg-surface-default">
          <div className="p-6 font-body-sm-default text-fg-subtle">
            The step&apos;s own content sits here.
          </div>
          <div className="px-6">
            <Sketch current={3} total={4} label="Project budget" />
          </div>
          <div className="flex items-center justify-end gap-4 bg-surface-neutral-subtle p-4">
            <span className="font-body-sm-moderate text-fg-subtle">Back</span>
            <span className="font-body-sm-moderate text-fg-default">Next</span>
          </div>
        </div>
        <Caption>
          The segments touch the panel exactly. Whether that seam is <i>wanted</i> is the question —
          the spec presents it as a benefit, and it may equally read as cramped. Spacing there
          belongs to the consumer (spec D6), so choosing it is not this component&apos;s job; seeing
          it is.
        </Caption>
        <div className="overflow-hidden rounded-md border border-outline-subtle bg-surface-default">
          <div className="p-6 font-body-sm-default text-fg-subtle">
            The step&apos;s own content sits here.
          </div>
          <div className="px-6 pb-6">
            <Sketch current={3} total={4} label="Project budget" />
          </div>
          <div className="flex items-center justify-end gap-4 bg-surface-neutral-subtle p-4">
            <span className="font-body-sm-moderate text-fg-subtle">Back</span>
            <span className="font-body-sm-moderate text-fg-default">Next</span>
          </div>
        </div>
        <Caption>
          The same, with the consumer supplying 24px below the stepper. Compare the two seams.
          &ldquo;Back&rdquo; and &ldquo;Next&rdquo; are flat text standing in for buttons this
          repository does not have yet; they sit outside the component, which is the point of the
          story (CR-010).
        </Caption>
      </Block>
    </Page>
  ),
};
