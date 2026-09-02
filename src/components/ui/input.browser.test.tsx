import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../a11y-test-utils';
import { Input } from './input';

/*
 * The half of Input's test contract that jsdom cannot carry.
 *
 * Facet 1 (rendered-box measurement) and facet 3 (axe) both need real layout and real
 * computed styles. In jsdom getBoundingClientRect() returns zeroes and axe's
 * color-contrast rule resolves to `incomplete` — which reports nothing and is
 * indistinguishable from a pass. This file opts into the `browser` vitest project by
 * its FILENAME, which is why the convention is visible in the file tree.
 *
 * The specific thing being guarded: `h-[var(--ds-shared-height-md)]` compiles to
 * `height: var(--ds-shared-height-md)`, which resolves to NOTHING if the custom property
 * is missing from the served stylesheet. The element then renders at its content height
 * and every class-name assertion still passes. Only a measured box catches it.
 */

/** The declared token value, read from the same stylesheet the browser resolved. */
const tokenValue = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** A `#rrggbb` token value -> the `rgb(r, g, b)` form getComputedStyle returns a colour in. */
const hexToRgb = (hex: string): string => {
  const h = hex.replace('#', '');
  const channel = (i: number) => parseInt(h.slice(i, i + 2), 16);
  return `rgb(${channel(0)}, ${channel(2)}, ${channel(4)})`;
};

const field = () => screen.getByRole('textbox');

describe('Input — rendered box (AC12, AC13; facet 1)', () => {
  it('resolves the md height to the shared token value, measured not asserted', () => {
    render(<Input label="Email" size="md" />);

    // Compared against the token rather than a hardcoded 40: if the scale moves, this
    // test moves with it, and it still fails if the var() binding resolves to nothing.
    expect(tokenValue('--ds-shared-height-md')).toBe('40px');
    expect(field().getBoundingClientRect().height).toBe(40);
  });

  it('resolves the sm height to the shared token value', () => {
    render(<Input label="Email" size="sm" />);

    expect(tokenValue('--ds-shared-height-sm')).toBe('34px');
    expect(field().getBoundingClientRect().height).toBe(34);
  });

  it('renders the two sizes visibly distinct, which is what CR-012 asks for', () => {
    const { rerender } = render(<Input label="Email" size="md" />);
    const md = field().getBoundingClientRect().height;

    rerender(<Input label="Email" size="sm" />);
    const sm = field().getBoundingClientRect().height;

    expect(md).toBeGreaterThan(sm);
    // Stated separately so a regression to a layout-less environment names itself:
    // in jsdom both are 0 and `md > sm` is simply false rather than obviously broken.
    expect(sm).toBeGreaterThan(0);
  });

  it('clears the AA target-size floor at both sizes, and does not claim AAA', () => {
    const { rerender } = render(<Input label="Email" size="md" />);
    expect(field().getBoundingClientRect().height).toBeGreaterThanOrEqual(24);

    rerender(<Input label="Email" size="sm" />);
    // WCAG 2.5.8 (AA) is 24x24. 2.5.5 (AAA) is 44x44 and is NOT claimed — neither
    // size would clear it, which the spec states outright (D9, A11Y-009).
    expect(field().getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
    expect(field().getBoundingClientRect().height).toBeLessThan(44);
  });

  it('fills its container rather than setting a width of its own', () => {
    const { container } = render(
      // A spacing-scale utility rather than an inline width: an inline style for a
      // layout value is what governance §14.2 forbids, and a fixture is not exempt
      // from a scan that reads every .tsx under src/components/.
      <div className="w-64">
        <Input label="Email" />
      </div>,
    );

    const wrapper = container.firstElementChild!;
    const wrapperWidth = wrapper.getBoundingClientRect().width;

    // Asserted against the CONTAINER rather than a literal: the claim is "the container
    // owns width", which a hardcoded number would restate as a coincidence.
    expect(wrapperWidth).toBeGreaterThan(0);
    expect(field().getBoundingClientRect().width).toBe(wrapperWidth);
  });
});

describe('Input — focus indicator (AC6, A11Y-008)', () => {
  it('adds a 2px ring in the border’s own token on focus', async () => {
    const user = userEvent.setup();
    render(<Input label="Email" />);

    await user.click(field());

    const styles = getComputedStyle(field());
    expect(styles.outlineWidth).toBe('2px');
    expect(styles.outlineOffset).toBe('0px');
    // D3: the ring binds outline-input-focused, NOT outline-focus. The green-on-blue
    // pairing that produced was rendered and rejected by the owner on 2026-09-02.
    expect(styles.outlineColor).toBe(hexToRgb(tokenValue('--ds-outline-input-focused')));
    expect(styles.outlineColor).not.toBe(hexToRgb(tokenValue('--ds-outline-focus')));
  });

  it('keeps the ring in the ERROR token when focused in error, so no second hue appears', async () => {
    const user = userEvent.setup();
    render(<Input label="Email" error="Enter a valid address." />);

    await user.click(field());

    const styles = getComputedStyle(field());
    expect(styles.outlineWidth).toBe('2px');
    // Ring and border in the same token. A blue ring hugging a red border measures
    // 1.35:1 against each other — the muddiest edge in the component (D3).
    const errorColor = hexToRgb(tokenValue('--ds-outline-input-error'));
    expect(styles.outlineColor).toBe(errorColor);
    expect(styles.borderTopColor).toBe(errorColor);
  });

  it('shows focus from the pointer route, not only from the keyboard', async () => {
    const user = userEvent.setup();
    render(<Input label="Email" />);

    // CR-006 requires visible focus from pointer OR keyboard, which is why the source
    // uses `focus:` and not `focus-visible:` — the latter would drop this case.
    await user.click(field());
    expect(getComputedStyle(field()).outlineWidth).toBe('2px');
  });

  it('shows the same indicator from the keyboard route', async () => {
    const user = userEvent.setup();
    render(<Input label="Email" />);

    await user.tab();

    expect(field()).toHaveFocus();
    expect(getComputedStyle(field()).outlineWidth).toBe('2px');
  });
});

describe('Input — fill states (D3)', () => {
  it('does not change fill on focus, because the focused surface token is dead', async () => {
    const user = userEvent.setup();
    render(<Input label="Email" />);

    const resting = getComputedStyle(field()).backgroundColor;
    await user.click(field());
    const focused = getComputedStyle(field()).backgroundColor;

    // surface-input-focused resolves to the same value as surface-input, byte-identical.
    // The spec leaves it unbound rather than binding it and rendering nothing.
    expect(focused).toBe(resting);
    expect(resting).toBe(hexToRgb(tokenValue('--ds-surface-input')));
  });

  it('uses the disabled surface and border when disabled', () => {
    render(<Input label="Email" disabled />);

    const styles = getComputedStyle(field());
    expect(styles.backgroundColor).toBe(hexToRgb(tokenValue('--ds-surface-input-disabled')));
    expect(styles.borderTopColor).toBe(hexToRgb(tokenValue('--ds-outline-input-disabled')));
  });
});

describe('Input — accessibility scan (facet 3)', () => {
  it('has no WCAG AA violations at rest', async () => {
    const { container } = render(<Input label="Email address" description="We never share it." />);

    await expectNoAxeViolations(container);
  });

  it('has no WCAG AA violations in the error state', async () => {
    const { container } = render(
      <Input label="Email address" error="Enter a valid email address." />,
    );

    await expectNoAxeViolations(container);
  });

  it('has no WCAG AA violations when disabled', async () => {
    const { container } = render(
      <Input label="Email address" disabled description="Locked while the form is submitting." />,
    );

    // fg-disabled on surface-input-disabled is 2.00:1 and is EXEMPT rather than passing:
    // WCAG 1.4.3 excludes inactive controls, and axe skips disabled elements for
    // colour-contrast for the same reason. Recorded so a future reader does not read
    // this green as evidence the disabled text clears AA. It does not.
    await expectNoAxeViolations(container);
  });

  it('has no WCAG AA violations when required', async () => {
    const { container } = render(<Input label="Email address" required />);

    await expectNoAxeViolations(container);
  });
});
