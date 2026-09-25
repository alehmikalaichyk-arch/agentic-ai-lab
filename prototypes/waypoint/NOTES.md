# waypoint

A dispatcher's shipment tracker — Today, Shipments, and a shipment's detail page —
rebuilt from [`reference.html`](reference.html) on the staging tier.

**The question this settles:** can the staging tier, bound to this design system's
tokens, carry a real operational screen **without a single new component** — and where
exactly does it fall short?

**Answer so far:** yes for the shell, the list, the filters, every loading / error /
empty state and the detail layout. It falls short in five places, listed below. None of
them blocked the screen; all five were built inline, which is precisely what makes them
evidence.

## What the screen is made of

Sidebar, Card, Table, Badge, Button, InputGroup, Select, Skeleton, Empty, Breadcrumb,
ToggleGroup, Sonner — all from `src/ui-staging/`, none modified. Every colour is a DS
token. The reference's own hex values, radii and type sizes are not carried over.

## Where the tier fell short — evidence for stage #0, not code to copy

The prototype zone's one rule applies: none of these moves into `src/` by being copied.
Each is a candidate for a requirements brief, with this screen as the demonstration.

1. **Status badge with a tone set and a dot.** Five statuses, each a surface/foreground
   pair plus a dot. `Badge` has no tones, so it is composed here. **This is the second
   prototype to build exactly this** — `status-board` was the first, and reached the same
   conclusion about the dot. Two independent screens needing the same thing is the
   strongest case in this list.
2. **Route path.** An ordered set of stops with passed / current / upcoming. The frozen
   `horizontal-stepper.md` spec explicitly says it is *"not a route"*, so this is a
   separate need rather than a reason to reuse that spec.
3. **Event timeline.** A time-ordered list of events, each with a tone.
4. **Stat card.** Label, value, hint, and an alert tone on the value. Built from `Card`
   with four class overrides — workable, but four overrides repeated four times is a
   component asking to exist.
5. **Key–value list.** The details panel is a hand-rolled `<dl>` grid.

## Faceted filtering on the Shipments list

Built from the faceted-list-filtering specification supplied on 2026-09-24 (not in this
repository — ask if it should be versioned here). The model is `filters.ts`, its
obligations are `filters.test.ts` (35 tests), the interface is `filter-bar.tsx`.

**The question it answers:** the spec says its dangerous facet kinds fail *silently* —
green tests, plausible screens. Does a prototype built strictly to it actually catch
them, and which of its rules survive in a screen with no backend?

All five facet kinds from §3 are present, because the two dangerous ones are the point:

| Facet | §3 kind | What it demonstrates |
|---|---|---|
| Status, Carrier, Route city | A enumerated | the ordinary case |
| Attention | B derived | the `delayed \|\| held` rule, which this prototype had written **twice** |
| Schedule | C discriminated | Expected / Delivered, both containing "Today" |
| Customer | D open | search against a directory larger than the list |
| Driver | E sentinel | "Unassigned" for a missing driver, OR-ed with named ones |

**Schedule is the one to open in a walkthrough.** Both groups have a value labelled
"Today". Selecting *Delivered · Today* returns one shipment, not the four others that are
also due today — because every sub-predicate is gated on the discriminant (§3.C). Drop
that gate and the screen still looks right. `filters.test.ts` asserts it directly.

**What does not apply here, and is not pretended.** §8.2 (predicate placement), §8.3
(binding vs interpolation) and §7 (pagination) assume a data store and a pager; this
screen filters an array of twelve rows. §9.5's "inspect the generated query" and §9.7's
pagination determinism go with them. All five are named in `filters.ts` and at the foot
of `filters.test.ts` rather than quietly skipped.

**What does apply, and surprised us:** §8.1 bracketing is not a SQL quirk. JavaScript's
`&&` binds tighter than `||` in exactly the same way, so a flattened composition widens
the result here too. The test writes the mutation out and asserts the widened set, which
is how it proves the correct assertion can see the defect at all.

**Two defects this prototype already had, both in the spec's catalogue:**

- **#16, return path loses the filter state.** Opening a shipment and coming back via the
  breadcrumb dropped every filter. The list state now travels into the detail route and
  back out. Navigating from the sidebar still opens the unfiltered list — that is a fresh
  visit, not a return.
- The `delayed || held` rule existed in two places (the sidebar badge and the Today
  table), which is the drift §3.B warns about. One definition now, called by both.

**Found by driving it, not by a test:** the first option row was a `<button>` containing
a Radix Checkbox, which renders a button of its own — nested buttons, reported in the
browser console and asserted on by nothing. It is a `<label>` now.

**Demo affordance:** typing `fail` into the Customer search produces the error state on
demand, so §3.D's three distinct states (loading, retryable error, no results) can be
shown in a walkthrough. A product would not have that.

**The rule row is a panel.** The page surface is grey, so the rules sit on a white
surface-default card with a border, matching the reference screen the owner supplied: the
chips, then a `+` that opens the same facet picker as the toolbar button, then *Clear
filters* on the right edge. The `+` always opens at the facet LIST — adding a rule is a
different intent from editing the one a chip already shows.

**What the staging tier still could not supply** — two more entries for the list below:
a segmented rule chip, and the two-level facet popover itself. Both were built inline.

## Differences from the reference — the design system wins each time

| Reference | Here | Why |
|---|---|---|
| Near-black primary (`#1f2937`) | Brand blue (`oslo-600`) | The DS brand token. Green until 2026-09-22. |
| Pill buttons and inputs (`999px`) | `radius-md`, 8px | What the staging Button and Input render with. There is no pill radius token. |
| Cards at 14px | `radius-card`, 10px | See the adapter fix below. |
| Status hex pairs | Accent `-subtlest` surface + `-boldest` foreground | On a soft accent surface only `-boldest` clears AA — the rule `status-board` recorded. |
| Whole table row is clickable | The shipment ID is the link | A clickable `<tr>` is mouse-only: not focusable, no key handling. Same destination, reachable by Tab. |
| Demo bar of text links, below the page | `ToggleGroup`, marked **Demo**, pinned to the bottom of the content column | Kept: in a walkthrough it is the fastest way to show every state was designed. Pinned because below the page it scrolled out of reach on long lists and jumped around on short states. |
| Hash routing | In-memory route state | Storybook renders the screen in an iframe it owns. Each state also has its own story. |
| Mobile: nav becomes a horizontal top bar | Nav becomes a sheet behind a trigger | What the staging Sidebar does. Not re-designed. |
| Letter-spacing `-0.01em` on headings | None | The DS publishes only `tracking-normal` and `tracking-wide`. |

## Found in the design system while building this

Two defects in `src/shadcn-adapter.css`, both affecting every staging component, both
invisible until a real screen was put together:

- **Borders rendered in the text colour.** Registry components write a bare `border` and
  rely on a base rule that `shadcn init` writes and this repository never ran. Without
  it Tailwind v4 falls back to `currentColor`. Fixed with a base-layer default border
  colour.
- **Cards rendered at 32px corners.** Registry `rounded-xl` lands on the DS's
  `--radius-xl`, which is 32px, not shadcn's ~14px. Fixed by binding the registry Card
  to the DS's own `--radius-card`.

Earlier catalogue screenshots showed the first defect and it was missed there. That is
the argument for building a real screen early.

## What this prototype is NOT

A design for a logistics product. Problem cases, Messages and New shipment are stubs,
exactly as they are in the reference. The data is fixed, and so is "today" —
16 September.
