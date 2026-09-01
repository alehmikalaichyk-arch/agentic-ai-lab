/**
 * ESLint rule: ban-raw-hex-values
 *
 * Errors when raw hex color strings appear in JSX/TSX source under
 * src/components/**:
 *   1. Tailwind arbitrary-value utilities: bg-[#04639A], text-[#FFF], etc.
 *   2. JSX prop string literals whose value IS a hex color: color="#04639A"
 *   3. Inline style object string values: style={{ color: '#04639A' }}
 *
 * Detection covers:
 *   - className as a direct Literal:            className="bg-[#04639A]"
 *   - className as a JSXExpressionContainer:
 *       • Literal:                              className={"bg-[#04639A]"}
 *       • TemplateLiteral:                      className={`bg-[#04639A]`}
 *       • CallExpression (cn(), clsx(), etc.):  className={cn("bg-[#04639A]", "text-sm")}
 *         — walks all Literal and TemplateLiteral arguments recursively
 *
 * Waiver: if the source line contains the substring "no-token:" the report
 * is suppressed — matches the /* no-token: <reason> * / comment convention
 * documented in .claude/rules/screen-implementation.md.
 *
 * Scope: activated only for src/components/**\/*.{ts,tsx} via .eslintrc.js
 * override; the rule itself performs no filename-based gating.
 *
 * meta.type: 'problem' (hard error — consumers must use DS token utilities)
 * meta.fixable: omitted (detection only, no auto-fix in this version)
 */

'use strict';

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

/**
 * Matches a Tailwind arbitrary-value utility containing a hex color.
 * Covers 3-digit (#FFF), 6-digit (#04639A) and 8-digit (#04639A80) hex.
 * Pattern: <word-chars>-[#<hexdigits>]
 *   e.g. bg-[#04639A]  text-[#FFF]  border-[#04639A80]
 */
const ARBITRARY_HEX_CLASS_RE = /\b[\w-]+-\[#[0-9A-Fa-f]{3,8}\]/;

/**
 * Matches a standalone hex color string value.
 * The string itself (after quote stripping) matches /^#[0-9A-Fa-f]{3,8}$/.
 */
const HEX_VALUE_RE = /^#[0-9A-Fa-f]{3,8}$/;

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
 * Scan a string value (a className string or similar) for Tailwind arbitrary
 * hex utilities.  Returns the first matching token, or null if clean.
 */
function findArbitraryHexInString(str) {
  const tokens = str.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (ARBITRARY_HEX_CLASS_RE.test(token)) return token;
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
        'Ban raw hex color values in className arbitrary utilities and JSX prop/style strings; use DS token Tailwind utilities instead',
      category: 'Design System',
      recommended: false,
      url: 'https://github.com/-inc/design-tokens/blob/main/eslint-rules/ban-raw-hex-values.js',
    },
    schema: [],
    messages: {
      rawHexInClass:
        'Raw hex color "{{token}}" is banned in Tailwind arbitrary class. Use a DS token utility (e.g. bg-surface-page, text-fg-link) or add /* no-token: <reason> */ if no token exists.',
      rawHexInProp:
        'Raw hex color "{{value}}" is banned as a JSX prop string value. Use a DS token utility or add /* no-token: <reason> */ if no token exists.',
      rawHexInStyle:
        'Raw hex color "{{value}}" is banned in inline style values. Use a DS token utility or add /* no-token: <reason> */ if no token exists.',
    },
  },

  create(context) {
    // -----------------------------------------------------------------------
    // Check a className string (literal or template quasi) for arbitrary hex
    // -----------------------------------------------------------------------
    function checkClassNameString(attrNode, strValue) {
      if (hasWaiver(context, attrNode)) return;
      const badToken = findArbitraryHexInString(strValue);
      if (badToken) {
        context.report({
          node: attrNode,
          messageId: 'rawHexInClass',
          data: { token: badToken },
        });
      }
    }

    /**
     * Walk a CallExpression (e.g. cn("...", "...")) and check every
     * Literal string argument and every TemplateLiteral quasi for arbitrary
     * hex utilities.  Handles nested calls (cn(cn("..."))) via recursion.
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

        const value = node.value;
        if (!value) return;

        // ----- className: scan for arbitrary hex utilities -----
        if (attrName === 'className') {
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
          return;
        }

        // ----- style: scan object property values for raw hex strings -----
        if (attrName === 'style') {
          if (value.type === 'JSXExpressionContainer') {
            const expr = value.expression;
            if (expr.type === 'ObjectExpression') {
              for (const prop of expr.properties) {
                if (prop.type !== 'Property') continue;
                const propValue = prop.value;
                if (
                  propValue.type === 'Literal' &&
                  typeof propValue.value === 'string' &&
                  HEX_VALUE_RE.test(propValue.value)
                ) {
                  if (hasWaiver(context, prop)) continue;
                  context.report({
                    node: prop,
                    messageId: 'rawHexInStyle',
                    data: { value: propValue.value },
                  });
                }
              }
            }
            // Spread elements (e.g. style={{ ...colorStyles }}) are intentionally
            // not inspected — the rule cannot statically analyse spread values.
          }
          return;
        }

        // ----- any other JSX prop: flag string values that ARE a hex color -----
        if (value.type === 'Literal' && typeof value.value === 'string') {
          if (HEX_VALUE_RE.test(value.value)) {
            if (hasWaiver(context, node)) return;
            context.report({
              node,
              messageId: 'rawHexInProp',
              data: { value: value.value },
            });
          }
        } else if (value.type === 'JSXExpressionContainer') {
          const expr = value.expression;
          if (
            expr.type === 'Literal' &&
            typeof expr.value === 'string' &&
            HEX_VALUE_RE.test(expr.value)
          ) {
            if (hasWaiver(context, node)) return;
            context.report({
              node,
              messageId: 'rawHexInProp',
              data: { value: expr.value },
            });
          }
        }
      },
    };
  },
};
