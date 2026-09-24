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

## Differences from the reference — the design system wins each time

| Reference | Here | Why |
|---|---|---|
| Near-black primary (`#1f2937`) | Brand blue (`oslo-600`) | The DS brand token. Green until 2026-09-22. |
| Pill buttons and inputs (`999px`) | `radius-md`, 8px | What the staging Button and Input render with. There is no pill radius token. |
| Cards at 14px | `radius-card`, 10px | See the adapter fix below. |
| Status hex pairs | Accent `-subtlest` surface + `-boldest` foreground | On a soft accent surface only `-boldest` clears AA — the rule `status-board` recorded. |
| Whole table row is clickable | The shipment ID is the link | A clickable `<tr>` is mouse-only: not focusable, no key handling. Same destination, reachable by Tab. |
| Demo bar of text links | `ToggleGroup`, marked **Demo** | Kept: in a walkthrough it is the fastest way to show every state was designed. |
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
