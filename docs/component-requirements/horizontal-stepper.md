---
artifact: horizontal-stepper-brief
component: HorizontalStepper
status: draft
date: 2026-09-01
source_ask: two externally-authored documents from the pegbo design system, read as owner prose
consumers_today: []          # verified zero by repository search — see Consumer impact
consumers_candidate: []      # verified zero — this repository contains no product application
---

# HorizontalStepper — Component Requirements Brief

A user part-way through a multi-step flow needs one thing from the page chrome: where am I, and
how much is left. This brief covers a single, standard answer for linear flows — a line of
segments and a sentence — and nothing else.

The ask arrived as two documents written for a **different** design system. They are read here as
the owner's prose, not as a deliverable. Where they assert a repository fact, the audit checked it
against this repository and the audit's answer governs; where they record another organisation's
owner decision, that decision is surfaced for this repository's owner rather than inherited.

This brief covers a **new component**. A future Vertical Stepper is a separate component with a
separate brief; nothing here may be shaped to accommodate it in advance.

---

## Problem and purpose

A multi-step flow gives the user no sense of scale on its own. Each screen looks like the whole
task. Without a position indicator the user cannot tell a two-screen form from a six-screen one,
cannot judge whether to start now or later, and reads every "Next" as possibly the last.

The component exists to answer *where am I in this sequence* — cheaply, in a strip of chrome that
does not compete with the work on the page. It is a **read-only report of position**. It is not a
navigation control, and it does not report how far through the current screen the user is.

---

## Intended use cases

Linear flows where the user occupies exactly one step at a time, and the steps are known up front:
onboarding and first-run setup, multi-step forms and configuration flows, import and creation
wizards.

Not a fit: flows that branch, flows whose step count is discovered as the user goes, and long
workflows of a dozen or more stages.

**No such flow exists in this repository**, and that is not a footnote. The use cases above are
inherited from the ask, not observed here; this repository holds a design system and no product
application. They are therefore statements of *intended* use with no in-tree instance to check
them against — see Consumer impact, and OD-001.

---

## Strategy recommendation

Advisory. The component strategy is decided at the spec stage.

A **new component** is recommended — but the reasoning available here is not the reasoning the ask
gives, and the difference matters.

<!-- repo-audit:begin -->
> **[Repo audit 2026-09-01 · class S]** The source recommends a new component on the strength of
> having checked four neighbours and found none that fits: `progress-bar`,
> `status-distribution-bar`, `segmented-control` and `dot-indicator`. **None of those four exists
> in this repository.** `src/components/ui/` holds only `.gitkeep`, `src/index.ts` is `export {}`,
> and `find src/components -name '*.tsx'` returns 0 files. So the source's evidence cannot be
> reproduced and is not adopted.
>
> The recommendation survives on different grounds: there is nothing to extend. Steps 1–3 of
> governance §7's Component Creation Decision Tree ("does an existing component cover it", "an
> existing variant or prop", "a composition of existing primitives") all answer *no* trivially,
> because the set they range over is empty. That is a weaker justification than the source's, and
> it is recorded as weaker rather than dressed up: the decision tree's step 4 — "a reusable pattern
> with a stable API" — is a claim about the future in a repository with zero call sites. It is the
> substance of OD-001.
<!-- repo-audit:end -->

---

## Behavioural requirements

**CR-001 — Position is always stated in words.** The component always renders the current step
number and the total step count as text, whatever else it shows.

**CR-002 — One segment per step.** The indicator renders exactly as many segments as the flow has
steps, and the segments are equal in width regardless of how much work each step holds.

**CR-003 — Three step states are visually distinguishable.** A segment reads as completed, current,
or upcoming, and a user can tell the three apart without reading the step text.

**CR-004 — Position survives poor colour discrimination.** A user who cannot separate the three
segment states by colour still knows the current step and the total from the text alone.

**CR-005 — The current step may carry a label.** The component optionally shows a short name for
the step the user is on. The label is never required, and its absence is the preferred default.

**CR-006 — Only the current step is named.** The component never displays the names of the other
steps, whether or not the current step carries a label.

**CR-007 — A segment reports a step, not a fraction of one.** No segment is ever drawn partly
filled, and nothing in the component implies that the current step is a given percentage complete.

**CR-008 — Segments carry no navigation.** Segments are not operable: pointing at one, clicking it,
or reaching it by keyboard does nothing and changes no step.

**CR-009 — Both placements are first-class.** The component renders correctly above the page
content and below it, and carries no assumption that either is its home. The consumer chooses.

**CR-010 — Flow controls stay outside the component.** The component renders no Back, Next,
Continue, Finish, or Cancel control, and works when placed next to them.

**CR-011 — Two to six steps is the designed range, and no maximum is enforced.** The component is
designed for flows of two to six steps, and above that it keeps rendering with narrower segments
rather than refusing, warning, or changing shape.

**CR-012 — Under a narrow width, the position information survives.** When space runs short the
component keeps the current step number, the total, and the segmented indicator; the optional label
is what gives up space first.

**CR-013 — Content shape.** Without a label the component reads `Step {n} of {N}`. With a label it
reads that same sentence followed by a separator and the label.

**CR-014 — A label is a name, not a sentence.** The label names the current stage — a noun phrase
or a short action phrase — and never explains what to do on the step.

**CR-015 — The component sits below the page content in visual weight.** Its typography, colour and
size read as supporting chrome, never as the primary object on the screen.

**CR-016 — Excluded anatomy.** The component renders no numbered circles, no connector rules drawn
between steps, no card or container around an individual step, and no permanent row of every step's
label.

**CR-017 — A long label deforms nothing.** However long the label, the segmented indicator keeps its
shape, the step text stays inside the component's bounds, and the component's height does not change.

**CR-018 — The component adds no keyboard stop.** Moving through the page with the keyboard never
lands on the component or on any of its segments.

---

## States and transitions

Three step states, decided per segment against the current step:

| State | The user reads it as |
|---|---|
| Completed | a step already passed |
| Current | the step the user is on now |
| Upcoming | a step not yet reached |

The three must be distinguishable (CR-003) while staying inside the component's minimal character:
distinction is a matter of tone, not of added ornament. Nothing distinguishes a state by shape
change, added iconography, or a size difference between segments (CR-002, CR-016).

A step changes state only because the flow moved the user. The component itself never changes a
step's state, and no state ever encodes partial completion within a step (CR-007, and OD-002,
which is the one place that sentence is contested).

Whether the change between states is animated is undecided — OD-003.

---

## Interaction model

There is no interaction model. The component is inert: it does not respond to pointer input, holds
no keyboard focus, and exposes no operable part (CR-008, CR-018). Every transition the user sees is
a consequence of the flow's own controls, which live outside the component (CR-010).

Direct navigation from a segment is deliberately absent. Should a product flow later need it, that
is a distinct behavioural requirement to be brought, argued and specified on its own — never a
default that arrives with every instance.

<!-- repo-audit:begin -->
> **[Repo audit 2026-09-01 · class F]** This repository's governance names **steppers** explicitly
> in its inert-component set (`.claude/skills/ds-governance/SKILL.md` §6.2, line 168: "Dividers,
> progress bars, badges, status indicators and steppers are the usual members of that set"). The
> ask's inertness decision therefore agrees with a rule that already exists here, rather than
> arriving as a preference. §6.2 also bounds what the promise is: inertness is a property of *what
> the component provides*, not a prohibition on the consumer, so the requirements above are written
> as statements about what the component does — none of them claims a consumer cannot attach
> behaviour from outside. The already-shipped `badge.md` states the same boundary in its own
> accessibility contract, so there is one precedent for the wording.
<!-- repo-audit:end -->

---

## Content model

| Element | Required | Content |
|---|---|---|
| Step position | yes | The current step number and the total step count, as text (CR-001) |
| Segments | yes | One per step, equal width, no text inside (CR-002) |
| Current-step label | no | A short name for the current step only (CR-005, CR-006, CR-014) |

Correct label content: `Project Information`, `Trade Partners`, `Project Budget`, `Review`.
Incorrect: `Here you need to enter the total budget for your project` — an instruction, not a name
(CR-014).

---

## Accessibility intent

- A user always has the position in text, not only in the rendering of the segments (CR-001,
  CR-004). The optional label supplements the number and never replaces it (CR-005).
- The component reports a position in a sequence, not a quantity. A user of assistive technology
  must not be told that a magnitude is 75 per cent.
- Because the component is inert, it introduces no focus target, no focus order question, and no
  keyboard behaviour to define (CR-008, CR-018).
- The three segment states are a visual convenience layered on information the text already
  carries; no state's meaning is available only through its colour (CR-003, CR-004).

---

## Edge cases

| Case | Required behaviour |
|---|---|
| First step | The first segment reads as current; every other segment reads as upcoming |
| Final step | Every earlier segment reads as completed; the last reads as current. A state in which *every* segment reads as completed is not described in the ask and is not required here |
| Two steps | Renders with the same logic and the same proportions as any other count (CR-011) |
| Six steps | Same, with narrower segments; no segment collapses to nothing |
| Long label | The label yields space first; the indicator, the step text and the component's height are unaffected (CR-012, CR-017) |
| Narrow container, no label | Step text and full indicator both remain |
| Narrow container, long label | The label is constrained; the step text and the indicator are not (CR-012) |

---

## DS versus product logic

| Belongs to the design system | Belongs to the consumer |
|---|---|
| Rendering the segments and their three states | Knowing which step the user is on, and moving between steps |
| Rendering the position text and the optional label | Supplying the total, the current step, and the label text |
| Keeping the component inert and unfocusable | Validating a step before advancing |
| Behaving predictably at narrow widths | Choosing top or bottom placement, and composing Back / Next around it |

---

## Acceptance criteria

The component is right when, on a rendered screen:

1. A user identifies the current step and the total without reading any other part of the page.
2. Segment count equals step count, at two, four and six steps.
3. Completed, current and upcoming segments are tellable apart at a glance.
4. The component is correct and complete with no label supplied.
5. The component is correct and complete with a label supplied.
6. It renders correctly above page content and below page content, with no change of behaviour.
7. No part of it can be clicked, and tabbing through the page never stops on it.
8. It shows no labels other than the current step's.
9. A long label leaves the indicator, the step text and the component height untouched.
10. Nothing about it presumes a vertical arrangement.

Criterion 11 of the ask — "it reads as chrome, not as the subject of the page" (CR-015) — is
deliberately **not** in this list, because it cannot be judged here yet.

<!-- repo-audit:begin -->
> **[Repo audit 2026-09-01 · class F]** "Reads as chrome" is a *relative* judgement and this
> repository has nothing to judge it against: zero components are built. `ds-kit.config.yml` sets
> `a11y.measure_contrast_relative_to_shipped: true`, whose whole premise is a shipped baseline —
> and there is none. CR-015 stands as a requirement; it is the acceptance *criterion* that has no
> instrument. The first surface able to test it is the visual draft at stage #4.5, judged by eye
> against the repository's own token scales rather than against sibling components.
<!-- repo-audit:end -->

---

## Non-goals

- A Vertical Stepper, or any anatomy shaped to accommodate one later.
- The classic labelled stepper — numbered circles, connectors, every step named (CR-016).
- Navigation from a segment, in any form, in this version.
- Back / Next / Continue / Finish / Cancel controls (CR-010).
- Owning or validating the content of a step.
- Breadcrumbs, arbitrary progress bars, branching flows, and nested or sub-steps.
- Reporting progress *within* a step (CR-007, subject to OD-002).
- Flows of a dozen stages or more (CR-011).
- Migrating any existing implementation. There is none to migrate — see Consumer impact.

---

## Dependencies

None on another component, and none on a new runtime package.

<!-- repo-audit:begin -->
> **[Repo audit 2026-09-01 · class F]** Verified against `package.json`: this repository's runtime
> dependencies are exactly three — `class-variance-authority ^0.7.1`, `clsx ^2.1.1`,
> `tailwind-merge ^3.5.0`. No Radix, no icon set. Governance §15 makes a new runtime UI dependency
> a Requires-Review item. **Nothing in the requirements above implies one**: every requirement is
> satisfied by rendering text and rectangles, and CR-008/CR-018 remove the only reason a component
> of this kind normally reaches for a behavioural primitive. This is a checked absence of conflict,
> not an assumption. React is 19 (`^19.2.8`) and TypeScript 5.8.3.
<!-- repo-audit:end -->

---

## Open decisions

**OD-001 — The §15 Requires-Review approval.** *(Blocking.)* On two grounds, neither with local
precedent. Governance §15 classes both "New component" and "New component boundary
overlap" as Requires-Review, decided by the Governance Owner (§17: the role *Design System
Maintainer*). The ask records that decision being taken and granted — by a **different** design
system's Governance Owner, on 2026-08-31. It does not transfer. This repository's owner must grant
or decline it, and the boundary question is harder here than it was there, because §12 contains no
Stepper pair and none of the components a boundary would be drawn *against* exists. Options: (1)
approve the new component and record its boundary in the abstract, to be filled in when a neighbour
ships; (2) approve it and add the boundary pair to governance §12 first; (3) decline, on the
grounds that a component with zero in-tree consumers has not yet demonstrated the "reusable pattern
with a stable API" that decision-tree step 4 requires.

**OD-002 — Whether a segment may be drawn partly filled.** *(Blocking.)* The two input documents
contradict each other on this point and this repository's owner has not chosen between them. The
ask's requirements forbid a partly-filled segment; the ask's specification then fills the current
segment exactly half way and records its owner overriding that requirement on 2026-08-31, on the
reasoning that a constant half is a *marker of position* rather than a report of progress. **Until
the owner decides, this brief carries CR-007 as written** — no partial fill — because that is the
formulation the owner's requirements document states and the override belongs to someone else.
Blocking rather than deferred: the disputed sentence *is* the requirement, and #4 cannot specify a
segment's appearance while what CR-007 should say is undecided. Options: (1) keep CR-007 as
written; (2) make the same override here, in which case CR-007 is rewritten to permit a constant
half that no input may drive; (3) drop CR-007 and let the spec choose, which this brief does not
recommend — an unstated rule is how "half full" later becomes "42 per cent".

**OD-003 — Whether the change between step states is animated.** *(Non-blocking.)* An animated
transition is observable behaviour and therefore a promise this brief would owe, but the owner's
requirements never mention it — only the ask's specification does, which is a decision arriving one
stage late. Non-blocking because it changes no requirement above and can be settled at the spec
stage or at the visual draft. It carries a cost here that it did not carry there, recorded below.

<!-- repo-audit:begin -->
> **[Repo audit 2026-09-01 · class F]** Motion tokens exist in this repository but are **not
> published to Tailwind**. `generated/tokens.css` defines `--ds-motion-duration-instant/fast/
> medium/normal/slow` and four easings (lines 348–357), and `generated/tailwind-theme.css` contains
> **zero** occurrences of `motion`, `duration`, `ease`, `animate` or `transition` — its `@theme`
> block publishes only `color` (196), `text` (11), `leading` (11), `radius` (7), `font` (7),
> `shadow` (4), `tracking` (2) and `spacing` (1). So a duration utility named after
> `motion.duration-normal` is not a class that renders wrong; it is a class that does not exist.
> Answering OD-003 "yes" therefore requires either extending the token build's Tailwind emission or
> a design value with no utility behind it — the second is forbidden. This is a fact for the owner
> and for #4, not a decision this brief takes.
<!-- repo-audit:end -->

---

## Consumer impact

**Verified zero.** No consumer imports a stepper today, and no consumer could: this repository
contains a design system and no product application.

Recorded as a verified zero rather than left blank, because a blank section is indistinguishable
from an unchecked one.

<!-- repo-audit:begin -->
> **[Repo audit 2026-09-01 · class F]** Searched, not estimated. A repository-wide
> `grep -ril -E 'stepper|Step [0-9{]'` over `*.tsx *.ts *.css *.json *.md`, excluding
> `node_modules/` and `.git/`, returns 8 files: six are this pipeline's own documentation and skill
> definitions, one is `ds-pipeline-kit/repo-enforcement/docs/branch-protection-runbook.md`, and one
> is `src/styles.css` line 13 — a comment about token build *steps*, unrelated. **No call site, no
> hand-rolled implementation, no product surface.**
>
> The ask names three candidate consumers — a `customer-workspace` Create Project modal, a
> `spend-ui` onboarding modal, and a `client-ui` Mantine stepper. **None of the three exists here**;
> there is no `apps/` directory. Every finding the ask draws from them is therefore unavailable:
> the 5-px operable segments, the two-versus-three visual states of the reference screen, the
> `Step {n} of {N}` copy already shipping verbatim, and the precedent that a design-system component
> may own its own English string. That last one is a real loss — the ask justified component-owned
> copy by pointing at a `progress-bar` that formats its own value label, and **no such precedent
> exists here**. CR-013 states the content shape and nothing more; whether the component composes
> that sentence or receives it is a spec-stage decision with no local precedent to lean on.
<!-- repo-audit:end -->

---

## Audit history

Findings from the repository feasibility audit, dated and classed. Class F is a binding repository
fact; class C is a conflict for the owner; class S is an advisory recommendation. Findings already
placed in the section they bear on are not repeated here.

<!-- repo-audit:begin -->
> **[Repo audit 2026-09-01 · class F]** **The component does not exist, and neither does anything
> else.** `src/components/ui/` contains only `.gitkeep`; `find src/components -name '*.tsx'` returns
> 0; the barrel `src/index.ts` is `export {}` with a comment saying it stays that way until the
> first component lands. Checked against the barrel, not merely the filesystem.
>
> **[Repo audit 2026-09-01 · class F]** **Precision on "the first component".** The repository holds
> **one** merged spec — `docs/component-specs/badge.md`, present at `origin/main` — and **no**
> implementation of it. Badge is therefore ahead of HorizontalStepper in the pipeline and is the
> first component *specified*. HorizontalStepper would be the **second** spec, and the two are tied
> for first *built*, since nothing is built. Stated precisely because "this is the first component"
> is true of the build inventory and false of the spec inventory, and #4 picks precedent from the
> spec inventory.
>
> **[Repo audit 2026-09-01 · class F]** **`badge.md` is frozen, despite reading
> `lifecycle: freeze_candidate`.** A spec is frozen by presence on the main branch, and
> `git cat-file -e origin/main:docs/component-specs/badge.md` succeeds. Its own header says so. So
> precedent for this component comes **from `badge.md` or from nothing**, and it comes from
> `badge.md`: same archetype (`status-like`), same inert contract, and a worked pattern for
> Tokens / Accessibility contract / Edge cases / Consumers / Non-goals / Freeze gates. Two limits
> on that precedent: `badge.md` carries **no** machine-readable `contract:` block, so the ask's
> contract-block machinery has no local precedent; and Badge has no source file, so no precedent
> exists at the code layer at all.
>
> **[Repo audit 2026-09-01 · class F]** **Token prefix — the ask binds a namespace this repository
> does not have.** The source specification writes `--pegbo-*` in 9 places (7 distinct tokens;
> `--pegbo-fg-default` twice; one bare `--pegbo-*` in prose). This repository's namespace is `--ds`,
> set in `ds-kit.config.yml` as `tokens_namespace.css_prefix: "--ds"`, with 427 `--ds-*` custom
> properties in `generated/tokens.css`. **All seven bound tokens exist here under the new prefix**,
> each verified individually: `--ds-font-family-base` (:397), `--ds-font-size-md` (:407),
> `--ds-font-weight-regular` (:401), `--ds-line-height-md` (:418), `--ds-fg-default` (:147),
> `--ds-font-size-sm` (:406), `--ds-line-height-sm` (:417). The divergence is the **prefix only**;
> the brief adopts the repository's. Binding them is #4's job, not this brief's.
>
> **[Repo audit 2026-09-01 · class F]** **Two sibling specs the ask cites are absent.** Its
> *Format reference* is `docs/component-specs/switch.md` and its
> `precedent.nearest_frozen_spec` is `divider.md@v1.1`. Neither file exists here, nor does any of
> `progress-bar.md`, `pagination.md`, `segmented-control.md`, `status-distribution-bar.md`,
> `dot-indicator.md`, `tabs.md` or `breadcrumbs.md`. `docs/component-specs/` contains exactly one
> file. Every inherited-precedent line in the ask's `spec_status` block therefore points at nothing
> here, and #4 must not copy that block forward.
>
> **[Repo audit 2026-09-01 · class F]** **Governance §12 draws no boundary that reaches a stepper.**
> The section lists six pairs — Select/Multiselect, Select/SegmentedControl, Modal/Drawer,
> Tabs/SegmentedControl, Status/Badge, and the three-way Chip/Status/Badge. None involves a stepper,
> a progress bar, breadcrumbs or a pagination control. Worse for reuse: of the components §12 does
> name, **only Badge exists here**. So the boundary this component owes must be drawn without local
> precedent and against components that are not present — which is why the §15 boundary-overlap
> review is folded into OD-001 rather than treated as a formality.
>
> **[Repo audit 2026-09-01 · class F]** **Contrast re-measured against this repository's built
> tokens — and the ask's numbers reproduce exactly.** Computed with the WCAG 2.x relative-luminance
> formula from `generated/tokens.css`, not copied: fill `--ds-surface-accent-grey-boldest` `#2d3342`
> against track `--ds-surface-neutral-bold` `#e4e6ed` is **10.12:1**; fill against
> `--ds-surface-default` `#ffffff` is **12.62:1**; fill against `--ds-surface-page` `#f7f9fc` is
> **11.97:1**; track against white **1.25:1**; track against page **1.18:1**. Text pairs, which the
> ask did not measure: `--ds-fg-default` `#0d1119` on white **18.90:1** and on page **17.92:1**;
> `--ds-fg-subtle` **7.10:1** / **6.73:1**; `--ds-fg-subtlest` **4.73:1** / **4.49:1** — the last of
> which sits **below** the 4.5:1 AA floor on `surface-page` and is a real finding for #4 if a
> separator or any other element uses `fg-subtlest` as body text.
>
> The identity of the first five ratios is itself the finding: the two systems share the palette
> and differ in the prefix. The divergence in this line is therefore one of **provenance**, not of
> value — the ask's numbers are now *verified here* rather than *inherited*. Re-measuring was not
> wasted: it converted five assertions into five facts and produced three new ones.
>
> **[Repo audit 2026-09-01 · class F]** **The ask's Figma open decision does not transfer.** The
> source brief carries a non-blocking open decision about a Figma frame its owner named and that
> could not be retrieved. **This repository's ask names no Figma frame** — it is the two documents
> and nothing else. So there is no visual reference here at all, retrievable or not, and no open
> decision is minted for one. Consequence worth stating: nothing in this brief was derived from a
> picture, so nothing in it is exposed to a picture arriving later and contradicting it. The first
> visual anyone sees will be the draft at stage #4.5, which is generated *from* the spec rather than
> being an input to it.
>
> **[Repo audit 2026-09-01 · class F · audit limitation]** **This skill's own lint could not be
> run.** §13 requires `python3 scripts/design-system/validate-component-requirements.py --all` to
> pass before handoff. That path does not exist here: there is no `scripts/design-system/`
> directory, the only `.py` file in the repository is `ds-pipeline-kit/tools/scan.py`, and the only
> two references to the validator's name are the skill's own text and its copy under
> `ds-pipeline-kit/plugin/`. No `component-requirements-validate.yml` workflow exists either —
> `.github/workflows/` holds `ci.yml`, `pr-gates.yml`, `review-gate.yml` and
> `storybook-pages.yml`. **The mechanical floor described in §13 is absent in this repository**, so
> §12's prohibitions and §8's blocking marks are held by this document and its reviewer alone. This
> is reported rather than silently skipped: a brief that says nothing about an un-run gate reads as
> one that passed it. The repository audit itself is **complete** — the Context Snapshot (#1) and
> the Governance Rule Set (#2) were both available.
>
> **[Owner decision 2026-08-31 · NOT INHERITED]** The source specification's D11 records its owner
> overriding requirement CR-007 to permit a half-filled current segment. **That decision was taken
> by another design system's owner, for another design system, and this repository's owner has made
> no such decision.** It is surfaced as OD-002 with the brief's interim position stated, rather than
> folded into the requirements. Recorded here because inheriting it silently would import another
> organisation's judgement into this brief as though it were a fact — and because the ask's own two
> documents disagree, which is a property of the input the owner is entitled to see.
>
> **[Owner decisions 2026-08-31 · NOT INHERITED, list]** Three further decisions in the ask were
> taken by that same owner and are likewise not inherited, though none is contested enough to need
> its own open decision: the label defaults to absent (consistent with CR-005, adopted); no maximum
> step count is enforced (consistent with CR-011, adopted); and the reference screen keeps its own
> indicator with no migration shipping (**moot here** — there is no reference screen and nothing to
> migrate). Adopted where the requirement already says the same thing; named so that "the brief
> agrees" is distinguishable from "the brief inherited".
<!-- repo-audit:end -->
