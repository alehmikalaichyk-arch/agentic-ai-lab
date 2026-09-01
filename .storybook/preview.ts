import type { Preview } from '@storybook/react';
import '../src/styles.css';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    a11y: {
      // Findings surface in the panel rather than failing the run. The blocking
      // accessibility pass is stage #7, which reads the spec's a11y contract; this
      // addon is the cheap continuous signal next to it, not a replacement.
      //
      // Nothing in this repository can turn a panel finding red, and that is
      // deliberate rather than an oversight: the scan that CAN fail is the
      // axe-core harness in src/a11y-test-utils.ts, run in the `browser` vitest
      // project. Do not reach for 'error' here expecting a gate — it would need a
      // separate Storybook runner this repository does not have.
      test: 'todo',
    },
  },
};

export default preview;
