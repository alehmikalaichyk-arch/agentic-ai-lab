---
artifact: input-brief
component: Input
status: ready-for-spec-authoring
date: 2026-09-02
source_ask: owner prose, pasted in session 2026-09-02
consumers_today: []          # verified zero by repository search — see Consumer impact
consumers_candidate: []      # verified zero — this repository contains no product application
---

# Input — Component Requirements Brief

A single-line text field for short values. The ask is the owner's prose, read here as the ask and
not as a deliverable; where it asserts a fact about this repository, the audit checked it and the
audit's answer governs.

This brief covers a **new component**. The audit found two governance conflicts, both about whether
the component can be built to the design system's own accessibility floor using the tokens the
design system already has. The owner settled both on 2026-09-02 and the brief is promoted; the
decisions and what each one still owes are recorded under Open decisions and in the audit history.

---

## Problem and purpose

Every form needs somewhere to type a short value, and the design system currently has nowhere. The
component library is empty — no component ships today, and the public barrel exports nothing (see
Consumer impact). So this is not a gap in coverage: it is the first component, and whatever it
establishes about labelling, error association, sizing and state will be read as precedent by
everything after it.

The component exists to make one value enterable, and to say enough around that value — what it is
for, whether it is required, what went wrong — that the user is not guessing. It is a field, not a
form: it does not validate, and it does not decide what counts as an error.

---

## Intended use cases

Standard forms at the regular size; dense layouts at the compact size — table filter bars and
editable table cells are the two the ask names.

**No such surface exists in this repository**, and that is not a footnote. This repository holds a
design system and no product application, so the two dense-layout use cases are inherited from the
ask with nothing in-tree to check them against. They are statements of *intended* use. The
consequence is concrete rather than philosophical: the compact size's height cannot be validated
against a real table row here, which is part of why OD-002 is the owner's to settle and not the
spec author's.

---

## Strategy recommendation

Advisory. The component strategy is decided at the spec stage (#4).

A **new component** is recommended. The governance decision tree (§7) asks in order whether an
existing component covers the use case, whether an existing variant or prop does, and whether a
composition of existing primitives does. Here all three are *no* for the same trivial reason —
there are no existing components at all — so the tree is passed vacuously rather than
substantively, and that is worth saying plainly: the recommendation carries no evidence of reuse
having been considered against real alternatives, because there are none.

Step 4 is the one with content, and it is *yes*: a text field is a reusable pattern with a stable
API by any reading. Note that governance §15 classifies a new component as **Requires Review** by
the Governance Owner regardless.

---

## Behavioural requirements

**CR-001 — Visible label.** The field carries a label that is visible on screen, not only
available to assistive technology.

**CR-002 — Label activates the field.** Clicking or tapping the label moves focus into the field.

**CR-003 — Placeholder.** When the field is empty, a configured placeholder is displayed. It
disappears as soon as the field holds a value.

**CR-004 — Supporting text.** Supporting text can be displayed below the field.

**CR-005 — Required indicator.** A field marked required carries a visible indication that it is
required.

**CR-006 — Visible focus.** When the field has focus, that is visually apparent, whether focus
arrived by pointer or by keyboard.

**CR-007 — Error state.** In the error state the field is visually distinguished from its resting
appearance, and the error message takes the place of the supporting text rather than appearing
alongside it.

**CR-008 — Error is announced.** The error message is programmatically associated with the field,
so a screen-reader user encounters the two together rather than as unrelated text.

**CR-009 — Disabled.** A disabled field cannot be edited and is skipped in the tab order.

**CR-010 — Value ownership.** The field either manages its own value or displays a value the
consumer controls. Both work.

**CR-011 — Consumer styling is additive.** A class supplied by the consumer is applied without
removing the component's own base styling.

**CR-012 — Two sizes.** The component offers a regular size for standard forms and a shorter
compact size for dense layouts. The two are visually distinct.

**CR-013 — Sizes come from the shared height scale.** The two sizes take their heights from the
design system's existing shared control-height scale. The component introduces no height value of
its own.

---

## States and transitions

The ask names five states — resting, hover, focus, error, disabled — and settles what each looks
like relative to the others only through CR-006, CR-007 and CR-009. Three combinations it does not
settle, recorded here so the spec resolves them deliberately rather than by accident:

- **Error and focus together.** A field in error that the user then focuses. Which treatment wins,
  or whether they compose.
- **Error and disabled together.** Whether a disabled field can display an error at all.
- **Hover on a disabled field.** Whether the hover treatment is suppressed.

None of these is given a requirement number, because the ask does not state one and this brief may
not invent product intent. They are handed to #4 as decisions its spec must contain.

---

## Accessibility intent

Outcomes, not wiring:

- The field has a programmatic name derived from its visible label (CR-001, CR-002).
- Required state is conveyed programmatically, not by the visual indicator alone (CR-005).
- The error message is reachable from the field by assistive technology (CR-008).
- Focus is visible at the design system's WCAG AA floor (CR-006).
- A disabled field is not reachable by keyboard (CR-009).

The floor is governance's, not this brief's: **WCAG AA**. Two of these collided with what the
token set and the rules could express, and both were settled on 2026-09-02 — the target-size rule
was found to be citing the wrong criterion and is being corrected (retired OD-002, audit history
below); the resting border is a knowingly accepted gap (OD-003). A component built to this brief
is AA-conformant in every respect except the resting border's non-text contrast.

---

## Edge cases

- **Long label.** Behaviour when the label exceeds the field's width — wrap or truncate — is
  unsettled.
- **Long value.** A value longer than the visible field. Standard single-line scrolling is assumed
  and is not a requirement here.
- **Long error message.** The error replaces the supporting text (CR-007); whether the field's
  overall height is allowed to change as a result is unsettled.
- **No label.** The ask gives the label no opt-out. Whether a label is mandatory is a spec
  decision with an accessibility consequence.
- **Compact size in a table cell.** The compact size's stated purpose is an editable table cell,
  and there is no table in this repository to test it in.

---

## DS versus product logic

The design system owns the *presentation* of the error state and its association with the field.
The consumer owns *whether there is an error* — validation rules, when they run, and the message
text are the product's. The component is told it is in error; it does not decide.

The same split applies to required: the design system renders and conveys the required state; the
consumer decides which fields are required and enforces it on submit.

---

## Acceptance criteria

The owner judges the result by walking these, in a Storybook story per line where one exists:

1. The label is visible, and clicking it puts the caret in the field.
2. The placeholder shows when the field is empty and not otherwise.
3. Supporting text appears below the field.
4. A required field shows its indicator.
5. Focus is visibly distinct from resting, arriving by both mouse and Tab.
6. An error changes the field's appearance and replaces the supporting text.
7. A screen reader reaches the error message from the field.
8. A disabled field rejects typing and is skipped by Tab.
9. A consumer-controlled value and a self-managed value both work.
10. A consumer class is added without base styling disappearing.
11. Regular and compact are visually distinct.
12. Both heights resolve to `--ds-shared-height-*` values, with no height literal in the source.

Criterion 12 is stated against the CSS variable rather than a Tailwind utility deliberately — see
the audit finding on `UNPUBLISHED_GROUPS`.

---

## Non-goals

Recorded so a future proposal reopens a decision rather than a blank: sizes beyond regular and
compact; prefix and suffix slots; read-only behaviour; maximum-length handling and character
counting; specialised field types (email, password, number).

A **success state** is also a non-goal, and this one is not from the ask. The audit found that
`outline.input-success` already exists in the semantic layer. A token existing is not a
requirement, and v1 does not use it.

---

## Dependencies

- The shared control-height scale `shared.height` at xs, sm, md and lg — what CR-013 draws on.
- The `surface.input-*` and `outline.input-*` semantic colour tokens — the state palette CR-006,
  CR-007 and CR-009 are expressed in.
- The design system's class-composition helper — the channel CR-011 goes through, per
  governance §6.

---

## Open decisions

**OD-001 — Leading icon slot.** *(Non-blocking.)* The ask asks whether the field should support a
leading icon. This repository ships no icon set, so adding one is a new runtime UI dependency and
therefore a Requires-Review decision for the Governance Owner under governance §15 — a larger
decision than the slot itself. v1 proceeds without the slot; the decision is carried into the
spec's `open_questions` and does not hold up this brief.

**OD-003 — The resting border does not meet the contrast floor, and v1 ships that gap.**
*(Non-blocking — the owner settled this on 2026-09-02; the residue below travels into the spec's
`open_questions`, not into a requirement.)*

CR-007 requires the error state to be visually distinguished from the resting state, which
presumes the resting state is itself visible. Measured from the built token output,
`outline.input` (`#c5c8d1`) against `surface.input` (`#ffffff`) is **1.67:1** — below the **3:1**
that WCAG 1.4.11 (AA) requires for the visual information identifying a component's boundary.
There is no compliant neutral alternative: `outline.default` 1.25:1, `outline.strong` 1.67:1,
`outline.subtle` 1.12:1. The only passing neutral is `outline.accent-grey-strong` (`#6d7384`,
4.73:1), an accent role rather than a border role — using it here would be the semantic misuse
governance §4 forbids by name.

**Decision: option 1 — accept, and record the gap.** The component uses `outline.input` at rest
and is knowingly below AA in that one state. The rejected option was re-pointing the semantic
token to a darker neutral, which is a one-line token change in isolation but is not a small one in
consequence: `outline.input` is a semantic token, so governance §13 makes it regenerate the Figma
artifacts, §15 makes it a Governance Owner review, and it restyles every future component with a
boundary. That is a token-layer decision that should not be taken as a side effect of shipping the
first field.

**What this owes.** The token-layer fix is deferred, not dropped, and a deferral without a filed
issue becomes a loss. A follow-up issue is owed before the implementation PR merges, covering the
whole neutral outline ramp rather than `outline.input` alone. Until it lands, every component that
draws a boundary inherits the same gap — which is the argument for fixing it early, and is
recorded here so that argument survives the demo.

---

## Consumer impact

**Zero, verified by repository search** — the paths and their contents are named in the audit
history below. No component source exists anywhere in the package, the public barrel exports
nothing, and there is no product application in this repository. So there is no consumer to
migrate, no API to preserve, and no breaking-change surface. This is a greenfield component in the
strictest sense.

The absence cuts the other way too: nothing here will exercise the component after it ships except
its own stories and tests.

---

## Audit history

<!-- repo-audit:begin -->
> **[Repo audit 2026-09-02 · class F]** **The component does not exist, and neither does any
> other.** `src/components/ui/` contains a single `.gitkeep`; `src/components/` contains only that
> directory; `src/index.ts` is a deliberate empty barrel with a comment explaining that a barrel
> re-exporting a missing module fails typecheck. Consumers: zero, and the count is structural
> rather than incidental — this repository is a design system with no application in it.
>
> **[Repo audit 2026-09-02 · class F]** **The control-height scale the ask hedges on ("when
> available") exists.** `tokens/component/shared.json` defines `shared.height` at xs 30 px, sm
> 34 px, md 40 px, lg 48 px, and each `$description` names Input first: *"used by Input, Button,
> Select, Multiselect"*. So CR-013's condition resolves to *available*, and the hedge is removed
> from the requirement. Which two of the four the sizes take is left to #4 — subject to OD-002.
>
> **[Repo audit 2026-09-02 · class F]** **The scale publishes no Tailwind utility, by decision.**
> `sd.config.mjs` lists `shared` in `UNPUBLISHED_GROUPS` alongside `chart`, `chip`, `input`,
> `motion`, `z-index`, `layout` and `font`, with the stated rationale that these are
> *"component-layer values consumed through `var()` by the component that owns them"*. The values
> reach `generated/tokens.css` as `--ds-shared-height-xs|sm|md|lg` and stop there. Consequence for
> #4 and #5: there is no `h-md`-style utility to reach for, and the only channel is `var()`. Worth
> flagging because it sits close to governance §14.6, which forbids Tailwind arbitrary values for
> design-system values — the sanctioned `var()` form and the forbidden literal form are
> syntactically adjacent, and a token-guardian run will be looking at both.
>
> **[Repo audit 2026-09-02 · class F]** **A component-token namespace for Input already exists and
> is empty.** `tokens/component/input.json` is `{"input": {}}`, and `input` is already in
> `UNPUBLISHED_GROUPS`. The scaffolding is placed; nothing is in it. Governance §15 makes a
> component token introduced for a single component a Requires-Review item, so filling this file
> is a decision with review attached rather than a formality.
>
> **[Repo audit 2026-09-02 · class F]** **Ten input-specific semantic colour tokens already
> exist.** `surface.input`, `-hovered`, `-focused`, `-disabled`; `outline.input`, `-hovered`,
> `-focused`, `-error`, `-disabled`, `-success`. The state palette CR-006/CR-007/CR-009 need is
> largely pre-built, including an error outline. It also includes a **success** outline nothing in
> the ask requires — recorded in Non-goals so that its existence is not mistaken for intent.
>
> **[Repo audit 2026-09-02 · class C]** **Governance §10's 44 px target-size floor excludes three
> of the four shared heights, including the default.** xs 30, sm 34, md 40 all fail; only lg 48
> passes. §15.2 makes `target.size-44` a blocker. The same section grounds it in **WCAG 2.5.8**,
> which is AA and specifies **24×24 px**; 44×44 is **2.5.5**, level AAA, above the AA floor §10
> declares. All four heights pass 24 px. The audit reports the discrepancy and does not resolve
> it — correcting a governance rule is the Governance Owner's act under §18, not a brief's. Raised
> as **OD-002**, blocking by default per this skill's §10.
>
> **[Repo audit 2026-09-02 · class C]** **No neutral outline token in the system meets WCAG 1.4.11's
> 3:1 non-text contrast floor.** Computed from `generated/tokens.css` with the WCAG 2.x
> relative-luminance formula, against `surface.input` `#ffffff`: `outline.input` `#c5c8d1`
> **1.67:1**; `outline.default` `#e4e6ed` **1.25:1**; `outline.strong` `#c5c8d1` **1.67:1**;
> `outline.subtle` `#f0f2f7` **1.12:1**. The states that *do* pass are the ones carrying colour —
> `outline.input-focused` `#04639a` **6.45:1**, `outline.input-error` `#e31624` **4.77:1**,
> `outline.input-hovered` `#1582c1` **4.20:1**, `outline.focus` `#099468` **3.85:1**. So the field
> is compliant in every state except the one it spends most of its life in. `outline.input-disabled`
> at **1.12:1** is not part of the finding: 1.4.11 exempts inactive components. Raised as
> **OD-003**.
>
> **[Repo audit 2026-09-02 · class F]** **Supporting text has a compliant token and a
> non-compliant one, and they are adjacent.** `fg.subtlest` `#6d7384` measures **4.73:1** on
> `surface.input` `#ffffff` but only **4.49:1** on `surface.page` `#f7f9fc` — below the 4.5:1 AA
> floor of WCAG 1.4.3, on the surface a form actually sits on. `fg.subtle` `#51586b` measures
> **6.73:1** on page and is safe. Reported as a fact and not raised as an open decision, because a
> compliant option already exists and choosing between two tokens is a spec decision (#4), not an
> owner decision. `fg.status-danger` `#e31624` for the error message measures **4.52:1** on page
> and **4.77:1** on white — passing, with almost no margin on page.
>
> **[Repo audit 2026-09-02 · class F]** **Two of the ask's requirements are already governance
> rules, not product choices.** Governance §6 makes controlled/uncontrolled support *mandatory for
> all stateful components* (CR-010) and requires `className` always to be accepted and merged via
> `cn()` (CR-011). They keep their numbers — they are observable behaviours and the owner is
> entitled to state them — but #4 inherits them as rules whether or not this brief lists them, and
> a future change cannot drop them by revising the brief alone.
>
> **[Repo audit 2026-09-02 · class F]** **Stack, verified against `package.json`.** React 19.2.8,
> Tailwind 4.1.5 (CSS-first, no `tailwind.config.js`), Style Dictionary 4.3.3, Storybook 8.6.18
> (`@storybook/react-vite`), Vitest 4.1.7 with a browser project on Playwright Chromium, TypeScript
> 5.8.3. No Radix dependency is installed, despite `ds-context` §2 listing Radix as part of the
> fixed stack identity — a text field needs none, so this is recorded rather than raised.
>
> **[Repo audit 2026-09-02 · class F]** **Three files `ds-context` names as key paths are absent**,
> which is a §9 Warning tier rather than a finding against this ask: `components.json` (shadcn
> aliases unknown), `playwright.config.ts`, and `webpack.config.js`. Relatedly, governance §11's
> `ci_current` block lists `npm run test:e2e` under Playwright; `package.json` defines no such
> script. E2E acceptance for CR-009 will run through the Vitest browser project, which does exist.
>
> **[Repo audit 2026-09-02 · class F · audit limitation]** **This skill's own lint could not be
> run.** §13 requires `python3 scripts/design-system/validate-component-requirements.py --all` to
> pass before handoff. No `scripts/design-system/` directory exists in this repository and no such
> file exists anywhere in it; there is no `component-requirements-validate.yml` workflow either.
> The mechanical floor described in §13 is absent here, so §12's prohibitions and §8's blocking
> marks are held by this document and its reviewer alone. Reported rather than silently skipped: a
> brief that says nothing about an un-run gate reads as one that passed it.
>
> **The repository audit itself is complete.** The Context Snapshot (#1) and the Governance Rule
> Set (#2) were both produced in this session and consulted. The absent lint is a missing
> *mechanical* check, not a missing audit input.
>
> **[Owner decision 2026-09-02 · resolves OD-002 · identifier retired, not reused]** **The target-size
> conflict was resolved by correcting the rule, not the requirement.** Governance §10's 44×44 px
> floor and §15.2's `target.size-44` blocker cite **WCAG 2.5.8**, which is the AA criterion and
> specifies **24×24 px**. 44×44 is **WCAG 2.5.5**, level **AAA** — stricter than the AA floor §10
> itself declares two lines earlier. The owner accepted that the rule is citing the wrong criterion
> and chose option 2: escalate to the Governance Owner to correct the floor to 24×24, matching the
> criterion already named.
>
> Two consequences. First, **all four shared heights pass** (30, 34, 40, 48 ≥ 24), so the conflict
> is dissolved rather than traded away — the alternative on the table was taking both sizes from
> the compliant end, which would have made "compact" 48 px and left CR-012 with nothing to
> distinguish. Second, and this is the part that matters for the handoff: with the floor corrected,
> **which two heights the two sizes take is no longer governance-constrained**, so it reverts to an
> ordinary spec decision and belongs to `component-spec-writer` (#4). This brief does not assign
> them, and #4 should not read the retired OD as having assigned them either.
>
> **What this owes.** The governance correction is a §18 change procedure — proposal, Governance
> Owner review, edit to the rule, notification — and it is **not done yet**. Until it lands, a
> literal reading of §15.2 still fails any size below 48 px at stage #7 and stage #8. The decision
> is recorded; the edit is outstanding, and it is outstanding in a different repository surface
> than this brief, which is exactly the kind of gap that gets lost. It is named here so it is not.
>
> **[Owner decision 2026-09-02 · resolves OD-003 · identifier kept, now non-blocking]** **The
> resting-border contrast gap is accepted for v1** rather than fixed at the token layer. Rationale,
> the rejected alternative and the follow-up issue this owes are recorded with OD-003 above rather
> than duplicated here. Recorded as a decision and not as a finding, because the measurement is not
> in dispute — only what to do about it was.
<!-- repo-audit:end -->

---

## Promotion

**Promoted 2026-09-02.** No blocking open decision stands: OD-002 is resolved and retired, OD-003
is resolved and carries a non-blocking residue, and OD-001 was non-blocking throughout. The audit
is complete. `component-spec-writer` (#4) may consume this brief.

Two obligations travel with it, and neither blocks spec authoring:

1. **The governance floor correction is outstanding** (retired OD-002). A literal reading of the
   current rule still fails any size below 48 px at stages #7 and #8, so the correction has to land
   before the implementation reaches those gates.
2. **A follow-up issue for the neutral outline ramp is owed** (OD-003) before the implementation PR
   merges.

Both are carried into the spec's `open_questions`, where they may block the freeze. Changing any
active requirement after this point returns the brief to `draft` and invalidates the promotion.
