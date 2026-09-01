/*
 * Smoke test for the `browser` vitest project itself. It asserts nothing about
 * any design-system component — it asserts that this project can do the two
 * things jsdom cannot, and that the a11y harness can go red.
 *
 * It is kept rather than thrown away for one reason: the failure it guards
 * against is silent. A browser project that quietly falls back to a
 * layout-less environment reports every box as 0x0, and a test asserting
 * "height is the same across variants" then passes — 0 equals 0. The stage-#8
 * finding that produced this project was exactly that shape. A config that is
 * merely present proves nothing; this file is the proof.
 */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations, runAxe } from './a11y-test-utils';

describe('browser project: layout', () => {
  it('measures a non-zero box, which jsdom cannot', () => {
    const { getByTestId } = render(
      <div
        data-testid="box"
        style={{ width: '120px', height: '40px' }}
      />,
    );

    const rect = getByTestId('box').getBoundingClientRect();

    expect(rect.width).toBe(120);
    expect(rect.height).toBe(40);
    // Stated separately from the equalities above so the failure message names
    // the actual regression: in jsdom every one of these is 0.
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
  });

  it('resolves Tailwind utilities to real pixels, so a measured box means something', () => {
    const { getByTestId } = render(<div data-testid="sized" className="h-16 w-16" />);

    const rect = getByTestId('sized').getBoundingClientRect();

    // h-16 / w-16 is 4rem. If the stylesheet were not served by this project the
    // element would be 0 tall and the class would be silently inert.
    expect(rect.height).toBe(64);
    expect(rect.width).toBe(64);
  });
});

describe('browser project: axe harness', () => {
  it('passes a conformant fixture', async () => {
    const { container } = render(
      <main>
        <h1>A heading</h1>
        <p style={{ color: '#000000', background: '#ffffff' }}>Readable text.</p>
        <img src="data:," alt="A description" />
      </main>,
    );

    await expectNoAxeViolations(container);
  });

  it('fails a fixture with a known violation', async () => {
    const { container } = render(
      <main>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- the missing alt IS the fixture */}
        <img src="data:," />
      </main>,
    );

    await expect(expectNoAxeViolations(container)).rejects.toThrow(/image-alt/);
  });

  it('runs color-contrast, the rule that cannot run in jsdom', async () => {
    const { container } = render(
      <main>
        <p style={{ color: '#777777', background: '#888888' }}>Illegible text.</p>
      </main>,
    );

    const results = await runAxe(container);
    const contrast = results.violations.find((v) => v.id === 'color-contrast');

    // Not merely "some violation": this rule specifically. In jsdom it resolves
    // to `incomplete` and reports nothing, which is indistinguishable from a pass.
    expect(contrast).toBeDefined();
  });
});
