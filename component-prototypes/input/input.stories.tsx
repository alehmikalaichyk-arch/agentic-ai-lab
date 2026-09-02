import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';

/**
 * Input — VISUAL DRAFT (pipeline stage #4.5).
 *
 * This is scaffolding for one decision meeting, not an implementation. It exists so the
 * owner can look at the component before `docs/component-specs/input.md` is frozen by a
 * human merging PR-1, and it is deleted in PR-2.
 *
 * THE DECISION THIS DRAFT WAS BUILT FOR — spec D3, now SETTLED (owner review, 2026-09-02).
 *   `surface.input-focused` resolves to #ffffff, byte-identical to `surface.input`. It is a
 *   dead token: a focus treatment expressed through the fill renders nothing. So focus is
 *   carried by the border and a 2px ring.
 *
 *   The ring first bound `outline-focus` (#099468, green) — the design system's dedicated
 *   focus token — against a blue `outline-input-focused` border. The owner looked at it and
 *   rejected it. The ring now binds THE SAME TOKEN AS THE BORDER, in whatever state the
 *   border is: focus is the ring's presence, never a second hue.
 *       focus        border + ring  ->  outline-input-focused  #04639a   6.45:1
 *       error+focus  border + ring  ->  outline-input-error    #e31624   4.52:1
 *   Both the rejected version and the error+focus extension are rendered in the first story,
 *   because a decision that vanishes into a diff stops being reviewable.
 *
 * WHAT CARRIES OVER TO PR-2, and what does not (ds-component-pipeline, "Draft reuse"):
 *
 *   carries over  — appearance only: spacing, colour roles, density, which states are
 *                   visually distinct, whether 34px and 40px actually read as two sizes.
 *   does NOT      — every name and every boundary below. `Field`, its `state` parameter and
 *                   the `div` nesting are rendering scaffolding. The spec's Public API is
 *                   label / value / defaultValue / onValueChange / placeholder / description
 *                   / error / required / disabled / size / className. `state` is NOT a
 *                   proposed prop — the real component derives its appearance from `error`
 *                   and `disabled` plus CSS pseudo-classes.
 *
 * NOTHING HERE IS INTERACTIVE. Every state is rendered by class so all of them are visible
 * at once. The real component gets hover and focus from `:hover` and `:focus-visible`; a
 * draft that required the owner to go hunting for them would show one state per screenshot.
 *
 * TOKEN DISCIPLINE — the same floor as component source, deliberately:
 *   - every colour is a semantic role; no primitive, no hex, no inline style.
 *   - the ONLY arbitrary value is `h-[var(--ds-shared-height-*)]`, which spec D10 records as
 *     a documented deviation: `shared` sits in sd.config.mjs's UNPUBLISHED_GROUPS, so it
 *     reaches CSS as a custom property and publishes no utility. The bracket holds a token
 *     reference, not a literal — the opposite of what governance §14.6 forbids.
 *   - every other dimension resolves through `--ds-spacing-unit` (`px-3`, `gap-1.5`, `w-80`)
 *     or a bound radius (`rounded-sm`).
 *   - typography is the composite `font-body-*` utilities only. Tailwind's own `text-sm` is
 *     reachable here but bypasses the token layer, so it is not used.
 */

/* ------------------------------------------------------------------ *
 * The sketch. Inline on purpose — nothing here is exported.
 * ------------------------------------------------------------------ */

type FieldState =
  | 'resting'
  | 'hover'
  | 'focus'
  | 'focus-green-ring'
  | 'error'
  | 'error-focus'
  | 'disabled'
  | 'error-disabled';

type FieldSize = 'sm' | 'md';

/** Spec "Variants and sizes". Two of the four steps on the shared control-height scale. */
const HEIGHT: Record<FieldSize, string> = {
  sm: 'h-[var(--ds-shared-height-sm)] px-2.5',
  md: 'h-[var(--ds-shared-height-md)] px-3',
};

/**
 * Spec "States". One row per state, so the owner compares them side by side rather than
 * one screenshot at a time.
 *
 * Note what is NOT here: no `surface-input-focused`. It is dead (D3), so the focus rows
 * keep the resting fill and change only the border and the ring.
 */
const STATE: Record<FieldState, string> = {
  resting: 'bg-surface-input border-outline-input text-fg-default',
  hover: 'bg-surface-input-hovered border-outline-input-hovered text-fg-default',
  // Spec D3, as revised on the owner's review 2026-09-02: the ring binds the SAME token as
  // the border. Focus is the ring's presence, never a second hue.
  focus:
    'bg-surface-input border-outline-input-focused text-fg-default ring-2 ring-outline-input-focused',
  // The REJECTED original, kept only in the D3 story so the decision stays visible.
  'focus-green-ring':
    'bg-surface-input border-outline-input-focused text-fg-default ring-2 ring-outline-focus',
  error: 'bg-surface-input border-outline-input-error text-fg-default',
  'error-focus':
    'bg-surface-input border-outline-input-error text-fg-default ring-2 ring-outline-input-error',
  disabled: 'bg-surface-input-disabled border-outline-input-disabled text-fg-disabled',
  'error-disabled':
    'bg-surface-input-disabled border-outline-input-disabled text-fg-disabled',
};

function Field({
  label,
  value,
  placeholder,
  description,
  error,
  required = false,
  size = 'md',
  state = 'resting',
}: {
  label: string;
  value?: string;
  placeholder?: string;
  description?: string;
  error?: string;
  required?: boolean;
  size?: FieldSize;
  state?: FieldState;
}) {
  const empty = value === undefined || value === '';
  return (
    <div className="flex w-80 flex-col gap-1.5">
      {/* Spec D8: the marker is decorative and aria-hidden; `required` carries the state. */}
      <span className="font-body-sm-default text-fg-subtle">
        {label}
        {required ? (
          <span aria-hidden className="text-fg-status-danger">
            {' *'}
          </span>
        ) : null}
      </span>

      <div
        className={`flex items-center rounded-sm border font-body-sm-default ${HEIGHT[size]} ${STATE[state]}`}
      >
        {/* Spec D5: the placeholder sits on the field's own white surface, where
            fg-subtlest measures 4.73:1 and passes. Supporting text below does not. */}
        <span className={empty ? 'text-fg-subtlest' : undefined}>
          {empty ? placeholder : value}
        </span>
      </div>

      {/* Spec D7: ONE node. The error replaces the supporting text, never joins it. */}
      {error !== undefined && error !== '' ? (
        <span className="font-body-sm-default text-fg-status-danger">{error}</span>
      ) : description !== undefined && description !== '' ? (
        <span className="font-body-sm-default text-fg-subtle">{description}</span>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Layout scaffolding for the draft pages.
 * ------------------------------------------------------------------ */

function Block({
  title,
  note,
  children,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-body-sm-emphasis text-fg-default">{title}</h3>
      {note ? <p className="font-body-xs-default max-w-160 text-fg-subtle">{note}</p> : null}
      <div className="flex flex-wrap items-start gap-8">{children}</div>
    </section>
  );
}

function Page({ children }: { children: ReactNode }) {
  // surface-page, not white: spec D5 turns on which of the two page surfaces the
  // supporting text sits on, and the weaker one is this.
  return <div className="flex flex-col gap-10 bg-surface-page p-8">{children}</div>;
}

const meta = {
  title: 'Prototypes/Input (draft)',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Visual draft for pipeline stage #4.5. Deleted in PR-2. Look at "Focus — the D3 pairing" first: it is the decision this draft exists for.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ *
 * Stories
 * ------------------------------------------------------------------ */

/**
 * THE DECISION. Spec D3 binds two different hues to one focus moment because the token
 * named for the fill is dead. This is the pairing to accept or reject.
 */
export const FocusTheD3Pairing: Story = {
  name: 'Focus — the D3 pairing',
  render: () => (
    <Page>
      <Block
        title="DECIDED — the ring binds the border's own token"
        note={
          <>
            Owner review, 2026-09-02. The ring and the border are both{' '}
            <code>outline-input-focused</code> (#04639a): focus is the ring&apos;s{' '}
            <strong>presence</strong>, never a second hue. The measurement improved rather
            than being traded away — the ring went from 3.85:1 to <strong>6.45:1</strong>{' '}
            against the field and 3.66:1 to <strong>6.11:1</strong> against the page.
          </>
        }
      >
        <Field label="Resting, for comparison" placeholder="you@example.com" state="resting" />
        <Field label="Focused" value="you@example.com" state="focus" />
      </Block>

      <Block
        title="REJECTED — the green ring this replaced"
        note={
          <>
            The spec originally bound the ring to <code>outline-focus</code> (#099468), the
            design system&apos;s dedicated component-agnostic focus token, so that this
            component&apos;s focus would not be an exception. Rendered, it is a green ring
            around a blue border. Kept here so the decision stays visible rather than
            vanishing into a diff — this is what stage #4.5 exists to catch, and prose could
            not have settled it. Consequence, escalated to governance:{' '}
            <code>outline-focus</code> is now bound by nothing, and the next interactive
            component will face this same choice.
          </>
        }
      >
        <Field
          label="Green ring, blue border"
          value="you@example.com"
          state="focus-green-ring"
        />
      </Block>

      <Block
        title="Error plus focus — the rule extended, and worth your eye"
        note={
          <>
            The owner&apos;s instruction removes a second hue from the focus indicator.
            Applying it only to plain focus would leave THIS state as the one place a second
            hue survives — a blue ring hugging a red border, which measure{' '}
            <strong>1.35:1 against each other</strong>, the muddiest edge in the component. So
            the ring takes the border&apos;s token here too. The error keeps its colour; focus
            is still the ring. Flagged because it extends an instruction rather than following
            it literally — say so if the extension is wrong.
          </>
        }
      >
        <Field
          label="Error, not focused"
          value="not-an-email"
          error="Enter a valid email address."
          state="error"
        />
        <Field
          label="Error + focused"
          value="not-an-email"
          error="Enter a valid email address."
          state="error-focus"
        />
      </Block>
    </Page>
  ),
};

/**
 * Spec "Variants and sizes". 40px and 34px, both from the shared control-height scale.
 * The question the owner answers here: do these read as two sizes, or as one size and a
 * rendering accident?
 */
export const Sizes: Story = {
  render: () => (
    <Page>
      <Block
        title="md — 40px, regular"
        note="The default. Standard forms. Documented in the token source as the scale's default step."
      >
        <Field label="Full name" placeholder="Ada Lovelace" size="md" />
        <Field label="Full name" value="Ada Lovelace" size="md" />
      </Block>

      <Block
        title="sm — 34px, compact"
        note="Table filter bars, editable cells. The adjacent step down. xs (30px) was available and not taken — it is tighter than the stated use cases need, and would put the repository's first interactive component 6px from the AA target-size floor for no requirement."
      >
        <Field label="Full name" placeholder="Ada Lovelace" size="sm" />
        <Field label="Full name" value="Ada Lovelace" size="sm" />
      </Block>

      <Block
        title="Side by side"
        note="Both share one type size. The height difference is carried by the box, not the text — a compact field with smaller text would be a second, unrequested axis."
      >
        <Field label="Regular (md)" value="Ada Lovelace" size="md" />
        <Field label="Compact (sm)" value="Ada Lovelace" size="sm" />
      </Block>
    </Page>
  ),
};

/** Spec "States". Every state at once, including the three the brief left unsettled. */
export const States: Story = {
  render: () => (
    <Page>
      <Block
        title="The states a user passes through"
        note="Rendered by class rather than by interaction, so all of them are visible in one screenshot."
      >
        <Field label="Resting" placeholder="Placeholder text" state="resting" />
        <Field label="Hover" value="Hovered" state="hover" />
        <Field label="Focus" value="Focused" state="focus" />
      </Block>

      <Block
        title="Resting — the accepted contrast gap, spec D4"
        note={
          <>
            The resting border is <code>outline-input</code> at <strong>1.67:1</strong>{' '}
            against the field, below the 3:1 WCAG 1.4.11 asks for. Accepted knowingly: no
            neutral outline token in the system passes, and the only one that does is an
            accent role. This is what that looks like — judge whether the field still reads
            as a field. The label is always present, and every state below clears the floor.
          </>
        }
      >
        <Field label="Resting, on the page surface" placeholder="Is this box visible enough?" />
      </Block>

      <Block
        title="The three combinations the brief left unsettled"
        note="Each decided in the spec rather than left to the implementer."
      >
        <Field
          label="Error + focus"
          value="not-an-email"
          error="The ring is added over a retained error border."
          state="error-focus"
        />
        <Field
          label="Error + disabled"
          value="rejected-value"
          error="Disabled appearance wins; the message is still rendered."
          state="error-disabled"
        />
        <Field label="Hover on disabled" value="No hover treatment" state="disabled" />
      </Block>
    </Page>
  ),
};

/** Spec "Anatomy" and D7 — the error replaces the supporting text in one node. */
export const Anatomy: Story = {
  render: () => (
    <Page>
      <Block
        title="Label, field, description — and the required marker"
        note="The marker is aria-hidden (D8); the required state comes from the native attribute alone, so no screen reader says 'Email asterisk'."
      >
        <Field label="Email" required placeholder="you@example.com" />
        <Field
          label="Email"
          required
          value="ada@example.com"
          description="We only use this to send receipts."
        />
      </Block>

      <Block
        title="One description node, two contents — never both"
        note="Spec D7. The error takes the supporting text's place rather than appearing beside it, and the node keeps a stable id so aria-describedby never has to be rewritten."
      >
        <Field
          label="Email"
          required
          value="ada@example"
          description="We only use this to send receipts."
        />
        <Field
          label="Email"
          required
          value="ada@example"
          description="We only use this to send receipts."
          error="Enter a valid email address."
          state="error"
        />
      </Block>

      <Block
        title="Long content — nothing truncates"
        note="A long label wraps and the field does not move up to meet it; a long error wraps and the block grows. Spec Edge cases."
      >
        <Field
          label="The label is long enough that it has to wrap onto a second line to fit"
          value="a-fairly-long-value-that-fills-the-field"
          error="This message is long enough to wrap onto more than one line, which grows the block rather than clipping."
          state="error"
        />
      </Block>
    </Page>
  ),
};

/** The whole surface on one page — what the owner scans before approving PR-1. */
export const Everything: Story = {
  render: () => (
    <Page>
      <Block title="md — every state" note="Regular size, 40px.">
        <Field label="Resting" placeholder="Placeholder" state="resting" />
        <Field label="Hover" value="Value" state="hover" />
        <Field label="Focus" value="Value" state="focus" />
        <Field label="Error" value="Value" error="Something is wrong." state="error" />
        <Field label="Disabled" value="Value" state="disabled" />
      </Block>

      <Block title="sm — every state" note="Compact size, 34px.">
        <Field label="Resting" placeholder="Placeholder" size="sm" state="resting" />
        <Field label="Hover" value="Value" size="sm" state="hover" />
        <Field label="Focus" value="Value" size="sm" state="focus" />
        <Field
          label="Error"
          value="Value"
          size="sm"
          error="Something is wrong."
          state="error"
        />
        <Field label="Disabled" value="Value" size="sm" state="disabled" />
      </Block>
    </Page>
  ),
};
