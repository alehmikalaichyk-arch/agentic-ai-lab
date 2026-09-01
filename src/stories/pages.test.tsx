import { render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import accent from './accent-colours.stories';
import charts from './charts.stories';
import primitives from './primitives.stories';
import scales from './scales.stories';
import semantic from './tokens.stories';

/**
 * Every token page renders.
 *
 * `build-storybook` exits 0 whether or not a page throws at runtime — it compiles the
 * modules, it does not run them. So a page that crashes on a renamed token looks
 * exactly like a page that works, right up until someone opens it in the review the
 * page exists for.
 *
 * These pages are also derived entirely from the built tokens, which means a rename
 * in `tokens/` can empty one silently. Each assertion below therefore checks for real
 * content, not merely for the absence of a throw.
 */

const PAGES = [
  { title: 'Primitives', meta: primitives, mustMention: ['brand', 'neutral', 'chart-blue'] },
  { title: 'Semantic colours', meta: semantic, mustMention: ['fg-default', 'surface-default', 'outline-focus'] },
  { title: 'Accent colours', meta: accent, mustMention: ['red', 'blue', 'grey'] },
  { title: 'Charts', meta: charts, mustMention: ['chart-1', 'chart-5'] },
  { title: 'Scales', meta: scales, mustMention: ['spacing-unit', 'shadow-md', 'radius-md', 'z-index'] },
] as const;

describe.each(PAGES)('$title', ({ meta, mustMention }) => {
  const Component = meta.component as React.ComponentType;

  it('renders without throwing', () => {
    expect(() => render(<Component />)).not.toThrow();
  });

  it('renders real content rather than an empty shell', () => {
    const { container } = render(<Component />);
    // A page whose token list resolved to [] still renders its headings, so the
    // count of swatches is what actually distinguishes "working" from "empty".
    const text = container.textContent ?? '';
    expect(text.length).toBeGreaterThan(400);
    for (const needle of mustMention) {
      expect(text).toContain(needle);
    }
  });
});

describe('swatch labels sit outside the swatch', () => {
  // The label used to be rendered INSIDE the coloured tile, with its colour picked
  // by a luminance test. That fails at the dark end of every ramp — the darkest
  // steps were barely legible and the very darkest showed nothing at all. Asserted
  // structurally rather than visually, because a contrast calculation on the label
  // would just be the same broken idea a second time.
  it.each([
    ['Primitives', primitives],
    ['Accent colours', accent],
    ['Charts', charts],
  ])('%s renders no text inside a colour tile', (_title, meta) => {
    const { container } = render(React.createElement(meta.component as React.ComponentType));
    const tiles = [...container.querySelectorAll('[title]')];
    expect(tiles.length).toBeGreaterThan(10);
    const withText = tiles.filter((el) => (el.textContent ?? '').trim().length > 0);
    expect(withText.map((el) => el.getAttribute('title'))).toEqual([]);
  });

  it('and the label is still present, as a sibling below', () => {
    const { container } = render(React.createElement(primitives.component as React.ComponentType));
    const tile = container.querySelector('[title^="brand-500"]');
    expect(tile).not.toBeNull();
    const label = tile!.nextElementSibling;
    expect(label?.textContent).toContain('500');
  });
});

describe('the pages are driven by the built tokens, not by hand-written lists', () => {
  it('a token renamed in tokens/ would empty a page rather than go unnoticed', () => {
    const { container } = render(React.createElement(primitives.component as React.ComponentType));
    const swatchCount = container.querySelectorAll('[title]').length;
    // 9 palette families x 10 steps + 8 chart families x 3 is the current shape;
    // asserting a floor rather than the exact number keeps this from breaking every
    // time a step is added, while still catching a page that renders nothing.
    expect(swatchCount).toBeGreaterThan(100);
  });
});
