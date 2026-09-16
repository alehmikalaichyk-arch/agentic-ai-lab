import type { Preview } from '@storybook/react';
import '../src/styles.css';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },

    /*
     * Sidebar order, declared rather than alphabetical.
     *
     * Alphabetical puts Components after Foundations and Prototypes before Staging by
     * accident, which reads as a ranking nobody chose. The order below is the one
     * argument this Storybook makes: start at the introduction, then the tokens
     * everything is built from, then the governed components, then the staged ones
     * that are explicitly not governed, then the throwaway screens.
     *
     * Anything not named here sorts after, alphabetically.
     */
    options: {
      storySort: {
        // A nested array orders the entry above it. Two nestings are load-bearing:
        //
        //   Components › Input › Showcase first. The documentation page and the 19
        //   stage-#6 stories share the title `Components/Input` from two files; this
        //   line puts the page above the harness. Without it Showcase sorts LAST,
        //   because stories otherwise keep file-load order.
        //
        //   Staging › Catalogue first, so the browse-everything pages precede the 30
        //   per-component ones.
        //
        // `includeNames` is what makes the first nesting work at all. Without it
        // Storybook's comparator returns 0 for any two stories with the same title and
        // never looks at their names, so `['Showcase', '*']` is silently ignored. With
        // it, stories not named in an order list still compare equal and keep their
        // file order — nothing else in the sidebar moves.
        includeNames: true,
        order: [
          'Introduction',
          'Foundations',
          'Components',
          ['Input', ['Showcase', '*']],
          'Staging',
          ['Catalogue', '*'],
          'Prototypes',
        ],
      },
    },

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
