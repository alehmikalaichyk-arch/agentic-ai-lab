import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';

/*
 * Input — a single-line text field.
 *
 * Built literally from docs/component-specs/input.md, frozen on origin/main via PR #28.
 * Four decisions in here look like defects and are not. Each is the spec's, not this
 * file's, and the spec carries the measurement behind it:
 *
 *   D3   The focus ring binds the SAME token as the border — outline-input-focused
 *        normally, outline-input-error when focused in error. It is deliberately NOT
 *        `outline-focus`: that green-on-blue pairing was rendered and rejected by the
 *        owner on 2026-09-02. And `surface-input-focused` is bound by nothing, because
 *        it resolves to the SAME value as `surface-input` — byte-identical. Binding it
 *        would render exactly nothing. Focus is carried by the border plus the ring.
 *
 *   D4   The resting border is knowingly below AA — `outline-input` is 1.67:1 against
 *        its own surface, under WCAG 1.4.11's 3:1. Every neutral outline token in this
 *        palette is. Accepted per the brief's OD-003 and escalated to governance as a
 *        palette-level finding. Do NOT substitute `outline-accent-grey-strong`: it is an
 *        accent role, and using it here would hide a palette problem inside one component.
 *
 *   D10  `h-[var(--ds-shared-height-*)]` is the sanctioned channel, not the arbitrary
 *        value governance §14.6 forbids. `shared` sits in sd.config.mjs's
 *        UNPUBLISHED_GROUPS, so the scale reaches CSS as a custom property and publishes
 *        no Tailwind utility — there is no `h-md` to reach for. The bracket holds a token
 *        reference, not a literal, which is the opposite of what §14.6 exists to stop.
 *
 *   A11Y-008  `focus:`, not `focus-visible:`. CR-006 requires visible focus from pointer
 *        OR keyboard, so narrowing to `:focus-visible` would drop the pointer route.
 *
 * Hover is suppressed on a disabled field with the `enabled:` variant rather than by class
 * order, because `:hover` still matches a disabled input.
 */

const fieldVariants = cva(
  [
    // Layout. Width is the container's — the spec's mobile edge case makes the field
    // fluid at both sizes, with no fixed width at any breakpoint.
    'w-full rounded-sm border',
    // Type as a composite token, so size, weight and line-height cannot drift apart.
    'font-body-sm-default',
    // Fill and text. `surface-input` covers resting AND focus: the focused fill is dead (D3).
    'bg-surface-input text-fg-default placeholder:text-fg-subtlest',
    // The ring. Its colour is set per state below; only its geometry is shared.
    'focus:outline-2 focus:outline-offset-0',
    // Hover fill applies in every enabled state, error included — the error is carried by
    // the border, so the fill is free to respond to the pointer.
    'enabled:hover:bg-surface-input-hovered',
    // Disabled wins over everything, and suppresses hover by never matching `enabled:`.
    'disabled:bg-surface-input-disabled disabled:border-outline-input-disabled disabled:text-fg-disabled',
  ],
  {
    variants: {
      size: {
        sm: 'h-[var(--ds-shared-height-sm)] px-2.5',
        md: 'h-[var(--ds-shared-height-md)] px-3',
      },
      invalid: {
        // In error the border keeps its colour through hover and focus alike, and focus
        // is signalled by the ring's presence — never by a second hue (D3).
        true: 'border-outline-input-error focus:outline-outline-input-error',
        false: [
          'border-outline-input',
          'enabled:hover:border-outline-input-hovered',
          'focus:border-outline-input-focused focus:outline-outline-input-focused',
        ],
      },
    },
    defaultVariants: { size: 'md', invalid: false },
  },
);

/**
 * Empty text is absent text — the rule `badge.md` establishes for `children`, which this
 * spec inherits and applies to `error`. An empty or whitespace-only `error` is NO error,
 * not an error with nothing in it.
 */
const isPresent = (text: string | undefined): text is string =>
  text !== undefined && text.trim().length > 0;

export interface InputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'size' | 'value' | 'defaultValue' | 'onChange' | 'disabled' | 'required' | 'placeholder'
  > {
  /** Visible, and the field's accessible name. Not optional — a field without one has no name. */
  label: string;
  /** Controlled value. Its presence switches the component to controlled. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Fires on every edit, in both modes, carrying the value rather than the event. */
  onValueChange?: (value: string) => void;
  /** Shown only while the field is empty. Never a substitute for the label. */
  placeholder?: string;
  /** Supporting text below the field. Replaced by `error` when there is one. */
  description?: string;
  /** Presence puts the field in the error state and replaces `description`. */
  error?: string;
  /** Renders the marker and sets the native attribute. */
  required?: boolean;
  /** Native attribute; removes the field from the tab order. */
  disabled?: boolean;
  /** `sm` is compact, `md` is regular. The native `size` attribute is omitted — D2. */
  size?: 'sm' | 'md';
  /** Merged through `cn()` onto the ROOT, so a caller's utility wins for the same property. */
  className?: string;
}

/**
 * A single-line text field: a label, the field, and one description node that carries
 * either supporting text or an error.
 *
 * `className` lands on the root and `...rest` on the field. These are different elements
 * and the split is deliberate — a caller styling "the input" almost always means the
 * block, while a caller passing `autoComplete` or `inputMode` always means the control.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    value,
    defaultValue,
    onValueChange,
    placeholder,
    description,
    error,
    required = false,
    disabled = false,
    size = 'md',
    className,
    ...rest
  },
  ref,
) {
  const reactId = React.useId();
  const fieldId = `${reactId}-field`;
  const descriptionId = `${reactId}-description`;

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? '');
  const currentValue = isControlled ? value : uncontrolledValue;

  const hasError = isPresent(error);
  // ONE node, whose content is the error when in error and the supporting text otherwise.
  // The id is stable across the swap, so `aria-describedby` never has to be rewritten (D7).
  const descriptionText = hasError ? error : description;
  const hasDescription = isPresent(descriptionText);

  // Dev-only, once per mount. The ref guard is what makes it once rather than once per
  // render — and it survives StrictMode's double invocation, where a bare call would not.
  const hasWarnedRef = React.useRef(false);
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (hasWarnedRef.current) return;
    if (value !== undefined && defaultValue !== undefined) {
      hasWarnedRef.current = true;
      console.warn(
        'Input: received both `value` and `defaultValue`. `value` wins and the component ' +
          'is controlled. Pass one or the other — switching modes across the component’s ' +
          'life is out of contract.',
      );
    }
  }, [value, defaultValue]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    if (!isControlled) setUncontrolledValue(next);
    onValueChange?.(next);
  };

  return (
    <div data-slot="input-root" className={cn('flex w-full flex-col gap-1', className)}>
      <label
        data-slot="input-label"
        htmlFor={fieldId}
        className="font-body-sm-default text-fg-subtle"
      >
        {label}
        {required && (
          // Decorative, and deliberately outside the accessible name: letting it in
          // produces "Email asterisk" or "Email star" depending on the screen reader,
          // which makes a verbosity setting decide what the field is called (D8).
          <span aria-hidden="true" className="text-fg-status-danger">
            {' *'}
          </span>
        )}
      </label>

      {/*
        `...rest` is spread FIRST and the component's own attributes are written after
        (governance §6.1, spec AC14). A spread placed last would let a caller take over
        `data-slot`, which is how every harness and `[data-slot=…]` query finds this element.
      */}
      <input
        {...rest}
        ref={ref}
        data-slot="input-field"
        id={fieldId}
        type="text"
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={hasDescription ? descriptionId : undefined}
        // Through cn() even though the field takes no caller className: governance §14.5
        // makes cn() the single composition channel, and cva's own concatenation is not it.
        className={cn(fieldVariants({ size, invalid: hasError }))}
      />

      {hasDescription && (
        // No `role="alert"` and no live region, deliberately (D7): a field rendered
        // ALREADY in error — a server round-trip, a restored draft — would announce on
        // mount, before the user has done anything. `aria-invalid` plus `aria-describedby`
        // is what CR-008 asks for: the message reachable, not interrupting.
        <p
          data-slot="input-description"
          id={descriptionId}
          className={cn(
            'font-body-sm-default',
            hasError ? 'text-fg-status-danger' : 'text-fg-subtle',
          )}
        >
          {descriptionText}
        </p>
      )}
    </div>
  );
});
