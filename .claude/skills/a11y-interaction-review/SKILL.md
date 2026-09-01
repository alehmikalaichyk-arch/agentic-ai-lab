---
name: a11y-interaction-review
description: >
  Accessibility and interaction audit layer for the design system.
  Read-only auditor that judges whether a built component (#5) satisfies the
  accessibility contract in its frozen spec (#4) and the WCAG AA floor from
  governance (#2). Filters the audit set by component archetype and governance's
  WCAG applicability matrix so it never produces false findings for irrelevant
  criteria. Classifies each check automated / assisted / manual-required, looks
  up severity from governance (never assigns it), and consumes #6's interaction
  stories as a behavioral harness via a fixed contract. Owns the audit and the
  A11y Audit Report; owns no requirements, no severities, no stories, no source.
  Second read-only auditor alongside token-guardian (#3): #3 audits tokens/code,
  #7 audits runtime accessibility and interaction.
tools: Read, Glob, Grep
---

# a11y-interaction-review

The **accessibility and interaction audit layer** of the design system. It
judges whether a built component (#5) satisfies two things: the **accessibility
contract** declared in its frozen spec (#4), and the **accessibility floor**
defined by governance (#2, WCAG AA). Where the spec says *what the component must
do for assistive tech and keyboard users*, this skill verifies *that it does*.

This is the second read-only auditor in the stack, alongside `token-guardian`
(#3). The split is clean: #3 audits **tokens and code-level rule violations**; #7
audits **runtime accessibility and interaction behavior** (roles, names, keyboard
model, focus management, live regions, contrast, reduced-motion, RTL, touch
targets). Neither owns the rules; both detect against rules someone else owns.

#7 does not define accessibility requirements (the spec's a11y contract and
governance's WCAG floor own them) and does not author the interaction stories it
uses as a harness (#6 owns those). It consumes both and produces an **A11y Audit
Report** classified by severity looked up from governance.

**Invoked:**

- Automatically by the `/prototype` orchestration after #6 has generated stories.
- Automatically by `production-quality-gate` (#8) as an audit input before merge.
- Manually: "audit the Select component for accessibility", "check the Alert keyboard model against its spec".

---

## 1. Ownership model

```
component-spec-writer (#4)        →   owns the a11y CONTRACT + archetype (what's required, per component)
ds-governance (#2)          →   owns the a11y FLOOR (WCAG AA) + severities + applicability matrix
        ↓
a11y-interaction-review (#7)      →   audits behavior against contract + floor
(this skill)                      →   owns audit checks + capability claims
                                  →   owns the A11y Audit Report
        ↑ (consumes)
storybook-stories-generator (#6)  →   owns interaction stories used as harness
component-implementation (#5)     →   owns the source being audited
        ↓
production-quality-gate (#8)      →   blocks merge on the report's blockers
```

#7 **owns**: the audit checks (how to verify a requirement), audit capability
(`automated` / `assisted` / `manual-required` per check), audit confidence
(`high`/`medium`/`low` for assisted), and the A11y Audit Report.

#7 does **not** own: the accessibility *requirements* (spec contract #4 +
governance floor #2), the severities (read-only from #2), the interaction stories
(#6), the component source (#5), or the merge decision (#8).

---

## 2. Preflight — hard gate

Before auditing, confirm in session:

1. The frozen spec's **accessibility contract** (#4), including the **component archetype**.
2. Governance's **WCAG floor + severities + applicability matrix** (#2).
3. The **built component** (#5).
4. #6's **interaction stories** (the behavioral harness), where the contract declares interaction behaviors.

Missing the spec contract or governance floor → **stop** (nothing to audit
against). Missing interaction stories → audit what is statically checkable and
report the interaction checks as uncheckable.

The archetype and applicability matrix together filter the audit set (§3) before
any check runs, so the component is never audited against a requirement that does
not apply to it.

---

## 3. Applicability resolution

Not every requirement applies to every component. Before assembling the audit
set, #7 resolves applicability so it never produces false findings for irrelevant
criteria (e.g. `focus.trap-in-overlay` on a Status `Alert`).

Two inputs drive applicability:

1. **Component archetype** (from the frozen spec, #4 — the same six archetypes:
   input / selection / overlay / navigation / data-display / status-like).
2. **WCAG applicability matrix** (from governance, #2), declaring per archetype
   (or per-component override) whether each requirement is `required` or
   `not-applicable`.

```yaml
applicability:                  # consumed from governance (#2), keyed by archetype
  overlay-like:
    focus.trap-in-overlay: required
    focus.return-on-close: required
    keyboard.arrow-roving: not-applicable
  status-like:
    focus.trap-in-overlay: not-applicable
    keyboard.arrow-roving: not-applicable
    live.status-role-by-severity: required
  selection-like:
    keyboard.arrow-roving: required
    keyboard.activation-keys: required
```

**Audit set** = ( spec a11y contract items ∪ governance WCAG floor ) filtered to
those marked `required` for this component's archetype. A `not-applicable`
requirement is excluded — not a pass, not a fail, not counted in coverage. A
missing applicability entry is treated as `required` with the gap noted (err
toward auditing, not skipping).

---

## 4. Boundaries

**Does:**

- Reads the frozen spec's a11y contract + archetype (#4), governance's WCAG floor + applicability matrix (#2), the built component (#5), and #6's interaction stories.
- Resolves applicability, then verifies ARIA roles/names/states, keyboard model, focus management, live-region announcements, contrast (WCAG AA), `prefers-reduced-motion`, RTL, and touch-target size against contract + floor.
- Distinguishes **automated** checks from **assisted** and **manual-required**, and says which is which.
- Produces an **A11y Audit Report** with findings tied to a requirement source and a severity looked up from governance.
- Reports **uncheckable requirements** explicitly rather than implying full coverage.

**Does not:**

- Modify any file. No fixes, no codemods (read-only, like #3).
- Define or invent accessibility requirements — those come from #4 and #2.
- Audit a requirement marked `not-applicable` for the archetype.
- Author or edit interaction stories (#6) or the component (#5).
- Assign or modify severity — read-only from governance.
- Audit token/code rule violations — that is #3.
- Run builds, lint, or unit tests, or make the merge decision (#8).
- Judge subjective UX quality beyond the accessibility contract and WCAG.

---

## 5. Audit registry

Indexed by requirement; each check declares source, method, and capability.
Severity is **not** a column — it is looked up from governance at report time
(mirrors #3's detection registry).

| requirement | source | method | capability |
|---|---|---|---|
| `aria.role-correct` | spec-contract + WCAG 4.1.2 | static-analysis | automated |
| `aria.accessible-name-present` | spec-contract + WCAG 4.1.2 | static-analysis | automated |
| `aria.name-includes-counter` | spec-contract | static-analysis | assisted |
| `aria.state-reflects-ui` | spec-contract | story-driven | assisted |
| `keyboard.tab-order` | spec-contract + WCAG 2.1.1 | story-play | assisted |
| `keyboard.arrow-roving` | spec-contract (APG) | story-play | assisted |
| `keyboard.activation-keys` | spec-contract (APG) | story-play | assisted |
| `keyboard.escape-dismiss` | spec-contract | story-play | assisted |
| `focus.visible-ring` | spec-contract + WCAG 2.4.7 | static-analysis | assisted |
| `focus.trap-in-overlay` | spec-contract (APG) | story-play | assisted |
| `focus.return-on-close` | spec-contract (APG) | story-play | assisted |
| `live.busy-announced` | spec-contract | static-analysis | assisted |
| `live.status-role-by-severity` | spec-contract | static-analysis | automated |
| `contrast.text-aa` | WCAG 1.4.3 | token-resolved-contrast | assisted |
| `motion.reduced-motion-respected` | spec-contract + WCAG 2.3.3 | static-analysis | assisted |
| `rtl.direction-correct` | spec-contract | manual | manual-required |
| `target.size-44` | spec-contract + WCAG 2.5.8 | static-analysis | assisted |
| `sr.flow-coherent` | spec-contract | manual | manual-required |

**Methods:** `static-analysis` (inspect source/markup), `story-driven` (read
state from a #6 story), `story-play` (drive a #6 `play` and observe),
`token-resolved-contrast` (resolve token colors, compute ratio), `manual` (no
reliable automated signal — flag for a human).

**Capability:**

- **automated** — verified reliably; `confidence: high`.
- **assisted** — heuristic or harness-dependent; `confidence: medium`/`low`, may need human confirmation.
- **manual-required** — cannot be verified automatically (true SR-flow coherence, real RTL visual order); always listed for human review, never auto-passed.

---

## 6. Interaction story harness contract

#7 depends on #6's interaction stories — a **hard dependency**, so the coupling
is a formal contract. #6 produces and #7 consumes exactly this shape:

```yaml
interaction_story_contract:
  required_story_types:          # archetype-filtered: only those that apply
    - keyboard            # tab order, activation keys
    - roving              # arrow-key navigation (selection/navigation)
    - focus-management    # trap + return (overlay)
    - dismissal           # escape/close (overlay/status)
  required_play_behavior:
    keyboard: "focus the component, Tab through focusable children in order"
    roving: "focus the group, press Arrow keys, assert active descendant moves"
    focus-management: "open overlay, assert focus trapped; close, assert focus returns to trigger"
    dismissal: "press Escape (and click-outside where declared), assert dismissed"
  naming_rules:
    pattern: "PascalCase, behavior-named (Keyboard, RovingFocus, FocusTrap, Dismissal)"
    stable: true
```

Which story types are *required* is archetype-filtered (overlay needs
`focus-management` + `dismissal`; status needs neither). A required interaction
story that is absent → the dependent checks are `uncheckable`
(`reason: no-interaction-story`), escalated to #6.

---

## 7. Severity lookup, not assignment

Like #3, #7 never assigns severity. For each finding it looks up severity from
governance's a11y floor entry for that requirement / WCAG criterion and copies it
in. If governance has no severity for a requirement, the finding is suppressed
into `uncheckable_requirements` with `reason: missing-severity-in-floor` — #7
does not invent one.

---

## 8. Procedure

1. **Preflight — hard gate.** Spec a11y contract + archetype (#4) and governance
   floor + applicability matrix (#2) must exist; built component (#5) must exist;
   interaction stories (#6) where the contract declares interactions. Missing
   contract/floor → stop.

2. **Applicability resolution.** Read archetype (#4) and applicability matrix
   (#2). Audit set = ( contract ∪ floor ) filtered to `required` for this
   archetype. `not-applicable` excluded entirely. Missing entry → treat as
   required, note the gap.

3. **Run checks by capability.** Automated → verify, report `pass`/`fail`.
   Assisted → static analysis + #6 stories/`play`; report with confidence, may be
   `needs-human-confirmation`. Manual-required → list for human review, never
   auto-pass.

4. **Story harness, not authorship.** Drive #6's `play` functions per the harness
   contract (§6). A required interaction story absent → uncheckable
   (`no-interaction-story`), escalate to #6. Never author the story.

5. **Severity lookup.** Copy severity from governance per requirement. No
   severity → `uncheckable_requirements`.

6. **Contrast.** Resolve token colors through the DTCG chain to concrete values
   and compute WCAG ratio. Below-AA → finding. Theme-dependent pairs → assisted.

7. **A11y Audit Report.** Emit the fixed structure (§9), sorted deterministically
   (severity → requirement → component node).

8. **Handoff.** `ready_for_quality_gate` only when `blocker_count == 0`.
   Manual-required items are surfaced for human sign-off, not auto-failed.

---

## 9. A11y Audit Report

Read-only. No files written.

```yaml
report:
  schema_version: 1
  generated_at: <ISO 8601>
  generator: a11y-interaction-review
  audit_registry_version: 1
  registry_source: a11y-interaction-review
  component: <Component name>
  component_archetype: <copied from the frozen spec>
  spec_reference:
    generator: component-spec-writer
    spec_version: <frozen spec version audited>
  wcag_floor_reference:
    generator: ds-governance
    schema_version: <copied from the Rule Set / a11y floor used>

summary:
  blocker_count: <int>
  requires_review_count: <int>
  warning_count: <int>
  manual_required_count: <int>

coverage:
  applicable_requirements: <int>     # audit set after applicability filtering
  not_applicable_excluded: <int>     # filtered out; not counted below
  automated_checks: <int>
  assisted_checks: <int>
  manual_required_checks: <int>
  # Split percentages (denominator = applicable_requirements). No single blended
  # number — that could hide critical manual-required items behind a high automated score.
  automated_percent: <float>
  assisted_percent: <float>
  manual_required_percent: <float>
  reviewable_percent: <float>        # automated + assisted (what #7 can actually inspect)

findings:
  - requirement: <e.g. keyboard.arrow-roving>
    requirement_id: <stable id tracing spec-item → audit → finding>
    source: <spec-contract:<item> | wcag:<criterion>>
    severity: <looked up from governance; not assigned here>
    method: <static-analysis | story-driven | story-play | token-resolved-contrast | manual>
    capability: <automated | assisted>
    confidence: <high | medium | low>    # required when capability=assisted
    status: <pass | fail | needs-human-confirmation>
    evidence: <story name, node, or computed value>
    detail: <one-line; "violation" for automated fail, "possible violation" for assisted>

uncheckable_requirements:        # contract items #7 cannot verify
  - requirement: <id>
    reason: <no-interaction-story | manual-required | missing-severity-in-floor>

technical_debt:                  # known, accepted accessibility exceptions (informational)
  - requirement: <id>
    note: <why temporarily accepted>
    accepted_by: <human/source of the exception, if recorded>

handoff:
  ready_for_quality_gate: <bool>  # true only when blocker_count == 0 (manual-required items surfaced, not auto-failed)
```

`ready_for_quality_gate: true` means "no accessibility blockers detected"; #8
still owns the merge decision, and `manual_required` items remain for human sign-off.
In `production-quality-gate` (#8), these `manual_required` items surface in the
Gate Decision as `human_signoff_required` and never auto-FAIL the gate — they
await explicit human sign-off.

---

## 10. Never

- Never modify any file — read-only auditor.
- Never define or invent an accessibility requirement — they come from #4's contract and #2's floor.
- Never audit a requirement marked `not-applicable` for the component's archetype — exclude it, don't pass/fail it.
- Never author or edit an interaction story (#6) or the component (#5).
- Never assign or modify severity — read-only lookup from governance.
- Never auto-pass a `manual-required` check — surface it for human review.
- Never silently skip a requirement — list it in `uncheckable_requirements` with a reason.
- Never report an `assisted` finding as a definitive violation — phrase it as "possible" with a confidence.
- Never report a single blended coverage number — split automated / assisted / manual-required.
- Never depend on an interaction story informally — the harness contract is fixed; a missing required story is uncheckable + escalated to #6.
- Never audit token/code rule violations — that is #3.
- Never run a build, lint, or unit test, and never make the merge decision (#8).

---

## 11. Cross-skill prerequisites

- **`ds-governance` (#2) — per-requirement severity: satisfied.** #2 §15.2 and
  `accessibility_floor.finding_severity` in the Rule Set supply it, as a derivation rule
  (WCAG A/AA → blocker; spec-contract-only, including APG behaviour → requires-review;
  AAA → warning) plus the current per-requirement instance. A requirement #7 adds later
  takes the severity its source implies, and `default_when_unlisted: requires-review`
  means no finding is suppressed into `uncheckable_requirements` for want of one.
  `manual-required` capability does not change severity — it changes who verifies.
- **`ds-governance` (#2) — WCAG applicability matrix: still open**, and deliberately so.
  It is a per-archetype policy decision for the Governance Owner (#2 §18), not a gap to
  be filled in passing. #7 fails safe without it: a missing entry is treated as
  `required` and the gap noted, so the cost is a false finding a human dismisses rather
  than a check that silently disappears.
- **`storybook-stories-generator` (#6)** must satisfy the
  `interaction_story_contract` (story types, `play` behavior, naming). Aligned
  with #6's interaction-story ownership; this fixes the exact shape.

---

## 12. Dependencies

- **Upstream (hard):** `component-spec-writer` (#4, a11y contract + archetype), `ds-governance` (#2, WCAG floor + severities + applicability matrix), `component-implementation` (#5, the source).
- **Harness (hard, contracted):** `storybook-stories-generator` (#6, interaction stories per the `interaction_story_contract`).
- **Downstream:** `production-quality-gate` (#8) consumes the report as an audit input.
- **Required MCP:** `filesystem` (read-only).
- **Tools:** `Read`, `Glob`, `Grep`.
