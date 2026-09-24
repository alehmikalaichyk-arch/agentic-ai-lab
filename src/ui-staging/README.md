# src/ui-staging/

Components pulled from the shadcn registry, unmodified. **No spec, no tests, no stories,
no a11y audit.** They exist so that screen prototyping can start before the component
pipeline has produced enough components to prototype with.

This is a tier, not a dumping ground. The difference is that a component leaves it.

## Why this is not `src/components/ui/`

Not a matter of taste — that path is classified.

`tools/classify-pr-diff.sh` reads `src/components/**`, so anything landing there is
`COMPONENT_SOURCE`, and `require-document-on-base` then demands a frozen spec or a
retrofit addendum for that component **at the base commit of every PR that touches it**.
Not once at import — every time, forever.

Fifty-four un-specced components in the classified path would therefore mean a red gate
on every future PR that edits any of them. The cost is not the initial red check; it is
that a permanently red gate stops being a signal, so the day a *real* one fails, nobody
looks.

`src/ui-staging/` sits outside every classified path. The gates stay green, and they
stay meaningful. Nothing is being bypassed: these components are openly outside the
pipeline, which is the honest description of what they are.

## How a component leaves this tier

```
src/ui-staging/<name>.tsx  →  src/components/ui/<name>.tsx
```

That move is the only way in to the governed tier, and it happens **after** the
component has been through the pipeline — requirements, spec, human merge of PR-1, then
implementation. The staged file is a reference during that work, never the deliverable:
per the pipeline rule, a draft may seed appearance but not the public API, and the same
applies here.

Two consequences worth stating plainly:

- A component nobody promotes costs nothing. It sits here and works.
- Promotion is a visible event with a diff, rather than a claim that the spec debt was
  paid at some point.

## Colour, type and geometry

None of these files were edited to fit this design system. They are bound to it by
`src/shadcn-adapter.css`, which declares shadcn's ~30 role names (`background`,
`primary`, `muted-foreground`, `border`, `ring`, …) in terms of this repository's
semantic tokens.

Verified in the built stylesheet rather than assumed:

| Class | Resolves to |
|---|---|
| `bg-primary` | `var(--ds-surface-brand-bold)` |
| `bg-card` | `var(--ds-surface-default)` |
| `bg-popover` | `var(--ds-surface-raised)` |
| `text-muted-foreground` | `var(--ds-fg-subtle)` |
| `border-input` | `var(--ds-outline-input)` |
| `ring-ring` | `var(--ds-outline-focus)` |
| `rounded-md` | `var(--ds-radius-md)` |
| `text-sm` | `var(--ds-font-size-sm)` |
| `bg-red-500` | **nothing — the class does not exist** |

The last row is the one that matters. `--color-*: initial` in `src/styles.css` still
deletes Tailwind's built-in palette, and the adapter adds only named roles that each
resolve to a token. The primitive → semantic chain is intact; the adapter translates
on top of it and does not reach around it.

`prototypes/ui-staging-gallery/` renders that table as a picture, including a control
row that must stay unstyled.

## There is no barrel, deliberately

Import from the component's own path:

```tsx
import { Button } from '@/ui-staging/button';
```

A barrel here would re-export ~200 symbols and collide with the governed tier on the
first shared name — `Input` already exists in both. The explicit path is what tells a
reader, and a reviewer, which tier a screen was built from.

**Watch that one specifically:** `@/ui-staging/input` is the registry's input;
`src/components/ui/input.tsx` is the one with a frozen spec, tests and an a11y audit.
For a prototype either is fine. For anything that outlives the prototype, the governed
one is the point of the exercise.

## Re-running the CLI

`components.json` points `tailwind.css` at `src/shadcn-adapter.css` so the CLI writes
its variables into a file we own rather than into the ordered import chain in
`styles.css`. It has already injected raw `hsl()` sidebar values there once, and they
were removed. **Check `git diff src/shadcn-adapter.css` after every `shadcn add`** — a
colour literal in the adapter is the one thing that would turn this tier from
"outside the pipeline" into "around it".

The CLI also writes `from "cn"` instead of `from "@/lib/utils"` and installs an
unrelated npm package called `cn`. Both were corrected after the import. Expect to
repeat that on the next batch.
