import { create } from '@storybook/theming';

/*
 * Storybook's own chrome, drawn from this design system's tokens.
 *
 * Why the values are literals and not `var(--ds-…)`:
 * the manager UI renders in a DIFFERENT document from the preview iframe. The
 * stylesheet that defines --ds-* is loaded into the preview only, so a var()
 * reference here resolves to nothing and Storybook silently falls back to its
 * defaults. These are copies, and copies drift — the token name is recorded next to
 * each one so a mismatch can be found by grep rather than by eye.
 *
 * Source: generated/tokens.css, read 2026-09-22 (brand moved to oslo-600 that day).
 */
export default create({
  base: 'light',

  brandTitle: 'Agentic AI Lab — Design System',
  brandUrl: 'https://github.com/alehmikalaichyk-arch/agentic-ai-lab',
  brandTarget: '_self',

  colorPrimary: '#04639A', // --ds-surface-brand-bold
  colorSecondary: '#04639A', // --ds-surface-brand-bold

  appBg: '#f7f9fc', // --ds-surface-page
  appContentBg: '#ffffff', // --ds-surface-default
  appPreviewBg: '#ffffff', // --ds-surface-default
  appBorderColor: '#e4e6ed', // --ds-outline-default
  appBorderRadius: 8,

  textColor: '#0d1119', // --ds-fg-default
  textMutedColor: '#51586b', // --ds-fg-subtle

  barTextColor: '#51586b', // --ds-fg-subtle
  barSelectedColor: '#04639A', // --ds-surface-brand-bold
  barHoverColor: '#04639A', // --ds-surface-brand-bold
  barBg: '#ffffff', // --ds-surface-default

  inputBg: '#ffffff', // --ds-surface-default
  inputBorder: '#e4e6ed', // --ds-outline-default
  inputTextColor: '#0d1119', // --ds-fg-default
  inputBorderRadius: 6,

  fontBase: "'Lexend Deca', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontCode: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
});
