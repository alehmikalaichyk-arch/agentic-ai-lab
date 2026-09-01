/*
 * Setup for the `browser` vitest project only. The jsdom project uses
 * ./test-setup.ts and must not load this file.
 *
 * The stylesheet import is the reason this file exists separately. A browser
 * test measures a rendered box; a box is only worth measuring if the utility
 * classes that size it have resolved. Loading the same stylesheet Storybook
 * loads is what makes `h-16` sixty-four pixels here rather than nothing.
 */
import '@testing-library/jest-dom/vitest';
import './styles.css';
