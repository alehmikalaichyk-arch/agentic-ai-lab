import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // Component stories and visual drafts both. The draft directory is deliberately
  // outside src/, so the diff classifier never mistakes a draft for component source
  // — but Storybook still has to render it, which is the whole point of stage #4.5.
  stories: [
    '../src/**/*.stories.@(ts|tsx)',
    '../component-prototypes/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
};

export default config;
