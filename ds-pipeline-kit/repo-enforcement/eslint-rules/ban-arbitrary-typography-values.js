/**
 * ESLint rule: ban-arbitrary-typography-values
 *
 * Errors when Tailwind arbitrary-value font-size utilities use pixel values
 * that have a DS token equivalent with a standard Tailwind utility (e.g. text-xs,
 * text-sm, text-base …) in JSX/TSX source under src/components/**.
 *
 * Rem-based arbitrary values (text-[1.75rem], text-[2rem], text-[2.375rem],
 * text-[4rem]) are ALLOWED because the integer-px regex /\btext-\[(\d+)px\]/
 * never matches them — they pass through naturally without any explicit allowlist.
 *
 * Banned px sizes (have a DS token and a standard Tailwind utility or DS-correct
 * rem form — pixel form is always wrong):
 *   text-[12px]  → text-xs
 *   text-[14px]  → text-sm
 *   text-[16px]  → text-base
 *   text-[18px]  → text-lg
 *   text-[20px]  → text-xl
 *   text-[24px]  → text-2xl
 *   text-[28px]  → text-[1.75rem]  (Tailwind default is 30px, not 28px)
 *   text-[32px]  → text-[2rem]     (Tailwind default is 36px, not 32px)
 *   text-[38px]  → text-[2.375rem] (no Tailwind match)
 *   text-[64px]  → text-[4rem]     (no Tailwind match)
 *
 * Note: text-[10px] (font-size.xxs) is intentionally NOT banned here.
 * Per .claude/rules/screen-implementation.md it is "NOT RECOMMENDED — only when
 * spec explicitly requires it", i.e. it is permitted. There is no standard Tailwind
 * utility for 10px either, so banning it would produce no actionable replacement.
 *
 * Detection covers:
 *   - className as a direct Literal:            className="text-[14px]"
 *   - className as a JSXExpressionContainer:
 *       • Literal:                              className={"text-[14px]"}
 *       • TemplateLiteral:                      className={`text-[14px]`}
 *       • CallExpression (cn(), clsx(), etc.):  className={cn("text-[14px]", "font-medium")}
 *         — walks all Literal and TemplateLiteral arguments recursively
 *
 * Waiver: if the source line contains "no-token:" the report is suppressed.
 *
 * Scope: activated only for src/components/**\/*.{ts,tsx} via .eslintrc.js
 * override block; the rule itself performs no filename-based gating.
 *
 * Note: this rule is ADDITIVE to ban-primitive-typography-classes.
 * The existing ban-primitive-typography-classes rule has excludedFiles: ['src/**']
 * and is NOT touched by this rule. Both rules co-exist without double-reporting
 * because ban-primitive-typography-classes is excluded from src/** while this rule
 * is scoped to src/components/** only.
 *
 * meta.type: 'problem'
 * meta.fixable: omitted (detection only)
 */

'use strict';

// ---------------------------------------------------------------------------
// Pixel sizes that are banned (have a DS token with a standard Tailwind utility
// OR have a DS-correct rem arbitrary form — pixel form is always wrong)
// ---------------------------------------------------------------------------

/**
 * Set of pixel sizes (as integers) that are banned.
 * Derived from the DS typography token table in .claude/rules/screen-implementation.md.
 *
 * Sizes with a standard Tailwind utility:
 *   12 → text-xs
 *   14 → text-sm
 *   16 → text-base
 *   18 → text-lg
 *   20 → text-xl
 *   24 → text-2xl
 *
 * Sizes without a standard Tailwind utility (use rem arbitrary form instead):
 *   28 → text-[1.75rem]  (NOT text-[28px])
 *   32 → text-[2rem]     (NOT text-[32px])
 *   38 → text-[2.375rem] (NOT text-[38px])
 *   64 → text-[4rem]     (NOT text-[64px])
 *
 * 10 is intentionally excluded — text-[10px] (font-size.xxs) is permitted when a
 * spec explicitly requires it, and there is no standard Tailwind utility for 10px.
 */
const BANNED_PX_SIZES = new Set([12, 14, 16, 18, 20, 24, 28, 32, 38, 64]);

// ---------------------------------------------------------------------------
// Pattern
// ---------------------------------------------------------------------------

/**
 * Matches a Tailwind arbitrary font-size utility using integer pixel values.
 * Captures the numeric pixel value for lookup in BANNED_PX_SIZES.
 *
 * Examples that match:   text-[13px]  text-[14px]  text-[12px]
 * Examples that don't:   text-[1.75rem]  text-sm  text-red-500  text-[10px]
 *                        (text-[1.75rem] doesn't match because (\d+) requires
 *                         an integer — no decimal point, no "rem" suffix)
 */
const ARBITRARY_PX_FONT_SIZE_RE = /\btext-\[(\d+)px\]/;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Return true if the ESLint source-code line for the given node contains
 * the waiver substring "no-token:".
 */
function hasWaiver(context, node) {
  const sourceCode = context.getSourceCode ? context.getSourceCode() : context.sourceCode;
  const src = sourceCode.getText();
  const lines = src.split('\n');
  // node.loc.start.line is 1-based
  const lineIdx = node.loc.start.line - 1;
  const line = lines[lineIdx] || '';
  return line.includes('no-token:');
}

/**
 * Scan a string value for banned arbitrary px font-size tokens.
 * Returns the first offending token string, or null if clean.
 */
function findBannedPxFontSize(str) {
  const tokens = str.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    const match = ARBITRARY_PX_FONT_SIZE_RE.exec(token);
    if (match) {
      const px = parseInt(match[1], 10);
      if (BANNED_PX_SIZES.has(px)) return token;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Rule definition
// ---------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ban arbitrary px font-size Tailwind utilities where DS token equivalents exist; use standard utilities (text-sm, text-xs …) or DS-correct rem form (text-[1.75rem]) instead',
      category: 'Design System',
      recommended: false,
      url: 'https://github.com/-inc/design-tokens/blob/main/eslint-rules/ban-arbitrary-typography-values.js',
    },
    schema: [],
    messages: {
      bannedPxFontSize:
        'Arbitrary px font-size "{{token}}" is banned. Use the DS token equivalent: text-xs (12px), text-sm (14px), text-base (16px), text-lg (18px), text-xl (20px), text-2xl (24px), or the DS-correct rem form text-[1.75rem] (28px), text-[2rem] (32px), text-[2.375rem] (38px), text-[4rem] (64px). Add /* no-token: <reason> */ if no token exists.',
    },
  },

  create(context) {
    // -----------------------------------------------------------------------
    // Check a className string value for banned px font-size tokens
    // -----------------------------------------------------------------------
    function checkClassNameString(attrNode, strValue) {
      if (hasWaiver(context, attrNode)) return;
      const badToken = findBannedPxFontSize(strValue);
      if (badToken) {
        context.report({
          node: attrNode,
          messageId: 'bannedPxFontSize',
          data: { token: badToken },
        });
      }
    }

    /**
     * Walk a CallExpression (e.g. cn("...", "...")) and check every
     * Literal string argument and every TemplateLiteral quasi for banned
     * px font-size utilities.  Handles nested calls via recursion.
     */
    function checkCallExpression(attrNode, callExpr) {
      for (const arg of callExpr.arguments) {
        if (arg.type === 'Literal' && typeof arg.value === 'string') {
          checkClassNameString(attrNode, arg.value);
        } else if (arg.type === 'TemplateLiteral') {
          for (const quasi of arg.quasis) {
            checkClassNameString(attrNode, quasi.value.cooked || quasi.value.raw);
          }
        } else if (arg.type === 'CallExpression') {
          checkCallExpression(attrNode, arg);
        }
      }
    }

    // -----------------------------------------------------------------------
    // Visitor
    // -----------------------------------------------------------------------
    return {
      JSXAttribute(node) {
        const attrName =
          node.name &&
          (node.name.name ||
            (node.name.type === 'JSXNamespacedName' ? node.name.name.name : null));

        if (attrName !== 'className') return;

        const value = node.value;
        if (!value) return;

        if (value.type === 'Literal' && typeof value.value === 'string') {
          checkClassNameString(node, value.value);
        } else if (value.type === 'JSXExpressionContainer') {
          const expr = value.expression;
          if (expr.type === 'Literal' && typeof expr.value === 'string') {
            checkClassNameString(node, expr.value);
          } else if (expr.type === 'TemplateLiteral') {
            for (const quasi of expr.quasis) {
              checkClassNameString(node, quasi.value.cooked || quasi.value.raw);
            }
          } else if (expr.type === 'CallExpression') {
            // Handles cn(...), clsx(...), and any other utility function
            checkCallExpression(node, expr);
          }
        }
      },
    };
  },
};
