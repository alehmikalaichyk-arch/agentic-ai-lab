/**
 * Unit tests for the ban-raw-hex-values ESLint rule.
 *
 * Run with: node eslint-rules/ban-raw-hex-values.test.js
 * Also picked up by: vitest run  (glob includes eslint-rules/*.test.js)
 *
 * Uses ESLint RuleTester — throws on failure, so no extra test framework needed.
 * Mirror of ban-primitive-typography-classes.test.js structure.
 *
 * Filename in RuleTester cases is set to a src/components/ path so that
 * path-aware tooling can verify the rule would fire in the correct scope.
 * The rule itself does not gate on filename — scope is controlled by .eslintrc.js.
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('./ban-raw-hex-values');

const tester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
});

tester.run('ds/ban-raw-hex-values', rule, {
  // -----------------------------------------------------------------------
  // VALID — must produce zero errors
  // -----------------------------------------------------------------------
  valid: [
    // AC: PASS — DS token Tailwind utility (not a raw hex)
    {
      name: 'DS token utility bg-surface-page — no error',
      filename: 'src/components/button/button.tsx',
      code: '<div className="bg-surface-page text-fg-link" />',
    },

    // AC: PASS — non-hex string JSX prop
    {
      name: 'non-hex string JSX prop — no error',
      filename: 'src/components/button/button.tsx',
      code: '<div aria-label="submit" />',
    },

    // AC: PASS — waiver comment suppresses raw hex in Tailwind arbitrary class
    {
      name: 'waiver comment on className with arbitrary hex — no error',
      filename: 'src/components/chart/chart.tsx',
      code: '<div className="fill-[#F28E2A]" /* no-token: chart-orange-500; no fg semantic equivalent */ />',
    },

    // AC: PASS — waiver comment suppresses raw hex in JSX prop
    {
      name: 'waiver comment on hex JSX prop — no error',
      filename: 'src/components/chart/chart.tsx',
      code: '<circle fill="#F28E2A" /* no-token: chart-orange-500 */ />',
    },

    // AC: PASS — waiver comment suppresses raw hex in inline style
    {
      name: 'waiver comment on inline style hex — no error',
      filename: 'src/components/chart/chart.tsx',
      code: '<div style={{ color: "#04639A" /* no-token: fg-link override */ }} />',
    },

    // AC: PASS — standard non-hex Tailwind utilities
    {
      name: 'standard Tailwind color utilities — no error',
      filename: 'src/components/badge/badge.tsx',
      code: '<span className="bg-red-500 text-white border-gray-200" />',
    },

    // AC: PASS — layout arbitrary values (w-[300px] is not a hex value)
    {
      name: 'layout arbitrary values — no error',
      filename: 'src/components/layout/layout.tsx',
      code: '<div className="w-[300px] min-h-[40px] gap-1.5" />',
    },

    // AC: PASS — inline style with non-hex string value
    {
      name: 'inline style with non-hex string — no error',
      filename: 'src/components/layout/layout.tsx',
      code: '<div style={{ padding: "8px", background: "transparent" }} />',
    },

    // AC: PASS — spread style object is not inspected (static analysis boundary).
    // The rule intentionally does not descend into spread elements because
    // the referenced variable's value is not statically known at lint time.
    {
      name: 'style spread object — not inspected, no error',
      filename: 'src/components/layout/layout.tsx',
      code: '<div style={{ ...colorStyles }} />',
    },
  ],

  // -----------------------------------------------------------------------
  // INVALID — must produce errors
  // -----------------------------------------------------------------------
  invalid: [
    // AC: FAIL — bg-[#04639A] arbitrary hex in Tailwind class
    {
      name: 'bg-[#04639A] arbitrary hex in className — error',
      filename: 'src/components/button/button.tsx',
      code: '<div className="bg-[#04639A]" />',
      errors: [{ messageId: 'rawHexInClass', data: { token: 'bg-[#04639A]' } }],
    },

    // AC: FAIL — text-[#FFF] 3-digit hex in Tailwind class
    {
      name: 'text-[#FFF] 3-digit hex in className — error',
      filename: 'src/components/badge/badge.tsx',
      code: '<div className="text-[#FFF]" />',
      errors: [{ messageId: 'rawHexInClass', data: { token: 'text-[#FFF]' } }],
    },

    // AC: FAIL — 8-digit hex with alpha channel in Tailwind class
    {
      name: 'bg-[#04639A80] 8-digit hex in className — error',
      filename: 'src/components/overlay/overlay.tsx',
      code: '<div className="bg-[#04639A80]" />',
      errors: [{ messageId: 'rawHexInClass', data: { token: 'bg-[#04639A80]' } }],
    },

    // AC: FAIL — raw hex as JSX prop string value
    {
      name: '"#04639A" as JSX prop string value — error',
      filename: 'src/components/icon/icon.tsx',
      code: '<path fill="#04639A" />',
      errors: [{ messageId: 'rawHexInProp', data: { value: '#04639A' } }],
    },

    // AC: FAIL — raw hex in JSX expression container prop
    {
      name: '{"#04639A"} as JSX prop expression — error',
      filename: 'src/components/icon/icon.tsx',
      code: '<path fill={"#04639A"} />',
      errors: [{ messageId: 'rawHexInProp', data: { value: '#04639A' } }],
    },

    // AC: FAIL — raw hex in inline style object
    {
      name: 'style={{ color: "#04639A" }} — error',
      filename: 'src/components/text/text.tsx',
      code: '<div style={{ color: "#04639A" }} />',
      errors: [{ messageId: 'rawHexInStyle', data: { value: '#04639A' } }],
    },

    // AC: FAIL — mixed className with hex and valid DS token classes
    {
      name: 'mixed className with hex arbitrary alongside valid classes — error on hex token',
      filename: 'src/components/button/button.tsx',
      code: '<div className="rounded-md bg-[#04639A] text-white" />',
      errors: [{ messageId: 'rawHexInClass', data: { token: 'bg-[#04639A]' } }],
    },

    // AC: FAIL — 3-digit shorthand hex as JSX prop
    {
      name: '"#FFF" 3-digit hex JSX prop — error',
      filename: 'src/components/divider/divider.tsx',
      code: '<hr color="#FFF" />',
      errors: [{ messageId: 'rawHexInProp', data: { value: '#FFF' } }],
    },

    // AC: FAIL — raw hex in JSXExpressionContainer className string literal
    {
      name: 'className={"bg-[#04639A]"} expression container string — error',
      filename: 'src/components/button/button.tsx',
      code: '<div className={"bg-[#04639A] text-white"} />',
      errors: [{ messageId: 'rawHexInClass', data: { token: 'bg-[#04639A]' } }],
    },

    // AC: FAIL — raw hex inside a TemplateLiteral className
    {
      name: 'className={`bg-[#04639A]`} template literal — error',
      filename: 'src/components/button/button.tsx',
      code: '<div className={`bg-[#04639A] rounded-md`} />',
      errors: [{ messageId: 'rawHexInClass', data: { token: 'bg-[#04639A]' } }],
    },

    // AC: FAIL — raw hex inside cn() CallExpression argument
    {
      name: 'className={cn("bg-[#2D3342]")} CallExpression arg — error',
      filename: 'src/components/tooltip/tooltip.tsx',
      code: '<div className={cn("bg-[#2D3342] text-white", "rounded-md")} />',
      errors: [{ messageId: 'rawHexInClass', data: { token: 'bg-[#2D3342]' } }],
    },
  ],
});

console.log('All ban-raw-hex-values tests passed.');
