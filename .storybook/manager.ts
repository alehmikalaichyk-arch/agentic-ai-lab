import { addons } from '@storybook/manager-api';

import theme from './theme';

/*
 * The manager is Storybook's chrome — sidebar, toolbar, the shell around the preview
 * iframe. It is configured separately from `preview.ts` because it renders in a
 * different document; see the note in ./theme.ts about why the theme carries literal
 * colours rather than token references.
 */
addons.setConfig({
  theme,
  sidebar: {
    // Top-level entries render as sections rather than collapsible folders, so the
    // four tiers read as headings. The distinction between them is the point of the
    // sidebar here, and a folder icon makes them look interchangeable.
    showRoots: true,
  },
});
