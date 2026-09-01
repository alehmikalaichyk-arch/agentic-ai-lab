/**
 * Unit tests for the ban-primitive-typography-classes ESLint rule.
 *
 * Run with: node eslint-rules/ban-primitive-typography-classes.test.js
 * (No test framework required — uses Node's built-in assert.)
 *
 * Each test case uses ESLint's RuleTester to verify exact pass/fail behaviour.
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('./ban-primitive-typography-classes');

const tester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
});

tester.run('ds/ban-primitive-typography-classes', rule, {
  // -----------------------------------------------------------------------
  // VALID — must produce zero warnings
  // -----------------------------------------------------------------------
  valid: [
    // AC: PASS — composite font token class only
    {
      name: 'composite font token class only',
      code: '<div className="font-body-sm-default" />',
    },
    // AC: PASS — composite font token + other safe utilities
    {
      name: 'composite font token + non-typography utilities',
      code: '<div className="font-heading-xl-emphasis text-white bg-primary px-4" />',
    },
    // AC: PASS — layout arbitrary values must NOT be flagged
    {
      name: 'layout arbitrary values: w, min-h, gap',
      code: '<div className="w-[300px] min-h-[40px] gap-1.5" />',
    },
    // AC: PASS — color utilities must NOT be flagged
    {
      name: 'text color utilities',
      code: '<div className="text-red-500 text-primary text-white" />',
    },
    // AC: PASS — empty className
    {
      name: 'empty className string',
      code: '<div className="" />',
    },
    // AC: PASS — standard spacing / layout utilities
    {
      name: 'spacing and layout utilities',
      code: '<div className="p-4 m-2 flex items-center justify-between rounded-md border" />',
    },
    // AC: PASS — style attribute without typography props
    {
      name: 'inline style without typography props',
      code: '<div style={{ color: "red", padding: "8px" }} />',
    },
    // AC: PASS — font-bold is NOT in the banned set (only light/medium/semibold)
    {
      name: 'font-bold is allowed (not in ban list)',
      code: '<div className="font-bold" />',
    },
    // AC: PASS — arbitrary non-typography values like z-[100], opacity-[0.5]
    {
      name: 'non-typography arbitrary values',
      code: '<div className="z-[100] opacity-[0.5] rotate-[45deg]" />',
    },
  ],

  // -----------------------------------------------------------------------
  // INVALID — must produce warnings
  // -----------------------------------------------------------------------
  invalid: [
    // AC: FAIL — named font-size utilities
    {
      name: 'text-sm triggers warning',
      code: '<div className="text-sm" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'text-sm' } }],
    },
    {
      name: 'text-xs triggers warning',
      code: '<div className="text-xs" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'text-xs' } }],
    },
    {
      name: 'text-base triggers warning',
      code: '<div className="text-base" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'text-base' } }],
    },
    {
      name: 'text-lg triggers warning',
      code: '<div className="text-lg" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'text-lg' } }],
    },
    {
      name: 'text-2xl triggers warning',
      code: '<div className="text-2xl" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'text-2xl' } }],
    },

    // AC: FAIL — text-sm + font-light combination (2 warnings on same node)
    {
      name: 'text-sm font-light triggers 2 warnings',
      code: '<div className="text-sm font-light" />',
      errors: [
        { messageId: 'bannedClass', data: { token: 'text-sm' } },
        { messageId: 'bannedClass', data: { token: 'font-light' } },
      ],
    },

    // AC: FAIL — standalone weight utilities
    {
      name: 'font-medium triggers warning',
      code: '<div className="font-medium" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'font-medium' } }],
    },
    {
      name: 'font-semibold triggers warning',
      code: '<div className="font-semibold" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'font-semibold' } }],
    },
    {
      name: 'font-light triggers warning',
      code: '<div className="font-light" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'font-light' } }],
    },

    // AC: FAIL — leading alongside composite token (composite token must NOT trigger)
    {
      name: 'font-body-sm-default + leading-6 — only leading-6 triggers',
      code: '<div className="font-body-sm-default leading-6" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'leading-6' } }],
    },

    // AC: FAIL — line-height keyword utilities
    {
      name: 'leading-none triggers warning',
      code: '<div className="leading-none" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'leading-none' } }],
    },
    {
      name: 'leading-tight triggers warning',
      code: '<div className="leading-tight" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'leading-tight' } }],
    },
    {
      name: 'leading-normal triggers warning',
      code: '<div className="leading-normal" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'leading-normal' } }],
    },

    // AC: FAIL — numeric leading utilities (leading-3 through leading-10)
    {
      name: 'leading-3 triggers warning',
      code: '<div className="leading-3" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'leading-3' } }],
    },
    {
      name: 'leading-10 triggers warning',
      code: '<div className="leading-10" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'leading-10' } }],
    },

    // AC: FAIL — arbitrary font-size values
    {
      name: 'text-[14px] arbitrary font-size triggers warning',
      code: '<div className="text-[14px]" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'text-[14px]' } }],
    },
    {
      name: 'text-[0.875rem] arbitrary font-size triggers warning',
      code: '<div className="text-[0.875rem]" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'text-[0.875rem]' } }],
    },
    {
      name: 'text-[1.75rem] (DS-mapped display size) triggers warning',
      code: '<div className="text-[1.75rem]" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'text-[1.75rem]' } }],
    },

    // AC: FAIL — arbitrary leading values
    {
      name: 'leading-[1.5] arbitrary line-height triggers warning',
      code: '<div className="leading-[1.5]" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'leading-[1.5]' } }],
    },
    {
      name: 'leading-[24px] arbitrary line-height triggers warning',
      code: '<div className="leading-[24px]" />',
      errors: [{ messageId: 'bannedClass', data: { token: 'leading-[24px]' } }],
    },

    // AC: FAIL — inline style font properties
    {
      name: 'inline style fontSize triggers warning',
      code: '<div style={{ fontSize: "14px" }} />',
      errors: [{ messageId: 'bannedStyleProp', data: { prop: 'fontSize' } }],
    },
    {
      name: 'inline style fontWeight triggers warning',
      code: '<div style={{ fontWeight: 500 }} />',
      errors: [{ messageId: 'bannedStyleProp', data: { prop: 'fontWeight' } }],
    },
    {
      name: 'inline style lineHeight triggers warning',
      code: '<div style={{ lineHeight: 1.5 }} />',
      errors: [{ messageId: 'bannedStyleProp', data: { prop: 'lineHeight' } }],
    },
    {
      name: 'inline style fontFamily triggers warning',
      code: '<div style={{ fontFamily: "Arial" }} />',
      errors: [{ messageId: 'bannedStyleProp', data: { prop: 'fontFamily' } }],
    },

    // AC: FAIL — className with JSX expression container (string literal in {})
    {
      name: 'className={"text-sm"} triggers warning',
      code: '<div className={"text-sm"} />',
      errors: [{ messageId: 'bannedClass', data: { token: 'text-sm' } }],
    },

    // AC: FAIL — template literal parts
    {
      name: 'className={`text-sm px-4`} triggers warning',
      code: '<div className={`text-sm px-4`} />',
      errors: [{ messageId: 'bannedClass', data: { token: 'text-sm' } }],
    },
  ],
});

console.log('All ban-primitive-typography-classes tests passed.');
