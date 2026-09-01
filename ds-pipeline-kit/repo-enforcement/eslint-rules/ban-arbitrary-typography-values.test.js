/**
 * Unit tests for the ban-arbitrary-typography-values ESLint rule.
 *
 * Run with: node eslint-rules/ban-arbitrary-typography-values.test.js
 * Also picked up by: vitest run  (glob includes eslint-rules/*.test.js)
 *
 * Uses ESLint RuleTester — throws on failure, so no extra test framework needed.
 * Mirror of ban-primitive-typography-classes.test.js structure.
 *
 * Note: this rule does NOT conflict with ban-primitive-typography-classes.
 * ban-primitive-typography-classes has excludedFiles: ['src/**'] and is not
 * active for src/components/**. ban-arbitrary-typography-values targets only
 * src/components/** — the two rules operate on disjoint file sets.
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('./ban-arbitrary-typography-values');

const tester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
});

tester.run('ds/ban-arbitrary-typography-values', rule, {
  // -----------------------------------------------------------------------
  // VALID — must produce zero errors
  // -----------------------------------------------------------------------
  valid: [
    // AC: PASS — standard Tailwind font-size utility (not an arbitrary px)
    {
      name: 'text-sm standard Tailwind utility — no error',
      filename: 'src/components/button/button.tsx',
      code: '<span className="text-sm font-medium" />',
    },

    // AC: PASS — text-xs standard utility
    {
      name: 'text-xs standard utility — no error',
      filename: 'src/components/badge/badge.tsx',
      code: '<span className="text-xs uppercase tracking-wide" />',
    },

    // AC: PASS — text-base (16px) standard utility
    {
      name: 'text-base standard utility — no error',
      filename: 'src/components/text/text.tsx',
      code: '<p className="text-base leading-6" />',
    },

    // AC: PASS — text-[1.75rem] DS-correct rem form for 28px (font-size.3xl).
    // Passes because the detection regex /\btext-\[(\d+)px\]/ requires an integer
    // followed by "px" — it never matches rem values. This tests the regex boundary,
    // not an allowlist skip.
    {
      name: 'text-[1.75rem] DS-correct rem arbitrary — no error (regex miss, not allowlist)',
      filename: 'src/components/heading/heading.tsx',
      code: '<h2 className="text-[1.75rem] font-semibold" />',
    },

    // AC: PASS — text-[2rem] DS-correct rem form for 32px (font-size.4xl).
    // Same reason: integer-px regex does not match rem values.
    {
      name: 'text-[2rem] DS-correct rem arbitrary — no error (regex miss, not allowlist)',
      filename: 'src/components/heading/heading.tsx',
      code: '<h1 className="text-[2rem] font-semibold" />',
    },

    // AC: PASS — text-[2.375rem] DS-correct rem form for 38px (font-size.5xl).
    // Same reason: regex miss.
    {
      name: 'text-[2.375rem] DS-correct rem arbitrary — no error (regex miss, not allowlist)',
      filename: 'src/components/hero/hero.tsx',
      code: '<h1 className="text-[2.375rem]" />',
    },

    // AC: PASS — text-[4rem] DS-correct rem form for 64px (font-size.6xl).
    // Same reason: regex miss.
    {
      name: 'text-[4rem] DS-correct rem arbitrary — no error (regex miss, not allowlist)',
      filename: 'src/components/hero/hero.tsx',
      code: '<span className="text-[4rem]" />',
    },

    // AC: PASS — waiver comment suppresses banned px font-size
    {
      name: 'waiver comment on text-[13px] — no error',
      filename: 'src/components/chart/chart.tsx',
      code: '<span className="text-[13px]" /* no-token: 13px spec-specific; no DS token */ />',
    },

    // AC: PASS — waiver on text-[11px]
    {
      name: 'waiver comment on text-[11px] — no error',
      filename: 'src/components/chart/chart.tsx',
      code: '<text className="text-[11px]" /* no-token: 11px chart axis label */ />',
    },

    // AC: PASS — layout arbitrary value (w-[300px]) is not a font-size utility
    {
      name: 'w-[300px] layout arbitrary value — no error',
      filename: 'src/components/sidebar/sidebar.tsx',
      code: '<aside className="w-[300px] h-full" />',
    },

    // AC: PASS — text-2xl (24px) standard utility
    {
      name: 'text-2xl standard utility — no error',
      filename: 'src/components/heading/heading.tsx',
      code: '<h3 className="text-2xl font-bold" />',
    },

    // AC: PASS — text-[10px] (font-size.xxs) is permitted.
    // Per .claude/rules/screen-implementation.md it is "NOT RECOMMENDED — only when
    // spec explicitly requires it" but it is not banned. The rule does not include 10
    // in BANNED_PX_SIZES for this reason.
    {
      name: 'text-[10px] font-size.xxs — permitted (not in BANNED_PX_SIZES)',
      filename: 'src/components/caption/caption.tsx',
      code: '<small className="text-[10px]" />',
    },
  ],

  // -----------------------------------------------------------------------
  // INVALID — must produce errors
  // -----------------------------------------------------------------------
  invalid: [
    // AC: FAIL — text-[14px] (use text-sm)
    {
      name: 'text-[14px] (use text-sm) — error',
      filename: 'src/components/badge/badge.tsx',
      code: '<span className="text-[14px]" />',
      errors: [{ messageId: 'bannedPxFontSize', data: { token: 'text-[14px]' } }],
    },

    // AC: FAIL — text-[12px] (use text-xs)
    {
      name: 'text-[12px] (use text-xs) — error',
      filename: 'src/components/label/label.tsx',
      code: '<label className="text-[12px] font-medium" />',
      errors: [{ messageId: 'bannedPxFontSize', data: { token: 'text-[12px]' } }],
    },

    // AC: FAIL — text-[16px] (use text-base)
    {
      name: 'text-[16px] (use text-base) — error',
      filename: 'src/components/text/text.tsx',
      code: '<p className="text-[16px] leading-6" />',
      errors: [{ messageId: 'bannedPxFontSize', data: { token: 'text-[16px]' } }],
    },

    // AC: FAIL — text-[18px] (use text-lg)
    {
      name: 'text-[18px] (use text-lg) — error',
      filename: 'src/components/text/text.tsx',
      code: '<p className="text-[18px]" />',
      errors: [{ messageId: 'bannedPxFontSize', data: { token: 'text-[18px]' } }],
    },

    // AC: FAIL — text-[20px] (use text-xl)
    {
      name: 'text-[20px] (use text-xl) — error',
      filename: 'src/components/text/text.tsx',
      code: '<p className="text-[20px]" />',
      errors: [{ messageId: 'bannedPxFontSize', data: { token: 'text-[20px]' } }],
    },

    // AC: FAIL — text-[24px] (use text-2xl)
    {
      name: 'text-[24px] (use text-2xl) — error',
      filename: 'src/components/card/card.tsx',
      code: '<h4 className="text-[24px]" />',
      errors: [{ messageId: 'bannedPxFontSize', data: { token: 'text-[24px]' } }],
    },

    // AC: FAIL — text-[28px] (use text-[1.75rem] — DS-correct rem form)
    {
      name: 'text-[28px] (use text-[1.75rem] for font-size.3xl) — error',
      filename: 'src/components/heading/heading.tsx',
      code: '<h2 className="text-[28px]" />',
      errors: [{ messageId: 'bannedPxFontSize', data: { token: 'text-[28px]' } }],
    },

    // AC: FAIL — text-[32px] (use text-[2rem] — DS-correct rem form)
    {
      name: 'text-[32px] (use text-[2rem] for font-size.4xl) — error',
      filename: 'src/components/heading/heading.tsx',
      code: '<h1 className="text-[32px] font-bold" />',
      errors: [{ messageId: 'bannedPxFontSize', data: { token: 'text-[32px]' } }],
    },

    // AC: FAIL — text-[38px] (use text-[2.375rem] — DS-correct rem form)
    {
      name: 'text-[38px] (use text-[2.375rem] for font-size.5xl) — error',
      filename: 'src/components/hero/hero.tsx',
      code: '<h1 className="text-[38px]" />',
      errors: [{ messageId: 'bannedPxFontSize', data: { token: 'text-[38px]' } }],
    },

    // AC: FAIL — text-[64px] (use text-[4rem] — DS-correct rem form)
    {
      name: 'text-[64px] (use text-[4rem] for font-size.6xl) — error',
      filename: 'src/components/hero/hero.tsx',
      code: '<span className="text-[64px]" />',
      errors: [{ messageId: 'bannedPxFontSize', data: { token: 'text-[64px]' } }],
    },

    // AC: FAIL — mixed className: valid utility alongside banned px form
    {
      name: 'mixed className with px form alongside valid utility — error on banned token',
      filename: 'src/components/button/button.tsx',
      code: '<button className="font-semibold text-[14px] rounded-md" />',
      errors: [{ messageId: 'bannedPxFontSize', data: { token: 'text-[14px]' } }],
    },

    // AC: FAIL — banned px form inside JSXExpressionContainer string literal
    {
      name: 'className={"text-[14px]"} expression container string — error',
      filename: 'src/components/badge/badge.tsx',
      code: '<span className={"text-[14px] font-medium"} />',
      errors: [{ messageId: 'bannedPxFontSize', data: { token: 'text-[14px]' } }],
    },

    // AC: FAIL — banned px form inside a TemplateLiteral className
    {
      name: 'className={`text-[14px]`} template literal — error',
      filename: 'src/components/badge/badge.tsx',
      code: '<span className={`text-[14px] font-medium`} />',
      errors: [{ messageId: 'bannedPxFontSize', data: { token: 'text-[14px]' } }],
    },

    // AC: FAIL — banned px form inside cn() CallExpression argument
    {
      name: 'className={cn("text-[12px]")} CallExpression arg — error',
      filename: 'src/components/tooltip/tooltip.tsx',
      code: '<div className={cn("z-50 rounded px-3", "text-[12px] font-medium")} />',
      errors: [{ messageId: 'bannedPxFontSize', data: { token: 'text-[12px]' } }],
    },
  ],
});

console.log('All ban-arbitrary-typography-values tests passed.');
