import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Input, type InputProps } from './input';

/*
 * Unit coverage for Input, against the acceptance criteria in
 * docs/component-specs/input.md.
 *
 * Three of the spec's six required test facets are NOT here, and their absence is
 * deliberate rather than an oversight:
 *
 *   facet 1 (rendered-box measurement) and facet 3 (axe) need real layout and real
 *   computed styles, so they live in input.browser.test.tsx — jsdom performs no layout
 *   and reports every box as 0x0, where an assertion like "both sizes differ" passes
 *   on 0 !== 0 being false... or worse, quietly compares nothing.
 *
 *   facet 4 (contrast pairs) belongs in src/tokens.test.ts, which is outside this
 *   stage's write scope. Raised as an open decision in the stage report rather than
 *   written here, because putting palette assertions in a component test would hide a
 *   palette-level guard inside one component — the same mistake D4 refuses to make.
 *
 * Facets 2, 5 and 6 are here and are labelled where they appear.
 */

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Input — label and accessible name (AC1, AC2)', () => {
  it('renders the label visibly and uses it as the accessible name', () => {
    render(<Input label="Email address" />);

    expect(screen.getByText('Email address')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Email address' })).toBeInTheDocument();
  });

  it('focuses the field when the label is clicked', async () => {
    const user = userEvent.setup();
    render(<Input label="Email address" />);

    await user.click(screen.getByText('Email address'));

    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('generates a fresh id per instance, so two Inputs on one page do not collide', () => {
    render(
      <>
        <Input label="First" />
        <Input label="Second" />
      </>,
    );

    const [first, second] = screen.getAllByRole('textbox');
    expect(first.id).not.toBe(second.id);
    expect(first.id).not.toBe('');
  });
});

describe('Input — placeholder (AC3)', () => {
  it('carries the placeholder while the value is empty', () => {
    render(<Input label="Email" placeholder="you@example.com" />);

    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('treats an empty string as a legitimate value rather than coercing it away', async () => {
    const user = userEvent.setup();
    render(<Input label="Email" defaultValue="abc" />);
    const field = screen.getByRole('textbox');

    await user.clear(field);

    // Not `undefined`, and not reverted to the default: the spec's `empty` edge case
    // makes an empty string a value the user chose.
    expect(field).toHaveValue('');
  });
});

describe('Input — supporting text and error (AC4, AC7, AC8)', () => {
  it('renders supporting text below the field and points aria-describedby at it', () => {
    render(<Input label="Email" description="We never share it." />);

    const field = screen.getByRole('textbox');
    const node = screen.getByText('We never share it.');

    expect(field).toHaveAttribute('aria-describedby', node.id);
  });

  it('omits aria-describedby entirely when there is neither description nor error', () => {
    render(<Input label="Email" />);

    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
  });

  it('replaces the supporting text with the error in ONE node with a stable id', () => {
    const { rerender } = render(<Input label="Email" description="We never share it." />);
    const idBefore = screen.getByText('We never share it.').id;

    rerender(<Input label="Email" description="We never share it." error="Enter a valid address." />);

    // Replaced, not joined by a second node — CR-007.
    expect(screen.queryByText('We never share it.')).not.toBeInTheDocument();
    const errorNode = screen.getByText('Enter a valid address.');
    // The id survives the swap, so aria-describedby never has to be rewritten (D7).
    expect(errorNode.id).toBe(idBefore);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', idBefore);
  });

  it('sets aria-invalid while in error, and not otherwise', () => {
    const { rerender } = render(<Input label="Email" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');

    rerender(<Input label="Email" error="Enter a valid address." />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('treats an empty or whitespace-only error as NO error', () => {
    const { rerender } = render(<Input label="Email" error="" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');

    rerender(<Input label="Email" error="   " />);
    // "Empty text is absent text" — the badge.md rule this spec inherits for `error`.
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('uses no live region, so a field rendered already in error does not announce on mount', () => {
    render(<Input label="Email" error="Enter a valid address." />);

    // D7: the rejected alternative was role="alert" on the description node.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('still renders the error on a disabled field', () => {
    render(<Input label="Email" disabled error="Rejected by the server." />);

    // A server-rejected value the user cannot currently edit is real — the spec's
    // error + disabled row settles this in favour of still showing the message.
    expect(screen.getByText('Rejected by the server.')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});

describe('Input — required (AC5)', () => {
  it('sets the native attribute and keeps the marker out of the accessible name', () => {
    render(<Input label="Email" required />);

    const field = screen.getByRole('textbox', { name: 'Email' });
    expect(field).toBeRequired();

    // The asterisk is a decorative glyph. Letting it into the name produces
    // "Email asterisk" or "Email star" depending on the screen reader (D8).
    const marker = screen.getByText('*', { exact: false, selector: '[aria-hidden="true"]' });
    expect(marker).toHaveAttribute('aria-hidden', 'true');
  });

  it('is not required by default', () => {
    render(<Input label="Email" />);
    expect(screen.getByRole('textbox')).not.toBeRequired();
  });
});

describe('Input — disabled (AC9)', () => {
  it('rejects typing', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Input label="Email" disabled onValueChange={onValueChange} />);

    await user.type(screen.getByRole('textbox'), 'hello');

    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('is skipped by Tab — facet 2, asserted on tab order rather than on the attribute', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">before</button>
        <Input label="Email" disabled />
        <button type="button">after</button>
      </>,
    );

    screen.getByRole('button', { name: 'before' }).focus();
    await user.tab();

    // `toBeDisabled()` alone does not prove tab-skipping: it asserts the attribute,
    // not the browser behaviour the attribute is supposed to produce. This lands
    // PAST the field or it does not.
    expect(screen.getByRole('button', { name: 'after' })).toHaveFocus();
  });

  it('uses the native attribute rather than aria-disabled, which would leave it focusable', () => {
    render(<Input label="Email" disabled />);

    const field = screen.getByRole('textbox');
    expect(field).toBeDisabled();
    expect(field).not.toHaveAttribute('aria-disabled');
  });
});

describe('Input — controlled and uncontrolled (AC10)', () => {
  it('manages its own value when uncontrolled', async () => {
    const user = userEvent.setup();
    render(<Input label="Email" defaultValue="a" />);
    const field = screen.getByRole('textbox');

    await user.type(field, 'b');

    expect(field).toHaveValue('ab');
  });

  it('renders the controlled value and never stores its own', async () => {
    const user = userEvent.setup();
    render(<Input label="Email" value="fixed" onValueChange={vi.fn()} />);
    const field = screen.getByRole('textbox');

    await user.type(field, 'more');

    // The consumer did not re-render with a new value, so the field must not move.
    expect(field).toHaveValue('fixed');
  });

  it('fires onValueChange identically in both modes — facet 5, toStrictEqual', async () => {
    const user = userEvent.setup();

    const uncontrolled: string[] = [];
    const { unmount } = render(
      <Input label="Email" onValueChange={(next) => uncontrolled.push(next)} />,
    );
    await user.type(screen.getByRole('textbox'), 'ab');
    unmount();

    const controlled: string[] = [];
    function Controlled() {
      const [value, setValue] = React.useState('');
      return (
        <Input
          label="Email"
          value={value}
          onValueChange={(next) => {
            controlled.push(next);
            setValue(next);
          }}
        />
      );
    }
    render(<Controlled />);
    await user.type(screen.getByRole('textbox'), 'ab');

    // toStrictEqual, not toEqual (RA-6): the invariant is that the callback carries the
    // VALUE, in order, and nothing else — toEqual would pass on a sparse or
    // differently-shaped array that toStrictEqual catches.
    expect(uncontrolled).toStrictEqual(['a', 'ab']);
    expect(controlled).toStrictEqual(['a', 'ab']);
    expect(controlled).toStrictEqual(uncontrolled);
  });

  it('warns once per mount when given both value and defaultValue — facet 6', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Plain render(), NOT StrictMode: the facet is about determinism, and a
    // double-invoking wrapper would make "once" untestable rather than proven.
    const { rerender } = render(<Input label="Email" value="a" defaultValue="b" />);

    expect(warn).toHaveBeenCalledTimes(1);

    rerender(<Input label="Email" value="c" defaultValue="b" />);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('does not warn when given only one of the two', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<Input label="A" value="a" onValueChange={vi.fn()} />);
    render(<Input label="B" defaultValue="b" />);
    render(<Input label="C" />);

    expect(warn).not.toHaveBeenCalled();
  });

  it('lets value win when both are passed', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Input label="Email" value="from-value" defaultValue="from-default" />);

    expect(screen.getByRole('textbox')).toHaveValue('from-value');
  });
});

describe('Input — styling contract (AC11, AC14)', () => {
  it('merges a caller className onto the root so the caller wins for the same property', () => {
    const { container } = render(<Input label="Email" className="gap-4" />);
    const root = container.querySelector('[data-slot="input-root"]');

    expect(root).toHaveClass('gap-4');
    // cn() -> twMerge resolves the conflict rather than letting both land and the
    // cascade decide: the component's own gap is GONE, not merely outranked.
    expect(root).not.toHaveClass('gap-1');
    // Additive, not replacing — CR-011. The base layout survives.
    expect(root).toHaveClass('flex', 'flex-col');
  });

  it('spreads rest onto the field, and spreads it FIRST so data-slot cannot be taken over', () => {
    const hijack = { 'data-slot': 'hijacked' } as unknown as Partial<InputProps>;
    render(<Input label="Email" autoComplete="email" {...hijack} />);

    const field = screen.getByRole('textbox');
    // Governance §6.1: owned attributes are written after the spread and win.
    expect(field).toHaveAttribute('data-slot', 'input-field');
    // ...and a legitimate rest prop still reaches the control.
    expect(field).toHaveAttribute('autocomplete', 'email');
  });

  it('renders the field as a native text input with no role override', () => {
    render(<Input label="Email" />);

    const field = screen.getByRole('textbox');
    expect(field.tagName).toBe('INPUT');
    expect(field).toHaveAttribute('type', 'text');
    expect(field).not.toHaveAttribute('role');
  });
});

describe('Input — sizes (AC12, AC13, class level only)', () => {
  it('binds the shared height custom property and never a height literal', () => {
    const { rerender, container } = render(<Input label="Email" size="md" />);
    const field = () => container.querySelector('[data-slot="input-field"]')!;

    expect(field().className).toContain('var(--ds-shared-height-md)');

    rerender(<Input label="Email" size="sm" />);
    expect(field().className).toContain('var(--ds-shared-height-sm)');

    // A class assertion cannot prove the property RESOLVES — that is facet 1, in
    // input.browser.test.tsx. What it can prove is that no height literal was written,
    // which is the half of AC13 that is about the source rather than about pixels.
    expect(field().className).not.toMatch(/h-\[\d/);
  });

  it('defaults to md', () => {
    const { container } = render(<Input label="Email" />);

    expect(container.querySelector('[data-slot="input-field"]')!.className).toContain(
      'var(--ds-shared-height-md)',
    );
  });
});

describe('Input — ref forwarding', () => {
  it('forwards the ref to the field, not to the root', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input label="Email" ref={ref} />);

    // Governance §6 makes ref forwarding mandatory for DOM-likes, and the useful
    // target is the focusable one.
    expect(ref.current).toBe(screen.getByRole('textbox'));
    ref.current!.focus();
    expect(screen.getByRole('textbox')).toHaveFocus();
  });
});
