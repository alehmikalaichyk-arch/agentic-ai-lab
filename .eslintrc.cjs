/* eslint-env node */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
  plugins: ['@typescript-eslint', 'jsx-a11y', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  env: { browser: true, es2022: true },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  ignorePatterns: [
    'generated/',
    'storybook-static/',
    'node_modules/',
    // Unmodified shadcn registry source. Excluded for the same reason the tier has no
    // specs, tests or stories: it is explicitly outside the quality floor until a
    // component is promoted. See src/ui-staging/README.md.
    //
    // The findings are real, not spurious — jsx-a11y flags 3 of them today
    // (pagination's empty anchor, and a non-interactive element carrying a click
    // handler). Fixing them here would mean editing registry files, which forfeits the
    // ability to re-pull a component on a registry update. They are left standing.
    //
    // This is a deferral with a definite end: promotion moves the file to
    // src/components/ui/, which IS linted, so the errors become blocking exactly when
    // the component starts claiming to be part of the design system.
    'src/ui-staging/',
  ],
};
