/*
 * A11Y-009 mechanism: a direct axe-core harness, run inside the `browser`
 * vitest project.
 *
 * WHY THIS AND NOT `@storybook/addon-a11y`. The addon is installed and is
 * configured `a11y: { test: 'todo' }` in .storybook/preview.ts, which reports
 * findings in a panel and fails nothing. Nothing in this repository can turn a
 * panel finding red: the addon's failing modes are driven by a separate
 * runner, and adding one was rejected for this repository (a second test
 * framework, and a running Storybook in CI, for the same result). The addon
 * stays exactly as it is — the cheap continuous signal while authoring. This
 * harness is the thing that can go red.
 *
 * WHY A BROWSER AND NOT jsdom. axe-core's `color-contrast` rule needs real
 * layout and real computed styles; in jsdom it is reported as `incomplete` and
 * silently checks nothing. Contrast is the single most common AA failure in a
 * design system, so a scan that cannot run it is a scan with its most useful
 * rule switched off. Call these helpers from a `*.browser.test.tsx` file.
 * They will run in jsdom without throwing — and will quietly skip contrast,
 * which is the trap this comment exists to name.
 *
 * WHY axe-core IS AN EXPLICIT DEPENDENCY. It was already present, but only
 * transitively via the Storybook addon. A transitive version is not a chosen
 * version: it moves when an unrelated package bumps, and disappears when that
 * package is removed. It is now declared in devDependencies.
 *
 * This module is component-agnostic on purpose. It knows about elements, not
 * about any design-system component.
 */
import axe from 'axe-core';

/**
 * The rule tags scanned by default: the WCAG conformance floor declared in
 * ds-kit.config.yml (`a11y.wcag_level: AA`, `a11y.wcag_version: "2.2"`).
 *
 * `best-practice` is deliberately absent. It is axe's opinion rather than the
 * standard, and a gate that fails on opinion gets disabled.
 */
export const WCAG_AA_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
] as const;

export interface AxeScanOptions {
  /** Override the scanned rule tags. Defaults to `WCAG_AA_TAGS`. */
  tags?: readonly string[];
  /**
   * Per-rule overrides, passed through to axe. Use to disable a rule that a
   * fixture cannot satisfy — and say why at the call site, because a disabled
   * rule is an accessibility decision, not a test detail.
   */
  rules?: axe.RuleObject;
}

/**
 * Run axe against `container` and return the full results.
 *
 * Prefer `expectNoAxeViolations` in a test; reach for this when a test needs to
 * assert on the findings themselves — including a test asserting that the scan
 * DOES fail on a known-bad fixture, which is how this harness proves it is
 * capable of going red.
 */
export async function runAxe(
  container: Element,
  options: AxeScanOptions = {},
): Promise<axe.AxeResults> {
  const { tags = WCAG_AA_TAGS, rules } = options;
  return axe.run(container, {
    runOnly: { type: 'tag', values: [...tags] },
    rules,
    resultTypes: ['violations'],
  });
}

/** Render one axe violation as something a reader can act on. */
function formatViolation(violation: axe.Result): string {
  const nodes = violation.nodes
    .map((node) => {
      const target = Array.isArray(node.target)
        ? node.target.flat(Infinity).join(', ')
        : String(node.target);
      const summary = node.failureSummary?.split('\n').join('\n      ') ?? '';
      return `    - ${target}\n      ${node.html}\n      ${summary}`;
    })
    .join('\n');
  return `  [${violation.impact ?? 'unknown'}] ${violation.id}: ${violation.help}\n    ${violation.helpUrl}\n${nodes}`;
}

/**
 * Assert `container` has no WCAG AA violations.
 *
 * Throws with every violation listed — rule id, impact, help URL, the offending
 * markup and axe's own failure summary — because an accessibility failure whose
 * message is "expected 0 to be 1" costs more to diagnose than it saves.
 */
export async function expectNoAxeViolations(
  container: Element,
  options: AxeScanOptions = {},
): Promise<void> {
  const results = await runAxe(container, options);
  if (results.violations.length === 0) return;

  const count = results.violations.length;
  const heading = `${count} accessibility violation${count === 1 ? '' : 's'} found:`;
  throw new Error(
    [heading, ...results.violations.map(formatViolation)].join('\n'),
  );
}
