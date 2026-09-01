/**
 * ESLint rule: ban-primitive-typography-classes
 *
 * Warns when primitive Tailwind typography utilities are used directly in JSX/TSX
 * className strings or inline style objects, instead of composite `font-*` tokens
 * from the  design system.
 *
 * Severity: warn (will flip to error after Wave-3 migration completes, feature-243).
 *
 * Allowlist: the DS package's own src/** — the DS source may use primitives.
 *
 * Banned patterns
 * ───────────────
 * 1. Named font-size utilities:   text-xs | text-sm | text-base | text-lg |
 *                                 text-xl | text-2xl | text-3xl | text-4xl
 * 2. Arbitrary font-size values:  text-[<length>] (px | rem | em | ch | ex | vw)
 * 3. Standalone weight utilities: font-light | font-medium | font-semibold
 * 4. Line-height utilities:       leading-{none|tight|snug|normal|relaxed|loose}
 *                                 leading-{3..10} | leading-[<value>]
 * 5. Inline style props:          fontSize | fontWeight | lineHeight | fontFamily
 *
 * Safe (no warning)
 * ─────────────────
 * - Composite font tokens:  font-body-sm-default, font-heading-xl-emphasis, …
 * - Layout arbitrary:       w-[300px], gap-1.5, min-h-[40px]  (non-typography)
 * - Standard color/spacing: text-red-500, text-primary, p-4, m-2, …
 *
 * Test cases
 * ──────────
 * PASS: className="font-body-sm-default"        → no warning
 * FAIL: className="text-sm font-light"          → 2 warnings (or 1 combined)
 * FAIL: className="font-body-sm-default leading-6" → 1 warning for leading-6
 * FAIL: style={{ fontSize: '14px' }}            → 1 warning
 */

'use strict';

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

/** Named Tailwind font-size scale utilities (text-<size>) that should be
 *  replaced with a composite font token. We deliberately exclude text-<color>
 *  and other non-scale utilities — those must NOT be flagged. */
const NAMED_FONT_SIZE_CLASSES = new Set([
  'text-xs',
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
]);

/** Standalone font-weight utilities that should come from the composite token. */
const NAMED_FONT_WEIGHT_CLASSES = new Set([
  'font-light',
  'font-medium',
  'font-semibold',
]);

/** Named line-height utilities (leading-<keyword>). */
const NAMED_LEADING_KEYWORD_CLASSES = new Set([
  'leading-none',
  'leading-tight',
  'leading-snug',
  'leading-normal',
  'leading-relaxed',
  'leading-loose',
]);

/** Numeric line-height utilities: leading-3 … leading-10. */
const NAMED_LEADING_NUMERIC_CLASSES = new Set(
  Array.from({ length: 8 }, (_, i) => `leading-${i + 3}`)
);

/**
 * Matches arbitrary font-size values: text-[<length>]
 * Length units: px, rem, em, ch, ex, vw, vh, %
 * Does NOT match layout arbitrary values like w-[300px] (different prefix).
 *
 * Examples that match:   text-[14px]  text-[0.875rem]  text-[1.75rem]
 * Examples that DON'T:   text-red-500  text-primary  text-[color]
 */
const ARBITRARY_FONT_SIZE_RE = /\btext-\[[^\]]*?(?:\d+(?:\.\d+)?(?:px|rem|em|ch|ex|vw|vh|%)|[0-9.]+(?:px|rem|em|ch|ex|vw|vh|%))[^\]]*?\]/g;

/**
 * Matches arbitrary leading values: leading-[<any>]
 * All arbitrary leading-[…] values are banned (not just lengths) because
 * there is no safe arbitrary leading value outside the token set.
 */
const ARBITRARY_LEADING_RE = /\bleading-\[[^\]]+\]/g;

/** Inline style object keys that represent typography primitives. */
const BANNED_STYLE_PROPS = new Set([
  'fontSize',
  'fontWeight',
  'lineHeight',
  'fontFamily',
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Split a className string into individual tokens (words), honouring arbitrary
 * value brackets so that `text-[14px]` is treated as a single token.
 *
 * Simple split on whitespace — arbitrary values don't contain whitespace,
 * so this is safe.
 */
function splitClassNames(value) {
  return value.split(/\s+/).filter(Boolean);
}

/**
 * Check a single class token and return the appropriate message, or null if safe.
 */
function checkClassToken(token) {
  if (NAMED_FONT_SIZE_CLASSES.has(token)) {
    return `Primitive font-size utility "${token}" is banned. Use a composite font token (e.g. "font-body-sm-default") instead.`;
  }
  if (NAMED_FONT_WEIGHT_CLASSES.has(token)) {
    return `Primitive font-weight utility "${token}" is banned. Use a composite font token instead.`;
  }
  if (NAMED_LEADING_KEYWORD_CLASSES.has(token) || NAMED_LEADING_NUMERIC_CLASSES.has(token)) {
    return `Primitive line-height utility "${token}" is banned. Use a composite font token instead.`;
  }
  if (/^text-\[/.test(token) && /(?:\d+(?:\.\d+)?(?:px|rem|em|ch|ex|vw|vh|%))/.test(token)) {
    return `Arbitrary font-size value "${token}" is banned. Use a composite font token instead.`;
  }
  if (/^leading-\[/.test(token)) {
    return `Arbitrary line-height value "${token}" is banned. Use a composite font token instead.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Rule definition
// ---------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Warn when primitive Tailwind typography utilities are used instead of composite font tokens',
      category: 'Design System',
      recommended: false,
      url: 'https://github.com/-inc/design-tokens/blob/main/eslint-rules/ban-primitive-typography-classes.js',
    },
    schema: [],
    messages: {
      bannedClass:
        'Primitive typography class "{{token}}" is banned. Use a composite font token (e.g. "font-body-sm-default") from the  design system.',
      bannedStyleProp:
        'Inline style property "{{prop}}" is banned for primitive typography values. Use a composite font token class instead.',
    },
  },

  create(context) {
    // -----------------------------------------------------------------------
    // Helper: report a banned class token at the given JSX attribute node
    // -----------------------------------------------------------------------
    function reportClass(node, token, message) {
      context.report({
        node,
        messageId: 'bannedClass',
        data: { token },
      });
    }

    // -----------------------------------------------------------------------
    // Check a string value for banned classes
    // -----------------------------------------------------------------------
    function checkStringValue(node, value) {
      const tokens = splitClassNames(value);
      for (const token of tokens) {
        const msg = checkClassToken(token);
        if (msg) {
          reportClass(node, token);
        }
      }
    }

    // -----------------------------------------------------------------------
    // Visit JSX attributes
    // -----------------------------------------------------------------------
    return {
      // Handle: className="some classes"
      // Handle: className={`some ${expr} classes`}
      // Handle: className={'some classes'}
      JSXAttribute(node) {
        const attrName =
          node.name && (node.name.name || (node.name.type === 'JSXNamespacedName' ? node.name.name.name : null));

        // --- className attribute ---
        if (attrName === 'className') {
          const value = node.value;
          if (!value) return;

          if (value.type === 'Literal' && typeof value.value === 'string') {
            // className="..."
            checkStringValue(node, value.value);
          } else if (value.type === 'JSXExpressionContainer') {
            const expr = value.expression;
            if (expr.type === 'Literal' && typeof expr.value === 'string') {
              // className={'...'}
              checkStringValue(node, expr.value);
            } else if (expr.type === 'TemplateLiteral') {
              // className={`... ${x} ...`} — check static quasis only
              for (const quasi of expr.quasis) {
                checkStringValue(node, quasi.value.cooked || quasi.value.raw);
              }
            }
          }
          return;
        }

        // --- style attribute ---
        if (attrName === 'style') {
          const value = node.value;
          if (!value) return;

          if (value.type === 'JSXExpressionContainer') {
            const expr = value.expression;
            if (expr.type === 'ObjectExpression') {
              for (const prop of expr.properties) {
                if (prop.type !== 'Property') continue;
                const key = prop.key;
                const propName =
                  key.type === 'Identifier'
                    ? key.name
                    : key.type === 'Literal'
                    ? String(key.value)
                    : null;
                if (propName && BANNED_STYLE_PROPS.has(propName)) {
                  context.report({
                    node: prop,
                    messageId: 'bannedStyleProp',
                    data: { prop: propName },
                  });
                }
              }
            }
          }
        }
      },
    };
  },
};
