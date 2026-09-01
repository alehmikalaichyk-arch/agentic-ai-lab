---
name: token-guardian
description: >
  Detection layer for the design system. Detects violations of rules
  defined in ds-governance (#2) by scanning token files and component
  source. Owns detection strategies and capability claims; does not own
  rules, rule IDs, or severity. Produces a structured Violation Report
  sorted deterministically; severity is looked up from the Governance Rule
  Set. Never modifies files, never autofixes, never invents rules, never
  assigns severity, never runs a rule that is not declared in Governance.
  Preflight: hard (context + governance snapshots) for full/pr-diff scope;
  soft (no snapshots required, severity reported as unknown) for scope:path
  on app code. Read-only.
tools: Read, Glob, Grep
---

# token-guardian

The **detection layer** for the design system. `ds-governance` (#2)
owns the rules, their canonical IDs, and their severities; `token-guardian`
detects violations of those rules in token files and component source.

Guardian does not own a single rule or rule ID. Every `rule_id` referenced in
this skill exists because Governance declared it. Every severity reported is a
lookup from the Governance Rule Set. If a rule is not in the Rule Set, Guardian
does not check it — it lists the gap explicitly in `unchecked_rules`.

The skill is static and read-only: it reads files, applies detection
strategies, and reports violations. No autofixes, no codemods, no file
modifications.

**Invoked:**

- Automatically by `production-quality-gate` (#8) as a mandatory gate before merge.
- Automatically by `component-implementation` (#5) after writing code — self-check before delivery.
- Manually: "run guardian against this PR diff" / "scan the repo for token-rule violations".

---

## 1. Read context and governance first — hard gate (soft for extended scope)

**Default and `scope: full` / `scope: pr-diff`**: before any detection runs,
both preflights must be satisfied:

1. Confirm `ds-context` (#1) has produced a **Context Snapshot** in the
   session (live paths and inventory).
2. Confirm `ds-governance` (#2) has produced a **Rule Set** in the session
   (the sole source of rules, canonical IDs, and severities).

If either is missing, **stop** and report the missing preflight. Guardian does
not guess paths and does not invent rules.

**`scope: path` targeting `apps/*/{src,pages,components}/**` (forbidden-only extended scope)**:
preflight is **soft**. Agents implementing screens have not run #1 or #2.
In this mode no Rule Set is available, so Guardian cannot look up severity —
all findings are reported as `severity: unknown (preflight-skipped)`. The
downstream consumer (implementing agent or orchestrator) decides how to treat
them. This preserves the ownership invariant: Guardian never assigns severity,
even in soft mode. Notes `preflight: skipped` in the Violation Report header.
Only `forbidden.*` rules run; see §5 extended scope for the full list.

---

## 2. Ownership model

```
ds-governance (#2)        →   defines rules
                                →   owns canonical rule_ids
                                →   owns severity classification
        ↓
token-guardian (#3, this skill) →   detects violations of those rules
                                →   owns detection strategies
                                →   owns detection capability claims
        ↓
production-quality-gate (#8)    →   blocks merge based on violation report
```

Guardian owns **how to detect**, never **what is illegal** or **what counts as
which severity**.

Guardian owns:

- **Detection strategies** — how to find a violation of a given `rule_id`.
- **Detection capability** — `implemented` / `partial` / `unsupported`, per rule.
- **Detection confidence** — `high` / `medium` / `low` for individual partial-capability findings.
- **Violation reports** — structured output for downstream consumers.

Guardian does **not** own:

- The rules themselves.
- The canonical `rule_id`s — Governance-owned.
- The severity classification — Governance-owned, read-only here.
- The merge decision — `production-quality-gate` (#8) owns it.

---

## 3. Rule-Set-as-source-of-truth

Before any check runs, Guardian reconciles its Detection Registry (§6) against
the Governance Rule Set:

- Pull the Rule Set from #2.
- For each entry in the Detection Registry, confirm a matching `rule_id` exists
  in the Rule Set.
- If a `rule_id` from the registry has **no** match in the Rule Set, that
  detection is **skipped** and the rule is recorded in `unchecked_rules` with
  `reason: missing-rule-id`.
- If a `rule_id` in the Rule Set has **no** detection in the registry, it is
  recorded in `unchecked_rules` with `reason: capability:unsupported`.

This guarantees no orphaned detections and no stale rules: detection and
governance can never silently diverge.

---

## 4. Boundaries

**Does:**

- Scans `tokens/**/*.json` for violations of `token_architecture`,
  `token_naming_conventions`, and (if Governance declares them) DTCG-completeness rules.
- Scans `src/components/**/*.{tsx,ts,css}` for violations of `forbidden_patterns`
  and (if Governance declares a corresponding rule) source-code layer-bypass.
- Produces a structured **Violation Report** with exact coordinates (file + line)
  of each violation, severity looked up from the Rule Set, and
  capability/confidence annotations.
- Reports `unchecked_rules` explicitly — every rule from the Rule Set that
  Guardian cannot or chose not to check.

**Does not:**

- Modify any file. No autofix, no codemods, no migrations.
- Define rules. The Rule Set from #2 is the sole source.
- Declare canonical `rule_id`s — Governance owns them.
- Assign or modify severity. Severity is read-only from the Rule Set.
- Run rules not in the Rule Set.
- Run builds, lint, or tests (`production-quality-gate` #8).
- Check `generated/` artifacts — build integrity belongs to #8.
- Check a11y / WCAG (`a11y-interaction-review` #7).
- Check synchronisation with a design tool — no skill in this kit does this.
- Compute git diff itself — accepts the list of changed files from the caller.
- Judge "correctness" of a design decision.

---

## 5. Inputs

| Path / source | Role |
|---|---|
| `ds-context` (#1) Context Snapshot | **Hard preflight** (full/pr-diff scope); skipped in `scope:path` soft mode. |
| `ds-governance` (#2) Rule Set | **Hard preflight** (full/pr-diff scope); skipped in `scope:path` soft mode — severity reported as `unknown`. |
| `tokens/**/*.json` | Detection target: token files. |
| `src/components/**/*.{tsx,ts}` | Detection target: component source (default scope). |
| `src/**/*.css` | Detection target: CSS files (default scope). |
| `components.json` | Source of shadcn alias paths. |
| `apps/*/{src,pages,components}/**/*.{tsx,ts,css}` | **Extended scope (optional).** Product app source. Active only when caller passes `scope: path` targeting an app path. |

`generated/*` is **not** an input. Build-integrity checks live in #8.

### Default vs. extended scope

- **Default** (`scope: full` or `scope: pr-diff`): targets `ds_package_root` — all rule categories apply.
- **Extended** (`scope: path` with an `apps/*/{src,pages,components}/**` glob): targets the specified app path — only `forbidden.*` rules run (raw-hex, arbitrary-design-value, inline-style, css-in-js, hardcoded-breakpoint, cn-bypass). Token-architecture, naming, and `code.*` category rules (including `code.layer-bypass-via-css-var`) do not apply outside the token package; they appear in `unchecked_rules` with `reason: out-of-scope-for-app-code`. Note: `code.layer-bypass-via-css-var` has category `code`, not `forbidden` — its exclusion from extended scope is intentional and explicit.

This extension is used when scanning application code rather than DS source, when it delegates forbidden-pattern detection to Guardian.

---

## 6. Scope selection

Three modes:

- **full** — entire repository. For CI nightly or manual audit.
- **pr-diff** — only files in the list passed by the caller, plus the tokens
  they transitively reference. Guardian never invokes git.
- **path** — a specific glob. May target the DS package (all rules) or any `apps/*/{src,pages,components}/**` path (forbidden-pattern rules only — see §5 Default vs. extended scope).

**Invocation examples:**

```
# Full DS package scan (all rules, hard preflight required):
token-guardian scope:full

# PR-diff scan (caller provides changed file list, hard preflight required):
token-guardian scope:pr-diff files:[src/components/Button/Button.tsx]

# Extended scope — forbidden-pattern check on a product app (soft preflight):
token-guardian scope:path a consuming application/src/**
token-guardian scope:path apps/a consuming application/src/screens/ProjectList.tsx
# Next.js apps (a consuming application, a consuming application) use pages/ and components/ instead of src/:
token-guardian scope:path apps/a consuming application/pages/contractors/**
token-guardian scope:path apps/a consuming application/components/UserDetails.tsx
```

---

## 7. Detection Registry

A table indexed by `rule_id` (foreign key into the Governance Rule Set).
Severity is **not** a column — it is looked up at report time. Every `rule_id`
below runs **only after Governance has adopted it** in its Rule Set (see §12);
until then it is reported in `unchecked_rules`.

```yaml
detection_registry_version: 1
```

| `rule_id` | category | method | capability |
|---|---|---|---|
| `arch.semantic-to-semantic-ref` | tokens | dtcg-graph-walk | implemented |
| `arch.component-to-primitive-ref` | tokens | dtcg-graph-walk | implemented |
| `arch.invalid-ref-syntax` | tokens | regex | implemented |
| `arch.ref-target-missing` | tokens | dtcg-graph-walk | implemented |
| `naming.casing-violation` | tokens | regex | implemented |
| `naming.separator-violation` | tokens | regex | implemented |
| `naming.unknown-color-family` | tokens | string-match against `color_families` | implemented |
| `naming.invalid-step-scale` | tokens | regex | implemented |
| `naming.suffix-out-of-vocabulary` | tokens | string-match against `modifier_suffixes` | implemented |
| `naming.composition-order-violation` | tokens | heuristic | partial |
| `dtcg.missing-type` | tokens | dtcg-traversal | implemented |
| `dtcg.missing-description-semantic` | tokens | dtcg-traversal | implemented |
| `forbidden.raw-hex` | code | regex | implemented |
| `forbidden.inline-style-design-value` | code | ast-or-heuristic | partial |
| `forbidden.cn-bypass` | code | ast-or-heuristic | partial |
| `forbidden.tailwind-arbitrary-design-value` | code | regex | implemented |
| `forbidden.css-in-js` | code | import-scan | implemented |
| `forbidden.hardcoded-breakpoint` | code | regex | implemented |
| `code.layer-bypass-via-css-var` | code | css-var-scan | implemented |

**Method types:**

- **regex** — deterministic, single-file pattern match.
- **dtcg-graph-walk** — primary method for token reference-chain validation.
  Traverse the DTCG token graph, follow `{...}` references, validate the chain
  rule (primitive ← semantic ← component, may only reference to the left).
- **dtcg-traversal** — walk DTCG nodes for per-node properties (e.g. presence
  of `$type`, `$description`).
- **css-var-scan** — scans **component source code** for `var(--ds-*)` usages
  that point at a forbidden layer (e.g. component code referencing a primitive
  CSS variable directly when Governance requires usage through semantic). Not
  used for token-file chain validation; that is `dtcg-graph-walk`'s job.
- **ast-or-heuristic** — AST parsing where reliable, regex fallback otherwise.
  Flagged `partial` because false negatives are possible.
- **string-match against `<field>`** — compare against an enumerated list pulled
  from the Rule Set.
- **import-scan** — detect specific import sources (e.g. `styled-components`, `@emotion/*`).
- **heuristic** — best-effort; explicitly `partial`.

**Capability values:**

- **implemented** — reliable detection; output is reported as "violation" with `confidence: high`.
- **partial** — heuristic detection; output is reported as "possible violation"
  with `confidence: medium` or `low` per finding.
- **unsupported** — cannot be checked automatically (semantic correctness, "is
  this the right token for this role"). Listed in `unchecked_rules`.

---

## 8. What Guardian does NOT check

- Semantic correctness of a design decision.
- A11y (#7).
- Figma sync (#10).
- Test coverage / build / lint (#8).
- **Generated-state integrity** — `generated/` staleness, hand-editing, hash
  drift. All belong to #8.
- **Any rule not declared in the Governance Rule Set.** If a check would be
  useful but the rule does not exist in Governance, Guardian does not run it; it
  must be added to Governance first.

---

## 9. Violation Report Contract

A **Violation Report** with a fixed structure. No files written.

```yaml
report:
  schema_version: 1
  generated_at: <ISO 8601>
  generator: token-guardian
  detection_registry_version: 1
  scope: <full | pr-diff | path:<glob>>
  rule_set_reference:
    generator: ds-governance
    schema_version: <copied from the Rule Set used for this run>

summary:
  blocker_count: <int>
  requires_review_count: <int>
  warning_count: <int>
  files_scanned: <int>

coverage:
  implemented_rules: <int>      # rules Guardian can reliably detect
  partial_rules: <int>          # rules Guardian detects with heuristics
  unsupported_rules: <int>      # rules in Rule Set but Guardian cannot check
  total_rules_in_rule_set: <int>
  coverage_percent: <float>     # (implemented_rules + partial_rules) / total_rules_in_rule_set * 100, rounded to 1 decimal

violations:
  - rule_id: <foreign key into Rule Set, e.g. forbidden.raw-hex>
    severity: <looked up from Rule Set; not assigned by Guardian>
    detection_method: <regex | dtcg-graph-walk | css-var-scan | ast-or-heuristic | string-match | heuristic>
    capability: <implemented | partial>
    confidence: <high | medium | low>     # optional; required when capability=partial
    file: <path>
    line: <int>
    column: <int>
    snippet: <captured code/value>
    message: <one-line description; "violation" for implemented, "possible violation" for partial>
    suggestion: <fix direction — descriptive, never a patch>

unchecked_rules:
  - rule_id: <id>
    reason: <missing-rule-id | capability:unsupported | requires-script-not-yet-implemented | missing-severity-in-rule-set>
```

`coverage_percent` measures automation maturity over time: the share of the
Rule Set that Guardian can detect at all (reliably or heuristically). It is
derived, never authored independently of the three counts above.

### Deterministic sort order

Violations are sorted deterministically:

1. Severity (`blocker` → `requires-review` → `warning`).
2. File path (lexicographic).
3. Line number ascending.
4. `rule_id` lexicographic.

This sort order is stable across runs so PR-comment diff noise is minimized.

Downstream consumers: `production-quality-gate` (#8) decides merge / no-merge
based on `summary.blocker_count`; a PR-summary generator may publish the report
in a PR comment.

---

## 10. Severity lookup, not assignment

For each violation, Guardian:

- Looks up `severity` from the Rule Set entry whose `rule_id` matches.
- Copies the value into the report.
- Never modifies, infers, or re-classifies.

If the Rule Set entry for a `rule_id` has no severity (data error in #2), the
violation is suppressed and the rule is added to `unchecked_rules` with
`reason: missing-severity-in-rule-set`. Guardian does not invent severity.

---

## 11. Suggestion formulation

Guardian formulates the *direction* of a fix, never the patch itself.
Suggestions are advisory.

For `forbidden.raw-hex`:

> "Replace `#1CCE96` with a token reference. The closest primitive by value is
> `{brand-600}`; a semantic token resolving to it is `surface.brand-bold`.
> **This is advisory.** Choose the semantic token based on the role you are
> filling (text, surface, outline, etc.), not visual similarity alone. Semantic
> token names describe role, not appearance."

For `arch.component-to-primitive-ref`:

> "Component token references `{brand-700}` directly. Introduce or reuse a
> semantic token for this role and reference that instead."

Suggestions are textual, never patches.

---

## 12. Detection phasing

- **Phase 1 (current):** pure-agent detection. Claude reads files, applies the
  methods, reports violations.
- **Phase 2 (target):** script-assisted detection — `scripts/lint-tokens.mjs` +
  ESLint custom rules, invoked and parsed by the agent. Phase 2 integration is
  owned by `production-quality-gate` (#8). Guardian's role does not change shape
  between phases.

For `scope: pr-diff`, Guardian receives the file list from the caller and checks
only those files plus the tokens they transitively reference.

---

## 13. Never

- Never modify any file.
- Never own a rule. Rules belong to #2.
- Never declare a canonical `rule_id`. Canonical IDs are Governance-owned;
  Guardian references them and runs a detection only once Governance has adopted
  the rule.
- Never run a check whose `rule_id` is not present in the Rule Set.
- Never assign or modify severity.
- Never silently skip a rule — list it in `unchecked_rules` with a reason.
- Never produce a suggestion that is a code patch.
- Never assert a closest-token suggestion as authoritative; it is always advisory.
- Never run a build (#8 owns that).
- Never compute git diff (caller provides the file list).
- Never use mtime for any check.

---

## 14. Dependencies

- **Upstream (hard):** `ds-context` (#1), `ds-governance` (#2).
- **Downstream:** `production-quality-gate` (#8); `component-implementation` (#5) for self-check. The `scope: path` extended scope (soft preflight) also serves callers auditing application code outside the DS package; no skill in this kit is such a caller.
- **Required MCP:** `filesystem`.
- **Tools:** `Read`, `Glob`, `Grep`. Read-only. Guardian is a pure auditor.

---

## 15. Cross-skill prerequisites

These are **prerequisites** — Guardian cannot operate at the scope claimed here
until Governance adopts them. Per #2 §18, additive field changes do not require
a `schema_version` bump.

### Required additive updates to `ds-governance` (#2) — **satisfied**

Governance now publishes a canonical rule index: #2 §15.1 (the table) and the `rules:`
block of the Rule Set (#2 §16). All four items below are adopted, every id in §7 has a
match, and every match carries a severity.

1. **`rule_id` on every rule entry** across `token_architecture`,
   `token_naming_conventions` and `forbidden_patterns`, using the IDs in §7. — done
2. **DTCG-completeness rules** `dtcg.missing-type` (blocker) and
   `dtcg.missing-description-semantic` (warning). — done
3. **The layer-bypass rule** `code.layer-bypass-via-css-var` (blocker). — done
4. **Severity on every rule above.** — done

Reconcile against #2 anyway, every run: §3 is a reconciliation, not a one-time
adoption check. If any of the above is later dropped, Guardian still runs — it checks
fewer rules and reports the gaps transparently in `unchecked_rules`. That is the failure
mode this list was written for, and it is a *quiet* one: the report reads as a pass while
covering less. Read `unchecked_rules` before believing a clean run.

### Required boundary additions to `production-quality-gate` (#8) — future passport

When #8 is drafted, it must inherit:

1. `generated.stale` detection — using hash/signature comparison, never mtime.
2. `generated.hand-edited` detection — using header-marker or hash signature.

These are out of scope for Guardian permanently.
