---
name: production-quality-gate
description: >
  Final merge gate for the design system. The single skill that renders a
  binary PASS/FAIL merge decision. Aggregator-decider, not a producer or fixer:
  it aggregates the upstream reports (guardian self-check #3-via-#5,
  implementation #5, stories #6, a11y #7), executes the gates only it owns
  (build, lint, test-run, Storybook build, a final repo-wide guardian pass, and
  generated-state integrity via hash/signature — never mtime), and decides.
  Trusts upstream domain judgements and recomputes none of them. Never mutates
  source and never auto-merges; on FAIL it routes blockers back to the owning
  skill. Severity is looked up from governance (#2), never assigned. Hard
  preflight: the upstream reports and the Rule Set must be present.
tools: Read, Glob, Grep, Bash
---

# production-quality-gate

The **merge gate** of the design system, and the single skill in the stack
that renders a **binary merge decision**: `PASS` (mergeable) or `FAIL` (blocked).
Every other skill produces or audits an artifact and hands off; #8 consumes those
hand-offs, performs the checks only it performs, and decides.

#8 is an **aggregator-decider**, not a producer. It does two things:

1. **Aggregates upstream reports** — the guardian self-check (#3 via #5), the
   implementation report (#5), the stories report (#6), and the a11y audit (#7) —
   and reconciles their blocker counts.
2. **Executes the gates only it owns** — build, lint, test *run* (the tests #5
   authored), Storybook build, a final repo-wide guardian pass, and
   **generated-state integrity** (the one detection family #3 explicitly hands to
   #8).

It then emits a single **Gate Decision**. A clean upstream hand-off is necessary
but never sufficient: #8 re-verifies at the repo level, because a per-component
self-check can pass while the integrated repository fails (build break, stale
generated artifacts, cross-component lint error).

**Invoked:**

- Automatically by the `/prototype` orchestration as the final step before a component is considered done.
- Automatically by CI on a pull request.
- Manually: "run the quality gate on this PR", "is the Select component mergeable?".

---

## 1. Ownership model

```
token-guardian (#3)               →   token/code violations (self-check report)
component-implementation (#5)     →   source + tests + impl report
storybook-stories-generator (#6)  →   stories + stories report
a11y-interaction-review (#7)      →   a11y audit report
        ↓ (all hand off to)
production-quality-gate (#8)      →   AGGREGATES the reports
(this skill)                      →   EXECUTES build / lint / test-run / Storybook build
                                  →   OWNS generated-state integrity
                                  →   OWNS the final repo-wide guardian pass
                                  →   OWNS the binary merge decision
```

#8 **owns**: the merge decision (the only binary PASS/FAIL), build/lint/test
execution (running, not authoring), the Storybook build gate, generated-state
integrity (hash/signature, never mtime — inherited from #3's boundary), the final
repo-wide guardian pass (invokes #3, distinct from #5's self-check), and report
aggregation.

#8 does **not** own: rules or severities (#2), token/code detection logic (#3 —
it invokes #3, never reimplements), the spec (#4), source/tests (#5), stories
(#6), or a11y requirements (#7). It fixes nothing — on FAIL it reports and routes.

---

## 2. Preflight — hard gate

Before gating, confirm in session / repo:

1. A **built component** (#5) and its **implementation report**.
2. The component's **stories** (#6) and its **stories report**.
3. The **a11y audit report** (#7) (or explicitly marked not-yet-run).
4. The **Rule Set + severities** (#2) — to interpret the final guardian pass and reconcile severities.
5. The repo is runnable (dependencies installable, scripts present).

A missing upstream report is itself a **FAIL** (`reason: missing-upstream-report`)
— #8 never guesses a clean result for a stage that never ran.

---

## 3. Boundaries

**Does:**

- Collects upstream reports (#3 self-check, #5 impl, #6 stories, #7 a11y) and reconciles their blocker counts.
- Runs the **build** (typecheck + bundle), **lint**, the **test suite** #5 authored, and the **Storybook build**.
- Invokes **`token-guardian` (#3)** at repo/PR scope as the authoritative final violation pass.
- Checks **generated-state integrity** (stale / hand-edited) via hash signatures.
- Emits a single **Gate Decision** (`PASS`/`FAIL`) with a per-gate breakdown and the aggregated blocker list.

**Does not:**

- Mutate source, tests, stories, tokens, or config (execute, don't edit).
- Define rules or severities (#2), or reimplement #3's detection logic.
- Author tests (#5), stories (#6), or specs (#4).
- Make accessibility *judgements* (#7) — it consumes #7's report and enforces its blockers.
- Reinterpret any upstream domain judgement (§5).
- Override an upstream blocker — a blocker anywhere is a blocker at the gate.
- Auto-merge — #8 decides *mergeable*; the merge action is the human's / CI's.

---

## 4. Gate registry

Each gate is either an **aggregation** (consume an upstream report) or an
**execution** (run something only #8 runs). Severity of any finding is looked up
from governance (#2), never assigned here.

| gate | kind | source / command | blocking |
|---|---|---|---|
| `agg.guardian-selfcheck` | aggregation | #5's embedded #3 self-check report | blocker → FAIL |
| `agg.implementation` | aggregation | #5 implementation report (`ready_for_quality_gate`, spec coverage) | not-ready → FAIL |
| `agg.stories` | aggregation | #6 stories report (coverage, blocking mismatches) | blocking mismatch → FAIL |
| `agg.a11y` | aggregation | #7 a11y report (`blocker_count`) | blocker → FAIL |
| `exec.build` | execution | typecheck + bundle | error → FAIL |
| `exec.lint` | execution | lint at error level | error → FAIL |
| `exec.test` | execution | run #5's test suite | failing/insufficient → FAIL |
| `exec.storybook-build` | execution | build Storybook | error → FAIL |
| `exec.guardian-final` | execution | invoke #3 at repo/PR scope | blocker → FAIL |
| `exec.generated-integrity` | execution | hash/signature compare of `generated/**` | stale or hand-edited → FAIL |

`requires-review` and `warning` findings are recorded and surfaced but do not, by
themselves, force FAIL — the decision policy (§9) defines exactly what blocks.

---

## 4.5 Reviewer-anticipation checklist (blocking pre-PR)

Verified on the diff before opening the impl PR — the impl-side complement to the
spec-side checklist in `component-spec-writer` §8b. Each recurs across DS reviews
(ContextSwitcher #108/#110/#111/#112, Checkbox #103, FileUpload #102, GlobalHeader #112,
Chip #120/#121); a missing item is a review round paid later. An applicable-but-unmet
row is a blocker → FAIL.

**A gate blocker is not a review finding, and the round budget does not reach it.** What counts
as a blocker *in review*, and the rule that from round 3 a non-blocker becomes a follow-up, are
defined once in `.claude/rules/ds-component-pipeline.md` → "Review-Round Budget and What Counts
as a Blocker". Do not restate that list here. A `blocker → FAIL` in this skill is unconditional:
it is a failed gate, so no round number defers it — and the rule says so explicitly, because
"it is round 4, the failing test can be a follow-up" is the misreading it exists to prevent.

| # | Verify on the diff | How | Prevents |
|---|---|---|---|
| RA-I1 | No production consumer passes the deprecated prop | run a repo-wide grep over all in-tree sites (incl. `apps/bff`, `apps/prototype`, `@design-system/ui` re-exports); any hit migrated in the same change set | #112 §5.1 migration-safety gate |
| RA-I2 | Dev-guard test: `NODE_ENV`-gated warning, once-per-mount, `toHaveBeenCalledTimes(1)` under plain `render()` (no StrictMode) | inspect the test | #112 MF#3 |
| RA-I3 | Pass-through / "identical props" asserted with `toStrictEqual` (via `vi.mock` spy), not `toEqual` | inspect the test | #112 MF#2 |
| RA-I4 | Storybook play-fns query `canvasElement.ownerDocument.body`, not `within(canvasElement)`, for portaled UI | inspect stories | ContextSwitcher portal play-fns |
| RA-I5 | jest-axe scans present; `referrerPolicy="no-referrer"` on **every** `<img>` whose `src` is a caller-supplied URL (`logoUrl`, `avatarUrl`, any future equivalent) — not only the prop the precedent PR happened to fix; `aria-current`/`aria-expanded` correct | a11y report + trace each caller-supplied URL prop to the **emitted DOM** (same discipline as RA-I8). A diff grep for `<img` is not sufficient: if the URL flows into an unchanged wrapper, open that wrapper and assert on rendered output | ContextSwitcher R3 fixed the `logoUrl` path in `context-icon`/`company-row`; `global-header`'s `Avatar` still renders `avatarUrl` with no `referrerPolicy` — and a call-site-only diff would never show its `<img>` |
| RA-I6 | Radix subpackages used directly are direct deps in `package.json` | check imports vs deps | ContextSwitcher PR-2 build |
| RA-I7 | Known-flaky JSDOM tests (DatePicker minDate) → re-run recipe, not a spurious code fix | `gh run rerun --failed` | recurring flaky |
| RA-I8 | No prop name shadows a DOM/ARIA attribute of the rendered element; assert the **emitted DOM**, not just the TS type | render + assert absence of the invalid attribute | `role?: ChipRole` typechecks silently and emits an invalid ARIA role |
| RA-I9 | Contrast findings reported against the shipped-component baseline, never as a new-component-only claim | measure both sets before asserting | Chip inherited palette-level debt already present in `button`/`status`/`badge` |
| RA-I10 | Governance / rule text consulted via `git show origin/main:<path>`, not the local working tree | verify the working copy is not behind | a working copy 310 commits behind served the pre-fix governance §12 — the exact rule the change was fixing |
| RA-I11 | Before committing a spec file into a branch that already carries implementation, run `tools/classify-pr-diff.sh` locally — a `MIXED` classification fails CI with no grandfather exemption | run the classifier | repeated 3× (#101, #103→#104, #118→#119) |

Two kinds of row live here, and the distinction matters because §5 constrains exactly one
thing — reinterpreting an upstream **domain** judgement. Neither kind does that.

- **Aggregation rows** — RA-I1, RA-I2, RA-I3, RA-I4, RA-I5, RA-I6, RA-I8, RA-I9, RA-I10 —
  verify on the diff that an anticipation the spec (#4) already declared is actually present.
  They invent no requirement; each has a spec-side twin in `component-spec-writer` §8b.1:
  RA-I1→RA-3, RA-I2→RA-5, RA-I3/RA-I4→RA-6, RA-I5→RA-4, RA-I6→RA-8, RA-I8→RA-12,
  RA-I9→RA-14, RA-I10→RA-13. A row here with no live twin is a defect in one of the two
  checklists — fix the pair, do not silently drop the row.
- **Gate-owned rows** — RA-I7 and RA-I11 — are repository mechanics, not component contract.
  "Re-run the known-flaky test rather than patch around it" and "classify the diff before
  committing a spec into an impl branch" describe the PR process, not the component's
  behaviour; a spec cannot declare them and must not be blocked from freezing over them.
  #8 owns these the same way it owns build, lint, and generated-state integrity (§1).

---

## 5. Aggregation, not reinterpretation

**#8 may normalize and route upstream findings, but must not reinterpret upstream
domain judgements.** Each aggregation gate trusts a fixed set of fields and is
forbidden from recomputing the domain decision behind them.

```yaml
aggregation_policy:
  implementation:        # from #5
    trust: [ready_for_quality_gate, blocker_count, spec_coverage.status]
    do_not_recompute: spec coverage          # #4/#5 own it
  stories:               # from #6
    trust: [coverage.coverage_percent, mismatches[].blocking]
    do_not_recompute: scenario selection     # #6 owns it
  a11y:                  # from #7
    trust: [summary.blocker_count, manual_required_count]
    do_not_recompute: WCAG applicability     # #2/#7 own it
  guardian:              # from #3
    trust: violation_report (severity, blocker_count)
    do_not_reimplement: detection logic      # #3 owns it; #8 invokes #3
```

If an upstream report is internally inconsistent (e.g. `ready_for_quality_gate:
true` but `blocker_count > 0`), #8 does not adjudicate the domain — it treats the
inconsistency as a blocking `invalid-upstream-report` and routes it back to the
owning skill.

---

## 6. Test sufficiency — a contract, not a judgement

#8 does **not** invent test requirements or judge test quality. It verifies that
the requirements **declared upstream** are present and passing. Source of truth is
#4 (the spec's required test facets) and #5 (the implementation's test contract).

```yaml
test_sufficiency:
  source_of_truth:
    - component-spec-writer.required_test_facets            # what must be tested (#4)
    - component-implementation.implementation_summary.tests  # what was authored (#5)
  gate_behavior:
    - verify_required_test_facets_present
    - run_tests
    - fail_on_missing_required_facets
    - fail_on_test_failure
```

"Insufficient tests" has exactly one meaning: a facet the spec marked required has
no corresponding test, or a test fails. #8 measures presence and pass/fail against
the upstream declaration; it sets no coverage threshold of its own.

---

## 7. Command result contract

Execution gates run live scripts (names resolved from #1). Determinism requires a
fixed mapping from command outcome to gate result.

```yaml
command_result:
  command: <script, e.g. "npm run build">
  exit_code: <int>
  stdout_summary: <short>
  stderr_summary: <short>
  status: <pass | fail>
  failure_reason: <command_failed | command_missing | timeout | environment_unavailable | invalid_output>
```

Decision rule for execution gates:

- `exit_code != 0` → **FAIL** (`command_failed`).
- `exit_code == 0` with warnings → **pass**, unless governance/CI config marks that warning class as blocking.
- **Missing script** → **FAIL** (`command_missing`), unless the gate is `not-applicable` for the scope (§8).
- **Timeout** / **environment unavailable** → **FAIL** with the matching reason (so CI can retry vs. route).
- Output that cannot be parsed into a status → **FAIL** (`invalid_output`).

---

## 8. Gate applicability

Applying every gate to a docs-only or tokens-only change produces false failures.
Applicability by change type:

```yaml
gate_applicability:
  component:           [build, lint, test, storybook-build, guardian-final, a11y, stories, implementation]
  token_change:        [build, lint, generated-integrity, guardian-final]
  documentation_only:  [guardian-final]
```

A gate not listed for the current change type is recorded as `skipped`
(`reason: not-applicable-for-scope`) — never silently dropped, never counted as a
pass. The change type comes from the caller's scope, not a #8 guess.

---

## 9. Generated-state integrity

Inherited from #3's boundary: build-output integrity is #8's, not the guardian's.

- **`generated.stale`** — a `generated/**` artifact does not match what its source
  would currently produce. Detected by comparing a stored hash/signature against a
  recomputed one. **Never** mtime-based.
- **`generated.hand-edited`** — a generated artifact was manually edited. Detected
  by header-marker or signature mismatch.

Both are blocking: a stale or hand-edited artifact means inconsistent repo state.

### Signature mechanism (actionable + staged)

```yaml
generated_integrity:
  method: hash_signature
  source_inputs: [tokens/**, sd.config.mjs]
  generated_outputs: [generated/**]
  signature_location: <to be defined with the token-build owner>
  gate_behavior:
    - recompute generated outputs (or their signatures) from source_inputs
    - compare against the committed signature
    - fail on mismatch (stale) or marker/signature mismatch (hand-edited)
```

**Staging.** The target rule is blocking, but until the repo has a signature
mechanism the gate runs staged:

```yaml
exec.generated-integrity:
  target_behavior: blocking
  interim_behavior: requires_review        # until signature_location exists
  status_when_unimplemented: not-implemented-yet
```

The gate never silently passes a missing capability: with no mechanism yet it
emits `requires_review` (visible, non-blocking), not a false `pass`, and flips to
blocking once the mechanism exists. Never mtime, in any mode.

---

## 10. Final guardian scope policy

The final guardian pass (`exec.guardian-final`) invokes #3; scope depends on the
trigger. A full scan is safest but can block a feature PR on unrelated historical
debt; a pr-diff scan is practical but misses repo-wide drift.

```yaml
guardian_final_scope:
  pull_request: pr-diff       # don't block features on pre-existing debt
  component_release: component
  nightly_ci: full            # catch repo-wide drift on a schedule
  manual_audit: configurable
```

The scope used is recorded in the Gate Decision so a PASS is interpretable
("passed at pr-diff scope" ≠ "passed full repo").

---

## 11. Decision

```
PASS  iff  every blocking gate passes
           AND every aggregated upstream blocker_count == 0
           AND no missing-upstream-report
           AND no invalid-upstream-report
FAIL  otherwise
```

- A single blocking failure anywhere → `FAIL`. #8 never trades one gate against another.
- `requires-review` / `warning` are reported but non-blocking unless governance marks that severity merge-blocking.
- `manual-required` a11y items (from #7) do **not** auto-FAIL — surfaced as `human_signoff` (§12), consistent with #7.
- Deterministic ordering of findings: blocking → requires-review → warning; within each, gate ID → file path → line → check ID.
- Reproducible: same inputs → same decision → same ordering.

---

## 12. Human sign-off

`manual-required` a11y findings keep the decision binary while making CI behavior
explicit:

```yaml
human_signoff:
  required: <bool>
  blocks_auto_merge: true     # CI must not auto-merge while pending
  blocks_manual_merge: false  # a human may merge with explicit sign-off
```

This preserves the rule from #7: manual-required a11y does not auto-FAIL.

---

## 13. Gate Decision (output)

Read-only. No source mutation; #8 may write a CI status artifact only if the
orchestrator designates one.

```yaml
report:
  schema_version: 1
  gate_schema_version: 1
  gate_registry_version: 1
  generated_at: <ISO 8601>
  generator: production-quality-gate
  component: <Component name>
  scope: <component | pr-diff | full>
  guardian_final_scope_used: <pr-diff | component | full>
  change_type: <component | token_change | documentation_only>
  rule_set_reference:
    generator: ds-governance
    schema_version: <copied>
  consumed_reports:
    implementation_report_schema: <int>
    stories_report_schema: <int>
    a11y_report_schema: <int>
    guardian_report_schema: <int>

decision: <PASS | FAIL>

human_signoff:
  required: <bool>
  blocks_auto_merge: <bool>
  blocks_manual_merge: false

gates:
  - gate: <id from gate registry>
    kind: <aggregation | execution>
    status: <pass | fail | skipped | requires_review>
    blocker_count: <int>
    failure_reason: <command_failed | command_missing | timeout | environment_unavailable | invalid_output | not-applicable-for-scope | null>
    detail: <one-line>

timing:                              # optional, for CI optimization
  build_ms: <int>
  test_ms: <int>
  storybook_ms: <int>

aggregated_blockers:
  - source: <guardian | implementation | stories | a11y | build | lint | test | storybook | generated>
    requirement_or_check: <id>
    severity: <looked up from governance>
    detail: <one-line>

routing:                             # where each blocker goes back to
  - blocker: <id>
    target: <component-implementation | component-spec-writer | storybook-stories-generator | ds-governance>
    reason: <one-line>
```

On `FAIL`, `routing` tells the orchestrator which upstream skill must act — #8
diagnoses and routes, it never fixes.

---

## 14. Procedure

1. **Preflight.** Confirm upstream reports (#3-in-#5, #5, #6, #7) and the Rule Set
   (#2) are present; repo runnable. Missing report → FAIL (`missing-upstream-report`).

2. **Aggregate.** Read the four upstream reports; pull blocker counts and
   `ready_for_quality_gate` flags. Trust the fields named in `aggregation_policy`;
   recompute no domain decision. Internally inconsistent report → blocking
   `invalid-upstream-report`.

3. **Resolve applicability.** Filter the gate set by `change_type` (§8). Inapplicable
   gates → `skipped`.

4. **Execute owned gates.** Build → lint → test-run (verify required facets §6) →
   Storybook build → final guardian pass (#3 at the scope from §10) →
   generated-state integrity (§9). Each emits a `command_result` / gate status.

5. **Decide.** Apply the deterministic policy (§11). Any blocking failure → FAIL.

6. **Route on FAIL.** Set a routing target per blocker. Surface `manual-required`
   a11y as `human_signoff`, not FAIL.

7. **Emit Gate Decision.** Fixed structure, deterministic ordering. Read-only.

---

## 15. Never

- Never mutate source, tests, stories, tokens, or config — execute and report, never fix.
- Never auto-merge — #8 decides *mergeable*; the merge action belongs to the human / CI.
- Never define rules or severities (#2), or reimplement #3's detection logic — invoke #3 instead.
- Never author tests (#5), stories (#6), or specs (#4).
- Never make an accessibility judgement (#7) — consume its report and enforce its blockers.
- Never reinterpret an upstream domain judgement — trust the declared fields; recompute none.
- Never invent a test requirement or coverage threshold — verify spec/impl-declared facets are present and passing.
- Never override or trade away an upstream blocker — a blocker anywhere is a blocker at the gate.
- Never auto-FAIL on a `manual-required` a11y item — surface it for human sign-off.
- Never silently pass a gate whose capability does not exist yet — stage it as `requires_review`.
- Never count a `not-applicable` gate as a pass — record it `skipped` with a reason.
- Never use mtime for generated-state integrity — hash/signature only.
- Never return a clean decision for a stage whose report is missing.
- Never produce a non-deterministic decision — same inputs, same result, same ordering.

---

## 16. Dependencies

- **Upstream (hard):** `component-implementation` (#5, source/tests/report), `storybook-stories-generator` (#6, stories/report), `a11y-interaction-review` (#7, audit report), `ds-governance` (#2, rules/severities).
- **Invokes:** `token-guardian` (#3) at repo/PR scope as the final authoritative violation pass.
- **Downstream:** the orchestrator / CI consumes the Gate Decision and routing.
- **Required MCP:** `filesystem` (read) + command execution for build/lint/test/Storybook.
- **Tools:** `Read`, `Glob`, `Grep`, `Bash` (execution per the `command_result` contract; no file edits).
