---
component: Input
spec_version: v1
spec_schema_version: 1
lifecycle: freeze_candidate
change_type: new_component
archetype: input-like
---

# Input Specification

> **`frozen` is a fact, not a field.** No agent and no person writes `lifecycle: frozen`. A spec
> is frozen by being merged to the main branch. `freeze_candidate` is a ceiling the spec must
> *earn* by passing every gate below — not a value assigned to satisfy an instruction.

## Provenance — what this spec is made of

| Source | Role |
|---|---|
| `docs/component-requirements/input.md` @ `ready-for-spec-authoring` | **Normative.** 13 requirements, CR-001…CR-013. Every one is mapped under CR traceability. |
| `badge.md`, present on `origin/main` | **Nearest frozen spec.** Section shape, the "contrast measured, not asserted" table, the neighbour-boundary table and the "verified zero" consumers habit are inherited from it. |
| `horizontal-stepper.md`, present on `origin/main` | Second precedent. D11 (no `contract:` block) and D12 (`fg-subtle` over `fg-subtlest` on the page surface) are inherited as decisions, not re-derived. |
| Governance Rule Set (#2), this session | §6 API conventions, §6.1 spread ordering, §10 accessibility floor — **as corrected on 2026-09-02**, see D9. |
| Context Snapshot (#1), this session | Token inventory, empty component inventory, Storybook conventions. |

**Precedent pool after the §7a exclusion: 2.** Both specs on `origin/main` were checked; neither
declares `deprecated` or `retired`, so neither is excluded.

**This is the first interactive component in the repository**, and the first with state, focus and
a keyboard contract. Badge and HorizontalStepper are both inert, so neither offers precedent for
the half of this spec that matters most.

## Purpose and boundary

Input accepts one short, single-line text value, and tells the user what the value is for and what
is wrong with it. It does not decide what is wrong.

Stated against every neighbour it could be confused with, because a boundary given as a single
pair is the one that gets crossed:

| Neighbour | Owns instead | The distinguishing question |
|---|---|---|
| Textarea | Multi-line prose, where the box grows | Does the value have line breaks in it? Then it is not an Input. |
| Select | A value chosen from a known set | Is the user *choosing* or *typing*? |
| Search field | A query that drives results elsewhere on the page | Does the value leave the form? |
| Numeric stepper | A quantity with increment affordances | Are there controls other than the caret? |

None of these four exists in this repository, so every row is a boundary drawn in the abstract —
recorded now so the first of them to ship has something to be consistent with, and honestly
labelled as untested rather than presented as a settled contract.

**What Input never does:** validate, format, mask, debounce, or decide when to show an error. It
renders the error it is told to render. See "DS versus product logic" in the brief.

## Deliberate decisions and rationale

### D1 — A new component, on grounds that are weak for a reason worth stating

Governance §7's decision tree asks in order whether an existing component covers the use case,
whether an existing variant does, and whether a composition of existing primitives does. All three
are *no*, and all three are no for the same trivial reason: the component inventory is empty and
the public barrel exports nothing. The tree is passed **vacuously**, not substantively.

Step 4 — a reusable pattern with a stable API — is the one with content, and it is unambiguously
yes. Governance §15 classifies a new component as **Requires Review** by the Governance Owner
regardless of how the tree was passed.

Recorded rather than glossed because "the decision tree was followed" would be true and
misleading: nothing was weighed against an alternative, because there were no alternatives.

### D2 — `size` shadows a native DOM attribute, and is kept anyway

`<input>` has a native `size` attribute — a number, the visible width in characters. A prop
`size: 'sm' | 'md'` declared over `React.InputHTMLAttributes<HTMLInputElement>` collides with it.

Unlike the RA-12 precedent that produced this rule (`role?: ChipRole` typechecked **silently**
because `AriaRole` ends in `| (string & {})`), this collision is **loud**: `'sm' | 'md'` is not
assignable to `number`, so TypeScript rejects it at the declaration. That difference is why the
resolution differs too — RA-12's case had to be renamed because nothing would have caught it.

**Decision: keep the name `size`, and `Omit` the native attribute** from the rest type. Grounds:

- `badge.md` already establishes `size` as this design system's name for the size axis. A second
  component calling the same axis something else is the cross-spec drift §8's consistency audit
  exists to catch.
- The native attribute being removed is one nothing in this repository uses, and whose behaviour
  (width in `ch` units) is superseded by the token-bound height and a fluid width.
- The collision is compile-visible, so the trade is made once here rather than rediscovered.

The cost, stated: a consumer who genuinely wants character-width sizing cannot get it through this
component. That is a real removal of a native capability, not a neutral rename.

### D3 — `surface.input-focused` is a dead state, so focus is carried by the border and a ring

Resolving the token aliases down to primitives (RA-11):

| Token | Resolved value |
|---|---|
| `surface-input` | `#ffffff` |
| `surface-input-focused` | `#ffffff` |

They are **byte-identical**. A focus treatment expressed through the fill would render nothing at
all — the state exists in the token layer and is invisible in the browser. This is precisely the
dead state RA-11 describes: a state token that resolves to the same primitive as its base is not a
state.

So focus is carried by the border and a 2px ring, and the fill is not bound to a focus value at
all.

**The ring binds the same token as the border, in whatever state the border is.** Focus is
signalled by the ring's *presence*, never by its hue:

| Situation | Border | Ring |
|---|---|---|
| focus | `outline-input-focused` | `outline-input-focused` |
| error + focus | `outline-input-error` | `outline-input-error` |

**This reverses the draft's first decision, on the owner's review — 2026-09-02.** The spec
originally bound the ring to `outline-focus` (`#099468`), the design system's dedicated
component-agnostic focus token, on the reasoning that a component binding anything else makes its
focus an exception. Rendered, that produced a **green ring around a blue border**, and the owner
rejected it. Recorded rather than quietly rewritten: this is the decision the stage #4.5 draft
exists to catch, and it was caught by looking, not by argument. Prose could not have settled it —
both tokens were, and remain, the token named for exactly the role it was given.

The change **improves** the measurement rather than trading it away: the ring goes from 3.85:1 to
**6.45:1** against the field, and from 3.66:1 to **6.11:1** against the page.

**Why the rule extends to error + focus, which the owner did not explicitly ask about.** Their
instruction removes a second hue from the focus indicator. Applying it only to the plain focus
state would leave error+focus as the one place a second hue survives — a blue ring hugging a red
border, which measure **1.35:1 against each other**, so the boundary between ring and border would
be the muddiest edge in the component. Extending the rule is the reading that serves the
instruction; a narrow reading would preserve exactly what it removed. Flagged in the draft so the
extension is reviewable rather than assumed.

`surface-input-hovered` (`#f7f9fc`) and `surface-input-disabled` (`#f0f2f7`) both differ from the
base and are live. Only the focused fill is dead.

**Two escalations to `ds-governance` (#2), both non-blocking:**

1. `surface.input-focused` should take a distinct value or be removed. Shipping a token that
   resolves to its own base invites the next component to bind it and render nothing.
2. **`outline-focus` is now bound by nothing.** The design system has a dedicated focus token that
   its first interactive component does not use, and the next component will face the same choice
   with the same answer. That is how a system drifts into per-component focus colours. The likely
   fix is at the token layer — re-point `outline-focus` to the blue — not in each component's
   spec. Raised now, while there is exactly one component to reconcile.

### D4 — The resting border ships below AA, knowingly

Carried from the brief's OD-003, which the owner settled on 2026-09-02. `outline-input`
(`#c5c8d1`) against `surface-input` (`#ffffff`) is **1.67:1**, against the **3:1** WCAG 1.4.11 (AA)
requires for the visual information identifying a component's boundary. Governance §10 sets AA as
the floor, so this is a knowing exception to the design system's own standard.

There is no compliant neutral alternative to substitute: `outline-default` 1.25:1,
`outline-strong` 1.67:1, `outline-subtle` 1.12:1. The only passing neutral is
`outline-accent-grey-strong` (4.73:1), an **accent** role rather than a border role — binding it
here would be the semantic misuse governance §4 forbids by name, and would be a worse outcome than
the gap, because it would hide a palette problem inside one component.

What makes this survivable rather than merely accepted: the field is **not** identified by its
border alone. The label is always present (CR-001), and every state the user acts in — hover
4.20:1, focus 6.45:1, error 4.77:1 — clears the floor. The gap is confined to the resting state of
an unfocused field.

**Escalated to `ds-governance` (#2), non-blocking:** the entire neutral outline ramp is below 3:1.
This is a palette-level decision affecting every future component with a boundary, which is exactly
why it is not resolved inside the first one. A follow-up issue is owed before the implementation
PR merges — the brief records that obligation and this spec inherits it.

### D5 — Supporting text binds `fg-subtle`, inheriting D12 rather than re-deciding it

`horizontal-stepper.md` D12 already settled this for a component whose placement is the consumer's
choice: `fg-subtlest` measures 4.73:1 on `surface-default` and **4.49:1** on `surface-page`,
failing AA on one of the two page surfaces this palette ships. A form field's placement is likewise
the consumer's choice.

Supporting text and the label therefore bind `fg-subtle` (6.73:1 on the page surface). The
**placeholder** is the one exception and binds `fg-subtlest`: it renders *inside* the field, on
`surface-input` (`#ffffff`), where it measures 4.73:1 and passes. The distinction is which surface
the text actually sits on, not which text it is.

### D6 — No machine-readable `contract:` block

`component-spec-writer` §8d requires a normative schema document for the block, and states that
this kit ships none and that the schema must not be inferred from an existing spec. Both specs on
`origin/main` carry no block. This one carries none either.

Consequence for the pipeline is nil: `tools/classify-pr-diff.sh` reads paths, not YAML, so PR-1
classifies `SPEC_ONLY` with or without a block. Every fact here is enforced by human review and by
the required test facets below.

### D7 — The error message replaces the supporting text, in one node, with no live region

CR-007 requires the error to replace the supporting text rather than sit beside it. That is
rendered as **one description node** whose content is the error message when in error and the
supporting text otherwise. The node keeps a stable id across the swap, so `aria-describedby` never
has to be rewritten.

**No `role="alert"` and no live region**, and this was the contested part. The rejected
alternative was marking the description node `role="alert"` so an error announces the moment it
appears. Grounds for rejecting it:

- A field rendered *already* in error — a server-round-trip form, a restored draft — would
  announce on mount, before the user has done anything.
- The brief's "DS versus product logic" gives the consumer ownership of *when* there is an error.
  Announcement timing is part of that, not part of the field.
- `aria-invalid` plus `aria-describedby` already makes the error reachable from the field, which is
  what CR-008 requires. CR-008 asks that the message be *available*, not that it interrupt.

A consumer that needs submit-time announcement owns a live region around the form. Recorded here so
that requirement is discovered now rather than in an a11y audit.

### D8 — The required indicator is decorative; the required state is the attribute

The visible marker (CR-005) is an asterisk rendered `aria-hidden`, bound to `fg-status-danger`. The
programmatic state comes from the native `required` attribute alone.

The rejected alternative was letting the asterisk into the accessible name, which produces names
like "Email asterisk" or, worse, "Email star" depending on the screen reader — a difference in
verbosity settings deciding what the field is called. Colour is never the only signal either: the
marker is a glyph, not a hue change, so it survives greyscale.

### D9 — Both heights clear the target-size floor, which was corrected to reach this conclusion

Governance §10 required **44×44 px** while §15.2 grounded `target.size-44` in **WCAG 2.5.8**, which
is the AA criterion and specifies **24×24 px**. The two disagreed, and 44×44 is WCAG 2.5.5, level
**AAA** — stricter than the AA floor §10 declares in the same section.

The Input brief's feasibility audit found this, and it was not academic: three of the four shared
control heights (30, 34, 40 px) failed the old floor, **including the default**, which made the
design system's own height scale unusable by the components its token descriptions name. The rule
was corrected on 2026-09-02 under governance §18; the citation was left unchanged, because the
citation was never the thing that was wrong.

Both sizes clear the corrected floor: `md` 40px and `sm` 34px, against 24. **This spec claims AA,
not AAA** — neither size would clear WCAG 2.5.5, and no target-size claim beyond AA is made.

Verified against the code, not quoted on trust (RA-13): the rule was read from the governance skill
after the correction, and the heights from the built token output.

### D10 — Height binds through `var()`, which is an accepted deviation and not an arbitrary value

`sd.config.mjs` lists `shared` in `UNPUBLISHED_GROUPS`, with the stated rationale that these are
"component-layer values consumed through `var()` by the component that owns them". The values reach
the built CSS as `--ds-shared-height-*` and publish **no Tailwind utility**. There is no `h-md` to
reach for; `var()` is the only channel, and it is the sanctioned one.

This sits one character away from `forbidden.tailwind-arbitrary-design-value` (governance §14.6),
which forbids `h-[40px]`. The distinction is that the bracket contains a **token reference**, not a
literal — the rule exists to stop a design value bypassing the token layer, and this does the
opposite.

Recorded under RA-7 as a documented deviation so that a `token-guardian` finding against the
bracket syntax is answered in advance rather than argued in review.

**No component token is introduced.** `tokens/component/input.json` exists and is an empty stub;
this spec does not fill it. Nothing here needs a value the semantic layer does not already carry,
and governance §15 makes a single-component token a Requires-Review item — a review this component
has no reason to spend (RA-10).

## Anatomy

```
  Label *                        ← label, required marker
┌──────────────────────────────┐
│ value or placeholder         │ ← field (the <input>)
└──────────────────────────────┘
  Supporting text OR error        ← description node, one at a time
```

- **Root** — a `<div>` wrapping the three parts. Owns no colour; carries layout only.
- **Label** — a `<label>` bound to the field by `htmlFor`. Always rendered. Contains the required
  marker when applicable.
- **Field** — the `<input type="text">`. Carries the surface, border, radius, height and padding.
- **Description** — one node below the field, rendered only when there is supporting text or an
  error. Referenced by `aria-describedby`.

## Public API

| Prop | Type | Default | Required | Notes |
|---|---|---|---|---|
| `label` | `string` | — | yes | Visible, and the accessible name. Not optional — see edge cases. |
| `value` | `string` | — | no | Controlled. Presence switches the component to controlled. |
| `defaultValue` | `string` | — | no | Uncontrolled initial value. |
| `onValueChange` | `(value: string) => void` | — | no | Fires on every edit, in both modes. |
| `placeholder` | `string` | — | no | Shown only while the field is empty. |
| `description` | `string` | — | no | Supporting text below the field. |
| `error` | `string` | — | no | Presence puts the field in the error state and replaces `description`. |
| `required` | `boolean` | `false` | no | Renders the marker and sets the native attribute. |
| `disabled` | `boolean` | `false` | no | Native attribute; removes the field from the tab order. |
| `size` | `'sm' \| 'md'` | `'md'` | no | `sm` is compact, `md` is regular. Native `size` is omitted — D2. |
| `className` | `string` | — | no | Merged through `cn()` onto the **root**, so a caller's utility wins for the same property. |
| `...rest` | `Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' \| 'value' \| 'defaultValue' \| 'onChange' \| 'disabled' \| 'required' \| 'placeholder'>` | — | no | Spread onto the **field**, **first**, before the component's own attributes — governance §6.1. |

`onChange` is omitted from the rest type alongside the props the component owns: two independent
change channels on one element is the ambiguity the controlled contract exists to remove.
`onValueChange` is the single channel, and it carries the value rather than the event, matching the
`defaultX` / `x` / `onXChange` shape governance §6 mandates.

**`className` lands on the root, `...rest` on the field.** These are different elements, and the
split is deliberate: a caller styling "the input" almost always means the block, while a caller
passing `autoComplete` or `inputMode` always means the control.

### Controlled / uncontrolled

Standard, per governance §6:

- **Uncontrolled** — `defaultValue` sets the initial value; the component owns it thereafter.
- **Controlled** — `value` is supplied; the component renders it and never stores its own.
- `onValueChange` fires identically in both.
- Passing both is a development-only warning, and `value` wins. Switching between modes across the
  component's life is out of contract.

The component forwards its ref to the `<input>`, not to the root — governance §6 makes ref
forwarding mandatory for DOM-like components, and the useful target is the focusable one.

## Variants and sizes

**No variant axis.** The error state is a state, not a variant — it is driven by data (`error`),
not chosen by the caller as an appearance.

| Size | Height token | Resolved | Type | Use |
|---|---|---|---|---|
| `md` | `shared-height-md` | 40px | `font-body-sm-default` | Regular. Standard forms. The default. |
| `sm` | `shared-height-sm` | 34px | `font-body-sm-default` | Compact. Table filter bars, editable cells. |

**Why `sm` and not `xs` for compact.** The scale offers 30, 34, 40 and 48. `md` is documented in
the token source as the default, which fixes the regular size. For compact, `sm` (34px) is the
adjacent step; `xs` (30px) is tighter than the brief's stated use cases need and would put the
first interactive component 6px from the corrected AA floor for no requirement. If a denser field
is ever needed, `xs` is available and adding it is an additive revision.

Both sizes share a type size. The height difference is carried by the box, not the text — a
compact field with smaller text would be a second, unrequested axis.

## States

| State | Field appearance | Behaviour |
|---|---|---|
| resting | `surface-input`, `outline-input` border | Editable. |
| hover | border → `outline-input-hovered`, fill → `surface-input-hovered` | Pointer only. Suppressed when disabled. |
| focus | border → `outline-input-focused`, 2px ring in the **same** token | Reached by pointer or keyboard; identical either way (CR-006). |
| error | border → `outline-input-error`; description shows the error | Still editable. |
| error + focus | border stays `outline-input-error`; the 2px ring is added in the **same** token | Both signals present: the error keeps its colour, focus is the ring's presence (D3). |
| disabled | fill → `surface-input-disabled`, border → `outline-input-disabled`, text → `fg-disabled` | Not editable, not focusable, skipped by Tab. No hover. |
| error + disabled | disabled appearance wins; the error message is **still rendered** | A disabled field can carry an error — a server-rejected value the user cannot currently edit is real. |

The last three rows answer the three combinations the brief flagged as unsettled under "States and
transitions". Each is decided here rather than left to #5.

**Focus is never conveyed by fill** — see D3.

## Behaviour

- Typing calls `onValueChange` with the new value on every edit.
- The placeholder is visible only while the value is empty, and is never a substitute for the
  label (CR-001, CR-003).
- Clicking the label focuses the field. This is native `<label for>` behaviour, not a click
  handler — a handler would also have to replicate the browser's caret placement (CR-002).
- The component performs no validation, no formatting and no trimming.

## Tokens

| Element | Token | Role |
|---|---|---|
| field fill, resting / focus | `surface-input` | background |
| field fill, hover | `surface-input-hovered` | background |
| field fill, disabled | `surface-input-disabled` | background |
| field border, resting | `outline-input` | 1px border — below AA, D4 |
| field border, hover | `outline-input-hovered` | 1px border |
| field border, focus | `outline-input-focused` | 1px border |
| field border, error | `outline-input-error` | 1px border |
| field border, disabled | `outline-input-disabled` | 1px border |
| focus ring | `outline-input-focused` / `outline-input-error` | 2px ring, offset 0 — always the border's current token (D3) |
| field height | `shared-height-md` / `shared-height-sm` | via `var()` — D10 |
| field radius | `radius-sm` | 4px, the Tailwind-published `radius-*` namespace |
| field horizontal padding | `spacing` scale (`px-3` / `px-2.5`) | Tailwind's numeric scale, derived from `--ds-spacing-unit` |
| value text | `fg-default` | text |
| placeholder text | `fg-subtlest` | text — on the field's own white surface, D5 |
| disabled text | `fg-disabled` | text |
| label | `fg-subtle` | text |
| supporting text | `fg-subtle` | text — D5 |
| error message | `fg-status-danger` | text |
| required marker | `fg-status-danger` | decorative glyph, `aria-hidden` |
| label / field / description type | `font-body-sm-default` | composite, so size, weight and line-height cannot drift apart |

`surface.input-focused` is deliberately **not bound** — it is a dead state (D3).

Reference tokens; never define them. No component token is introduced (D10).

## Accessibility contract

- **A11Y-001 — Name.** The accessible name is the visible label, via `<label for>` / `id`. The id
  is generated with `useId`, so two Inputs on one page never collide.
- **A11Y-002 — Role.** The native `textbox` role of `<input type="text">`. No `role` is set.
- **A11Y-003 — Required.** The native `required` attribute. The asterisk is `aria-hidden` and
  never reaches the name (D8).
- **A11Y-004 — Error.** `aria-invalid="true"` while `error` is set, and `aria-describedby` pointing
  at the description node. No live region (D7).
- **A11Y-005 — Description.** One node, one stable id, referenced whether it carries supporting
  text or the error. `aria-describedby` is absent entirely when there is neither.
- **A11Y-006 — Keyboard.** Tab in, Tab out. No key handling of the component's own; the field is a
  native text input and every editing key belongs to the browser.
- **A11Y-007 — Disabled.** The native `disabled` attribute, which removes the field from the tab
  order (CR-009). `aria-disabled` is **not** used: it would leave the field focusable, which is the
  opposite of the requirement.
- **A11Y-008 — Focus visibility.** Two simultaneous signals: a border colour change and a 2px ring,
  the ring in the border's own current token (D3). The ring is what makes focus visible in the
  error state, where the border colour is already spoken for — so focus is carried by the
  indicator's **presence and thickness**, never by hue alone, which is also what keeps it legible
  to a reader who cannot separate blue from red. Identical for pointer and keyboard entry — no
  `:focus-visible` narrowing, because CR-006 requires visible focus from *either* route.
- **A11Y-009 — Target size.** 40px and 34px against the AA floor of 24px (WCAG 2.5.8). AAA (2.5.5,
  44px) is **not** claimed — D9.
- **A11Y-010 — Colour is never the only signal.** The error carries a message in words, not only a
  red border. The required state carries a glyph, not only a colour.

**Contrast — measured, not asserted.** Computed from the built token output with the WCAG 2.x
relative-luminance formula:

| Element | Pair | Ratio | Floor | |
|---|---|---:|---|---|
| value text | `fg-default` on `surface-input` | 18.90:1 | 4.5 | pass |
| placeholder | `fg-subtlest` on `surface-input` | 4.73:1 | 4.5 | pass |
| label | `fg-subtle` on `surface-page` | 6.73:1 | 4.5 | pass |
| supporting text | `fg-subtle` on `surface-page` | 6.73:1 | 4.5 | pass |
| error message | `fg-status-danger` on `surface-page` | **4.52:1** | 4.5 | pass, by 0.02 |
| border, hover | `outline-input-hovered` on `surface-input` | 4.20:1 | 3.0 | pass |
| border, focus | `outline-input-focused` on `surface-input` | 6.45:1 | 3.0 | pass |
| border, error | `outline-input-error` on `surface-input` | 4.77:1 | 3.0 | pass |
| focus ring | `outline-input-focused` on `surface-input` | 6.45:1 | 3.0 | pass |
| focus ring | `outline-input-focused` on `surface-page` | 6.11:1 | 3.0 | pass |
| focus ring, in error | `outline-input-error` on `surface-page` | 4.52:1 | 3.0 | pass |
| **border, resting** | `outline-input` on `surface-input` | **1.67:1** | 3.0 | **fail — D4, accepted** |
| disabled text | `fg-disabled` on `surface-input-disabled` | 2.00:1 | — | exempt (1.4.3 excludes disabled) |

**The error message passes by 0.02.** `fg-status-danger` on `surface-page` is 4.52:1 against a
4.5:1 floor. Any darkening of the page surface or lightening of the danger foreground breaks it,
and nothing currently guards that. Named as a required test facet below rather than left to
chance.

**None of these pairs appears in `src/tokens.test.ts`** — neither in `PAIRS` nor in
`KNOWN_BELOW_AA`. The same gap `horizontal-stepper.md` D12 found for `fg-subtlest` on
`surface-page`. Adding them is a required test facet.

## Edge cases

| Category | Covered / not applicable | Behaviour |
|---|---|---|
| empty | covered | Empty value shows the placeholder if one is set, and nothing otherwise. An empty string is a legitimate value, never coerced to `undefined`. |
| loading | not applicable | The field has no async surface. A form awaiting data renders its own skeleton. |
| error | covered | See States and D7. An empty-string `error` is treated as **no error** — the same "empty text is absent text" rule `badge.md` establishes for `children`. |
| disabled | covered | See States. Combines with error. |
| read_only | not applicable | Out of scope by the brief's own non-goals. The native attribute is **not** passed through: it is omitted from the rest type only for the props the component owns, so `readOnly` does reach the field — but nothing in this spec styles it, so it renders as resting. Named so #5 does not read the silence as a licence to invent a treatment. |
| long_content | covered | A value longer than the field scrolls horizontally, native behaviour. A long **label** wraps to as many lines as it needs; the field does not move up to meet it. A long **error** wraps; the block grows. Nothing truncates. |
| large_dataset | not applicable | One value. |
| mobile | covered | The field is fluid-width and fills its container. No fixed width is set at any size; the container owns width. Height is unaffected by viewport. |

## Acceptance criteria

| # | Criterion | Covers |
|---|---|---|
| AC1 | The label renders visibly and is the field's accessible name | CR-001 |
| AC2 | Clicking the label moves focus into the field | CR-002 |
| AC3 | The placeholder is present when the value is empty and absent otherwise | CR-003 |
| AC4 | Supporting text renders below the field and is referenced by `aria-describedby` | CR-004 |
| AC5 | `required` renders an `aria-hidden` marker and sets the native attribute | CR-005 |
| AC6 | Focus renders both a border colour change and a 2px ring, identically for pointer and keyboard | CR-006 |
| AC7 | `error` changes the border token and replaces the supporting text in the same node | CR-007 |
| AC8 | `error` sets `aria-invalid` and the description node remains the `aria-describedby` target | CR-008 |
| AC9 | `disabled` prevents editing and removes the field from the tab order | CR-009 |
| AC10 | Controlled and uncontrolled both work; `onValueChange` fires in both | CR-010 |
| AC11 | A caller's `className` overrides the root's own utility for the same property | CR-011 |
| AC12 | `md` and `sm` resolve to their documented height tokens and are visually distinct | CR-012 |
| AC13 | Neither size sets a height literal; both bind `--ds-shared-height-*` | CR-013 |
| AC14 | `...rest` is spread before the component's own attributes, so `data-slot` cannot be taken over | governance §6.1 |

## Required test facets

Named here because a class-name assertion would not catch any of them:

1. **Rendered-box measurement** of both sizes in the browser project — `getBoundingClientRect`,
   not a class check. AC12 and AC13 are about pixels, and the `var()` binding is exactly the kind
   that compiles to nothing if the custom property is missing.
2. **Tab-order assertion** for the disabled field: Tab from a preceding control lands past it.
   `toBeDisabled()` alone does not prove tab-skipping.
3. **`expectNoAxeViolations`** from `src/a11y-test-utils.ts`, in resting, error and disabled states.
4. **Contrast pairs added to `src/tokens.test.ts`** — the eleven passing pairs into `PAIRS`, and
   `outline-input` on `surface-input` into `KNOWN_BELOW_AA` so D4's accepted gap cannot be
   silently "fixed" or silently worsened. The error-message pair at 4.52:1 goes in `PAIRS`, where
   its 0.02 margin becomes a failing test the day the palette moves.
5. **`toStrictEqual`**, not `toEqual`, for any pass-through invariant (RA-6).
6. **Dev-warning determinism** for the both-`value`-and-`defaultValue` case: `NODE_ENV`-gated,
   once per mount, plain `render()` → `toHaveBeenCalledTimes(1)` (RA-5).

## CR traceability

| Requirement | Spec section | Contract |
|---|---|---|
| CR-001 | Anatomy; Public API; Accessibility (A11Y-001) | — |
| CR-002 | Behaviour; Accessibility (A11Y-001) | — |
| CR-003 | Behaviour; Tokens; Edge cases (empty) | — |
| CR-004 | Anatomy; Accessibility (A11Y-005) | — |
| CR-005 | D8; Accessibility (A11Y-003) | — |
| CR-006 | D3; States; Accessibility (A11Y-008) | — |
| CR-007 | D7; States; Tokens | — |
| CR-008 | D7; Accessibility (A11Y-004) | — |
| CR-009 | States; Accessibility (A11Y-007) | — |
| CR-010 | Public API — Controlled / uncontrolled | — |
| CR-011 | Public API; Acceptance criteria AC11 | — |
| CR-012 | D2; Variants and sizes | — |
| CR-013 | D10; Variants and sizes; Tokens | — |

The `Contract` column is empty for every row because this spec carries no machine-readable contract
block (D6). Recorded as empty rather than removed: a column that vanishes reads as a claim that was
never made.

**OD identifiers deliberately do not appear in this map** (`component-spec-writer` §8c). OD-001
(the leading icon slot) is recorded under Non-goals; OD-003 is resolved in D4.

## Consumers

**None — verified zero.** No component source exists anywhere under `src/components/`, and
`src/index.ts` exports `{}`. There is no product application in this repository.

Verified by: `rg -n 'Input' src/ --glob '!*input*'` → **exactly one hit**, and it is not a
consumer: `src/stories/scales.stories.tsx:109` names Input inside an explanatory string about the
shared height scale ("what keeps a Button, an Input and a Select the same height"). The hit is
recorded rather than filtered out of the command, because a search whose output disagrees with the
claim beside it teaches the next reader to stop running the search. Corroborating: that story is
independent evidence the shared scale is understood in this repository as the control-height
scale — which is what CR-013 binds.

Also verified by `git ls-tree -r --name-only origin/main -- src/components/` → one `.gitkeep`.

Recorded as a verified zero rather than left blank: a blank Consumers section is indistinguishable
from an unchecked one, and an unchecked one is how a "sole consumer" claim turns out to be six
(RA-3).

## Non-goals

- **A leading icon slot.** The brief's OD-001, still the owner's decision. This repository ships no
  icon set, so adding one is a new runtime UI dependency and a Requires-Review item under
  governance §15 — a larger decision than the slot. Not in v1; adding it later is an additive
  revision.
- **Prefix and suffix slots.** Same reasoning, no requirement.
- **Read-only behaviour.** See edge cases for what this does and does not mean.
- **Maximum-length handling and character counting.** A separate component in the source system,
  and no requirement here.
- **Specialised field types** — email, password, number. Each carries its own keyboard, validation
  and accessibility contract; `type` is not exposed.
- **Sizes beyond `sm` and `md`.**
- **A success state.** `outline-input-success` exists in the token layer and nothing requires it. A
  token existing is not a requirement.

---

## Freeze gates — all must be true before `freeze_candidate`

- [x] anatomy complete
- [x] API complete
- [x] variants complete (no variant axis; recorded with the reason)
- [x] states complete (including the three combinations the brief left unsettled)
- [x] controlled/uncontrolled contract complete
- [x] accessibility complete
- [x] token references complete
- [x] edge cases complete
- [x] boundary contract complete
- [x] acceptance criteria complete

If any is false, the spec stays `draft` and PR-1 does not open. Advancing anyway turns the gate
into a formality — which is exactly what the field is read as evidence against.

```yaml
spec_status:
  schema_version: 1
  generated_at: 2026-09-02T00:00:00Z
  generator: component-spec-writer
  component: Input
  spec_version: v1
  spec_schema_version: 1
  lifecycle: freeze_candidate # the ceiling any author may write; `frozen` is what merging makes true
  change_type: new_component
  archetype: input-like
  precedent:
    nearest_frozen_spec: badge.md@v1
    precedent_pool_note: >
      Two specs are present on origin/main (badge.md, horizontal-stepper.md). The
      component-spec-writer §7a exclusion was run against both after `git fetch origin main`;
      neither declares deprecated or retired, so neither is excluded. Pool size after
      exclusion: 2. badge.md is nearest by section shape; horizontal-stepper.md is nearest
      for two specific decisions (D6, D5). Neither is nearest by archetype — both are inert,
      and this is the repository's first interactive component.
    inherited_from:
      - "section shape: Purpose and boundary / Anatomy / API / States / Tokens / Accessibility / Edge cases / Acceptance criteria / Consumers / Non-goals / Freeze gates — badge.md"
      - "'contrast measured, not asserted' as a required section with a ratio table — badge.md"
      - "the neighbour table stating a boundary against every confusable component, not one pair — badge.md"
      - "'verified zero' consumers with the search that verified it — badge.md"
      - "empty or whitespace-only text treated as absent — badge.md (applied to `error` here)"
      - "`size` as this design system's name for the size axis — badge.md"
      - "spread-first ordering asserted as an acceptance criterion — badge.md AC7"
      - "no contract: block — badge.md, horizontal-stepper.md D11, component-spec-writer §8d"
      - "fg-subtle over fg-subtlest for text on the page surface — horizontal-stepper.md D12"
      - "a non-blocking escalation for a contrast pair absent from both tokens.test.ts lists — horizontal-stepper.md D12"
    divergences:
      - "the rest type Omits native attributes, where badge.md keeps the wide React.HTMLAttributes — badge is inert (governance §6.2) and this component owns props that collide with native ones (D2)"
      - "className lands on the root while ...rest lands on the field, where badge.md puts both on its single rendered element — this component renders three elements and the two targets are genuinely different"
      - "a state binds a token its own base already resolves to, and is therefore left unbound — no precedent; surface.input-focused is dead (D3)"
      - "a bound token knowingly fails its WCAG floor, where badge.md's worst pair is 7.48:1 — the neutral outline ramp has no compliant member (D4)"
  rule_set_reference:
    generator: ds-governance
    schema_version: 1

freeze_requirements:
  anatomy_complete: true
  api_complete: true
  variants_complete: true                            # no variant axis; recorded with the reason
  states_complete: true
  controlled_uncontrolled_contract_complete: true
  accessibility_complete: true
  token_references_complete: true
  edge_cases_complete: true
  boundary_contract_complete: true
  acceptance_criteria_complete: true

edge_case_categories:
  empty: covered
  loading: not-applicable      # no async surface
  error: covered
  disabled: covered
  read_only: not-applicable    # out of scope by the brief; the silence is made explicit in Edge cases
  long_content: covered
  large_dataset: not-applicable
  mobile: covered

contradictions:
  - id: c1
    description: >
      CR-006 requires focus to be visually apparent, while surface.input-focused — the token named
      for exactly that role — resolves to #ffffff, byte-identical to surface.input.
    resolution: >
      Focus is carried by the border and a 2px ring in the SAME token, so the indicator adds no
      second hue: outline-input-focused when focused, outline-input-error when focused in error.
      The fill is not bound to a focus value at all, and the dead token is escalated to #2 rather
      than bound and rendered invisible (D3). Revised 2026-09-02 on the owner's review of the
      stage #4.5 draft, which rejected the original green ring on a blue border; the revision
      raises the ring from 3.85:1 to 6.45:1 against the field.
    status: resolved
  - id: c2
    description: >
      CR-007 requires the error state to be visually distinguished from the resting state, which
      presumes the resting state is itself visible; outline-input measures 1.67:1 against its own
      surface, below WCAG 1.4.11's 3:1.
    resolution: >
      Accepted as a knowing exception by the owner on 2026-09-02 (brief OD-003), and escalated to
      #2 as a palette-level finding covering the whole neutral outline ramp. Mitigated rather than
      hidden: the label is always present, and every state the user acts in clears the floor. The
      pair is added to KNOWN_BELOW_AA so it cannot change silently in either direction (D4).
    status: resolved
  - id: c3
    description: >
      CR-012 needs a size axis named consistently with badge.md, which uses `size`; <input> has a
      native `size` attribute of type number, so the prop collides with the rest type.
    resolution: >
      The name is kept and the native attribute is Omitted (D2). Unlike the RA-12 precedent the
      collision is compile-visible rather than silent, so the trade is made once at the
      declaration. The cost — character-width sizing is unreachable through this component — is
      stated rather than glossed.
    status: resolved
  - id: c4
    description: >
      CR-008 requires the error to be available to screen-reader users, which reads as an argument
      for role="alert"; the brief's DS-versus-product split gives the consumer ownership of when
      an error exists.
    resolution: >
      aria-invalid plus aria-describedby, no live region (D7). CR-008 asks that the message be
      reachable, not that it interrupt; role="alert" would announce on mount for a field rendered
      already in error. Submit-time announcement is a live region the consumer owns, recorded so
      the requirement is discovered now rather than in the a11y audit.
    status: resolved
  - id: c5
    description: >
      CR-013 forbids arbitrary fixed heights, while the only channel to the shared height scale is
      h-[var(--ds-shared-height-*)] — bracket syntax that governance §14.6 forbids for design
      values.
    resolution: >
      Recorded as a documented deviation under RA-7 (D10). The bracket contains a token reference,
      not a literal; §14.6 exists to stop a design value bypassing the token layer and this does
      the opposite. sd.config.mjs states var() as the sanctioned channel for UNPUBLISHED_GROUPS.
    status: resolved
  - id: c6
    description: >
      The brief left three state combinations unsettled — error+focus, error+disabled, and hover
      on a disabled field — while the freeze gates require states_complete.
    resolution: >
      All three are decided in States: the focus ring is added over a retained error border;
      disabled appearance wins over error but the message is still rendered; hover is suppressed
      when disabled. Decided here rather than deferred to #5, which is what states_complete means.
    status: resolved

cross_spec_consistency:
  - convention: "`size` is the name of the size axis"
    checked_against: badge.md@v1
    status: consistent
  - convention: "rest props spread first, component's own attributes after"
    checked_against: badge.md@v1, governance §6.1
    status: consistent
  - convention: "className merged through cn()"
    checked_against: badge.md@v1, governance §6, §14.5
    status: consistent
  - convention: "text on surface-page binds fg-subtle, not fg-subtlest"
    checked_against: horizontal-stepper.md@v1 D12
    status: consistent
  - convention: "no machine-readable contract: block"
    checked_against: badge.md@v1, horizontal-stepper.md@v1 D11
    status: consistent
  - convention: "empty text content is treated as absent content"
    checked_against: badge.md@v1
    status: consistent
  - convention: "the rest type is the wide React.HTMLAttributes, unnarrowed"
    checked_against: badge.md@v1, governance §6.2
    status: divergent
    resolution: >
      Governance §6.2's wide-rest-type rule is scoped to INERT components, and its stated grounds
      — inertness is a property of what the component provides, not a prohibition on the consumer
      — do not transfer to an interactive one. This component Omits the native props it owns
      (D2), which is the standard controlled-component narrowing rather than an attempt to
      guarantee behaviour. Recorded as divergent rather than consistent because the surface rule
      reads as universal and the next author should see why it was not applied.
  - convention: "the controlled contract is defaultX / x / onXChange"
    checked_against: governance §6
    status: consistent

open_questions: []
  # OD-001 (leading icon slot) was carried here from the brief as a non-blocking open decision and
  # is RESOLVED for v1 rather than left open: it is recorded under Non-goals as out of scope, and
  # adding it later is an additive revision. The owner's decision is still owed for a future
  # version; it is not owed for this one, and a spec that is complete without it does not need it.
  #
  # OD-003 (resting border contrast) is resolved in D4 by the owner's 2026-09-02 decision, and its
  # residue is carried as escalation 2 below rather than as an open question — a palette-level
  # finding is #2's to answer, not a question this spec is waiting on.

freeze_blockers: []
  # The brief's promotion was verified rather than assumed: docs/component-requirements/input.md
  # reads status: ready-for-spec-authoring, with OD-001 marked non-blocking and OD-002 retired.
  #
  # The obligation the brief recorded against retired OD-002 — that governance's 44x44 floor had to
  # be corrected before stages #7 and #8 — is DISCHARGED, not outstanding. The correction landed
  # 2026-09-02 under governance §18 and was verified by reading the rule after the edit (D9, RA-13).
  # Had it still been outstanding it would be a freeze blocker here, because a spec whose sizes a
  # live rule rejects is not buildable.

escalations:
  - target: ds-governance
    reason: needs-new-token
    blocking: false
    detail: >
      surface.input-focused resolves to #ffffff, byte-identical to its own base surface.input. It
      is a state token that expresses no state, and any component binding it renders nothing. It
      should take a distinct value or be removed. This spec leaves it unbound (D3).
  - target: ds-governance
    reason: needs-new-token
    blocking: false
    detail: >
      No neutral outline token meets WCAG 1.4.11's 3:1 against surface-input: outline-input
      1.67:1, outline-default 1.25:1, outline-strong 1.67:1, outline-subtle 1.12:1. The only
      passing neutral is outline-accent-grey-strong at 4.73:1, an accent role rather than a border
      role. Governance §10 sets AA as the floor, so every future component with a boundary
      inherits this gap. A palette-level decision, escalated rather than absorbed into the first
      component (D4).
  - target: ds-governance
    reason: rule-conflict
    blocking: false
    detail: >
      outline-focus is bound by nothing. It is the design system's dedicated, component-agnostic
      focus token, and the repository's first interactive component does not use it: the owner
      reviewed the stage #4.5 draft on 2026-09-02 and rejected its green (#099468) ring against
      the blue (#04639a) focused border, so the ring now binds the border's own token (D3). The
      next interactive component faces the same choice and will reach the same answer, which is
      how a system drifts into per-component focus colours. The fix belongs at the token layer —
      re-point outline-focus to the blue, or state that field-like components own their focus
      colour — not in each component's spec. Raised while there is exactly one component to
      reconcile. Non-blocking: this spec is internally consistent and measures better than the
      version it replaces (ring 3.85:1 -> 6.45:1 against the field, 3.66:1 -> 6.11:1 against the
      page).
  - target: ds-governance
    reason: needs-new-rule
    blocking: false
    detail: >
      None of this component's measured contrast pairs appears in src/tokens.test.ts,
      neither in PAIRS nor in KNOWN_BELOW_AA — the same gap horizontal-stepper.md D12 recorded for
      fg-subtlest on surface-page. The lists are the repository's only mechanical guard on the
      palette, and a pair absent from both is unguarded in both directions. Adding this
      component's pairs is a required test facet; a rule that a spec's measured pairs must land in
      one of the two lists is the general fix.
```
