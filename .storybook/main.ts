import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // Component stories and visual drafts both. The draft directory is deliberately
  // outside src/, so the diff classifier never mistakes a draft for component source
  // — but Storybook still has to render it, which is the whole point of stage #4.5.
  stories: [
    '../src/**/*.stories.@(ts|tsx)',
    // Visual drafts of a single component, stage #4.5 — outside the classified paths
    // so a draft never reclassifies a spec PR.
    '../component-prototypes/**/*.stories.@(ts|tsx)',
    // Whole-screen prototypes. A different thing from a draft: no spec, no gates, and
    // deliberately disposable. They share this Storybook so a prototype sits next to
    // the tokens it uses, which is where its colour decisions can be checked.
    '../prototypes/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
};

export default config;
