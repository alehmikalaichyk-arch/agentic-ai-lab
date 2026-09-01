import type { Preview } from '@storybook/react';
import '../src/styles.css';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    a11y: {
      // Findings surface in the panel rather than failing the run. The blocking
      // accessibility pass is stage #7, which reads the spec's a11y contract; this
      // addon is the cheap continuous signal next to it, not a replacement.
      test: 'todo',
    },
  },
};

export default preview;
