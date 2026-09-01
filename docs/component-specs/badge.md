---
component: Badge
spec_version: v1
spec_schema_version: 1
lifecycle: freeze_candidate
change_type: new_component
archetype: status-like
---

# Badge Specification

> **`frozen` is a fact, not a field.** No agent and no person writes `lifecycle: frozen`. A spec
> is frozen by being merged to the main branch. `freeze_candidate` is a ceiling the spec must
> *earn* by passing every gate below — not a value assigned to satisfy an instruction.

## Purpose and boundary

Badge labels the **state of the thing it sits next to**, in one or two words, and does nothing
else. It is read, not operated.

Stated against every neighbour it could be confused with, because a boundary given as a single
pair is the one that gets crossed:

| Neighbour | Owns instead | The distinguishing question |
|---|---|---|
| Chip | A value the reader can *remove* — filters, recipients, tags | Does it have an affordance? Then it is not a Badge. |
| Button | An action | Does clicking it change anything? Then it is not a Badge. |
| Tag | Free-form categorisation the reader authored | Did the *system* decide this word, or the reader? |
| Toast | A transient message about an event | Does it disappear on its own? Then it is not a Badge. |

Badge is **inert**: nothing focusable, nothing clickable, no interactive state, and no prop that
enables interaction later. See the accessibility contract for exactly what that promises and what
it does not — governance §6.2 draws that line, and it is narrower than it first reads.

## Anatomy

```
┌─────────────────────┐
│  [dot]  label       │   dot: optional. label: required, the only content slot.
└─────────────────────┘
```

- **Root** — the rendered `<span>`. Carries the surface, the border radius and the padding.
- **Dot** — optional 6px circle before the label, inheriting the variant's foreground colour.
  Decorative: it repeats what the colour already says, for readers who cannot rely on hue alone.
- **Label** — `children`. Text only. A Badge containing an element is out of contract.

## Public API

| Prop | Type | Default | Required | Notes |
|---|---|---|---|---|
| `children` | `ReactNode` | — | yes | The label. Text; see edge cases for what happens when it is long. |
| `variant` | `'neutral' \| 'brand' \| 'positive' \| 'caution' \| 'critical'` | `'neutral'` | no | Semantic role, not a colour name. |
| `size` | `'sm' \| 'md'` | `'md'` | no | |
| `dot` | `boolean` | `false` | no | Renders the decorative dot. |
| `className` | `string` | — | no | Merged through `cn()`, so a caller's utility wins over the component's own for the same property. |
| `...rest` | `React.HTMLAttributes<HTMLSpanElement>` | — | no | Spread **first**, before the component's own attributes — governance §6.1. |

### Controlled / uncontrolled

**Not applicable — Badge holds no state.** Recorded explicitly rather than omitted: an empty
section reads as an oversight, and the next author adds a `defaultOpen` to be safe.

## Variants and sizes

| Variant | When to use |
|---|---|
| `neutral` | No judgement attached. Counts, categories, "Draft". |
| `brand` | Draws the eye without claiming anything is good or bad. "New", "Beta". |
| `positive` | A state the reader wants. "Active", "Paid", "Passed". |
| `caution` | A state that needs attention but is not a failure. "Pending", "Expiring". |
| `critical` | A failure or a block. "Failed", "Overdue", "Rejected". |

| Size | Height | Type | Padding |
|---|---|---|---|
| `sm` | 20px | `text-xs` / `font-weight-medium` | `px-2` |
| `md` | 24px | `text-sm` / `font-weight-medium` | `px-2.5` |

## States

| State | Appearance | Behaviour |
|---|---|---|
| default | The variant's subtle surface, its foreground, its border | The only state. |
| hover / focus / active / disabled | **Do not exist** | Badge is inert. A hover style would promise an affordance the component does not have. |

## Tokens

| Element | Token | Role |
|---|---|---|
| root surface, `neutral` | `surface-neutral-subtlest` | background |
| root surface, `brand` | `surface-brand-subtlest` | background |
| root surface, `positive` | `surface-status-success-subtlest` | background |
| root surface, `caution` | `surface-status-warning-subtlest` | background |
| root surface, `critical` | `surface-status-danger-subtlest` | background |
| label, `neutral` | `fg-subtle` | text |
| label, `brand` | `fg-brand-bold` | text |
| label, `positive` | `fg-status-success` | text |
| label, `caution` | `fg-status-warning` | text |
| label, `critical` | `fg-status-danger` | text |
| root border | `border-subtle` | 1px hairline, all variants |
| root radius | `radius-full` | pill |
| label type | `text-xs` / `text-sm` + `font-weight-medium` | per size |
| dot | `currentColor` | inherits the label colour, so a variant never needs a second token |

**On `fg-brand-bold` rather than `fg-brand`.** Both clear AA on `surface-brand-subtlest` (9.01:1
and 6.78:1), so this is a legibility margin choice, not a compliance one — and it is recorded
because the next author will otherwise "simplify" it to `fg-brand` and quietly spend the margin.

Reference tokens; never define them. A token that does not exist is a gap to escalate, not one
to invent.

## Accessibility contract

- **Role / accessible name:** none. A Badge renders a `<span>` with no role, because it labels
  the element beside it rather than being an element in its own right. Where the badge is the
  *only* carrier of a state a reader needs, the surrounding component owns announcing it — a
  requirement on the consumer, recorded here so it is not discovered later.
- **Keyboard:** not reachable. No `tabindex`, no key handling.
- **Focus ownership:** none. Badge never takes focus and never moves it.
- **Announcements:** none. Badge does not live-announce; a state that changes and must be heard
  belongs in a live region the consumer owns.
- **Colour is never the only signal.** Five variants differ by hue; `dot` exists so a reader who
  cannot use hue still gets a non-textual cue, and the label always carries the meaning in words.
- **Contrast:** measured, not asserted. Every variant's label-on-surface pair, against the shipped
  palette rather than in a vacuum:

  | Variant | Pair | Ratio | AA (4.5:1) |
  |---|---|---:|---|
  | `neutral` | `fg-subtle` on `surface-neutral-subtlest` | 6.84:1 | pass |
  | `brand` | `fg-brand-bold` on `surface-brand-subtlest` | 9.01:1 | pass |
  | `positive` | `fg-status-success` on `surface-status-success-subtlest` | 6.01:1 | pass |
  | `caution` | `fg-status-warning` on `surface-status-warning-subtlest` | 6.00:1 | pass |
  | `critical` | `fg-status-danger` on `surface-status-danger-subtlest` | 6.96:1 | pass |

  Worst pair 6.00:1, so a palette change has 1.5:1 of headroom before any variant fails.

**What "inert" does not promise** (governance §6.2): the rest type stays the wide
`React.HTMLAttributes<HTMLSpanElement>`. Badge provides no interactive behaviour and exposes no
prop to enable it; it does not prevent a consumer wrapping it in a `<button>` or attaching a
listener by `ref`. Neither is reachable from inside the component, so claiming otherwise would
describe a default as a guarantee.

## Edge cases

| Category | Covered / not applicable | Behaviour |
|---|---|---|
| empty | covered | `children` empty or whitespace → the component renders nothing at all (not an empty pill). An empty pill reads as a loading state that never resolves. |
| loading | not applicable | Badge has no async surface. A container awaiting data renders a skeleton in the Badge's place; that is the container's decision. |
| overflow | covered | The label does not wrap and does not truncate: `whitespace-nowrap`, no `max-width`. A Badge long enough to need truncation is a Badge being used as a Tag — the boundary above, not a rendering problem. |
| error | not applicable | No input to be invalid. `critical` is a *state the badge reports*, not an error state of the badge. |
| long word | covered | Same as overflow: the pill grows. Layouts that cannot afford that constrain their own container. |

## Acceptance criteria

| # | Criterion | Covers requirement |
|---|---|---|
| AC1 | Renders a `<span>` with no role, no `tabindex`, and no event handlers of its own | R1 |
| AC2 | Five variants each resolve to their semantic surface + foreground token pair, and no other | R2 |
| AC3 | Two sizes resolve to their documented type and padding | R3 |
| AC4 | `dot` renders a decorative circle marked `aria-hidden` | R4 |
| AC5 | Empty or whitespace-only `children` renders nothing | R5 |
| AC6 | `className` from a call site overrides the component's own utility for the same property | R6 |
| AC7 | `...rest` is spread before the component's own attributes, so `data-slot` cannot be taken over | R7 |
| AC8 | Every variant's label-on-surface contrast is at least 4.5:1 | R8 |

## Consumers

**None yet — this is the first component in the repository.** Recorded as a verified zero rather
than left blank: a blank Consumers section is indistinguishable from an unchecked one, and an
unchecked one is how a "sole consumer" claim turns out to be six.

Verified by: `rg -n 'Badge' src/ --glob '!*badge*'` → no matches at spec time.

## Non-goals

- **Removability.** That is Chip, and adding a remove affordance here would erase the boundary
  above rather than extend this component.
- **Interaction of any kind.** See States.
- **Icons in the label.** The dot is the only non-text element. An icon-bearing status indicator
  is a different component with a different accessibility contract.
- **Counts with their own formatting rules** (`99+`). The consumer formats the string; Badge
  renders what it is given.

---

## Freeze gates — all must be true before `freeze_candidate`

- [x] anatomy complete
- [x] API complete
- [x] variants complete
- [x] states complete
- [x] controlled/uncontrolled contract complete (recorded as not applicable, with the reason)
- [x] accessibility complete
- [x] token references complete
- [x] edge cases complete
- [x] boundary contract complete
- [x] acceptance criteria complete

If any is false, the spec stays `draft` and PR-1 does not open. Advancing anyway turns the gate
into a formality — which is exactly what the field is read as evidence against.
