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
| `variant` | `'neutral' \| 'info' \| 'positive' \| 'caution' \| 'critical'` | `'neutral'` | no | Semantic role, not a colour name. |
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
| `info` | Draws the eye without claiming anything is good or bad. "New", "Beta". |
| `positive` | A state the reader wants. "Active", "Paid", "Passed". |
| `caution` | A state that needs attention but is not a failure. "Pending", "Expiring". |
| `critical` | A failure or a block. "Failed", "Overdue", "Rejected". |

| Size | Height | Type | Padding |
|---|---|---|---|
| `sm` | 20px | `font-body-xs-moderate` | `px-2` |
| `md` | 24px | `font-body-sm-moderate` | `px-2.5` |

## States

| State | Appearance | Behaviour |
|---|---|---|
| default | The variant's subtle surface, its foreground, its border | The only state. |
| hover / focus / active / disabled | **Do not exist** | Badge is inert. A hover style would promise an affordance the component does not have. |

## Tokens

| Element | Token | Role |
|---|---|---|
| root surface, `neutral` | `surface-accent-grey-subtlest` | background |
| root surface, `info` | `surface-accent-blue-subtlest` | background |
| root surface, `positive` | `surface-accent-green-subtlest` | background |
| root surface, `caution` | `surface-accent-amber-subtlest` | background |
| root surface, `critical` | `surface-accent-red-subtlest` | background |
| label, `neutral` | `fg-accent-grey-boldest` | text |
| label, `info` | `fg-accent-blue-boldest` | text |
| label, `positive` | `fg-accent-green-boldest` | text |
| label, `caution` | `fg-accent-amber-boldest` | text |
| label, `critical` | `fg-accent-red-boldest` | text |
| root border | `outline-subtle` | 1px hairline, all variants |
| root radius | `radius-full` | pill |
| label type | `font-body-xs-moderate` / `font-body-sm-moderate` | per size; composite, so size, weight and line-height cannot drift apart |
| dot | `currentColor` | inherits the label colour, so a variant never needs a second token |

**Why every variant uses the `-boldest` foreground, and this is the most important line
in the spec.** On a soft accent surface, the *matching* foreground does not clear AA — measured
on this palette, `fg-accent-red` on `surface-accent-red-subtlest` is **3.12:1** and
`fg-accent-blue` on its own subtlest surface is **2.44:1**. The pairing that reads as obviously
correct is the one that fails. Only the `-boldest` step passes, and `src/tokens.test.ts` asserts
both directions so the rule cannot decay into folklore.

**`-boldest` does not mean "dark".** On a neutral surface role it is a light grey (`#c5c8d1`).
The suffix orders steps within a family; it makes no promise about lightness, and reading it as
one is how white text ends up on a light background.

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
  | `neutral` | `fg-accent-grey-boldest` on `surface-accent-grey-subtlest` | 16.87:1 | pass |
  | `info` | `fg-accent-blue-boldest` on `surface-accent-blue-subtlest` | 11.99:1 | pass |
  | `positive` | `fg-accent-green-boldest` on `surface-accent-green-subtlest` | 7.48:1 | pass |
  | `caution` | `fg-accent-amber-boldest` on `surface-accent-amber-subtlest` | 12.54:1 | pass |
  | `critical` | `fg-accent-red-boldest` on `surface-accent-red-subtlest` | 10.29:1 | pass |

  Worst pair 7.48:1 against a 4.5:1 floor. Measured from the built tokens, not copied from a
  palette document — `src/tokens.test.ts` recomputes the same pairs on every run.

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
