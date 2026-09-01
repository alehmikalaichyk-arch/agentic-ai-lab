# prototypes/

Throwaway screens, built to be looked at and argued with. **No spec, no gates, no
review round budget** — this directory sits outside every path the PR gates classify,
which was verified rather than assumed: a diff touching only `prototypes/` classifies
as `NONE`.

That freedom is the point, and so is its boundary.

## Why this is separate from the component pipeline

The two halves of this repository want opposite things.

The component pipeline is **deliberately slow**. A spec, a visual draft, a human merge
before a single line of implementation exists. That cost buys a component the whole
system will depend on for years.

Prototyping is **deliberately fast**. The value is in seeing a screen before the
requirements are settled, and in throwing away three of the four you build. A spec
before a prototype is a spec written about a thing nobody has looked at yet — which
is precisely the failure the pipeline's own visual-draft stage exists to prevent.

Run prototypes through the pipeline and they stop being prototypes. Loosen the
pipeline so prototypes fit, and there is no pipeline. So: two zones, one rule between
them.

## The one rule

**A prototype never becomes a component by being moved.**

When a prototype turns out to need a real component, that component enters at stage #0
with a requirements brief, like any other. What the prototype contributes is evidence —
the strongest kind the pipeline can receive, because the need was demonstrated rather
than predicted.

Copying `prototypes/x/thing.tsx` into `src/components/ui/` is the failure mode this
line exists to name. It skips the spec, the human checkpoint and the a11y contract,
and it does so invisibly: the file works.

## What a prototype may do

| May | May not |
|---|---|
| Use any design token | Add or change a token — that is a DS change, and it has its own path |
| Hardcode data, states, edge cases | Reach into `src/components/` and modify it |
| Render markup inline, badly, repeatedly | Be imported by anything under `src/` |
| Be deleted without ceremony | Be treated as a contract by anyone |

**Tokens are the shared spine.** A prototype using raw hex tells you nothing about
whether the palette works, which is half of what a prototype is for. Everything else
here can be scrappy.

## Layout

```
prototypes/
  <screen-name>/
    <screen-name>.stories.tsx   the screen, as a Storybook story
    data.ts                     hardcoded fixtures, if it needs any
    NOTES.md                    what question this prototype is answering
```

`NOTES.md` matters more than it looks. A prototype without a stated question gets
evaluated on whether it is *good*, which nobody can answer, instead of on whether it
*settles the thing it was built to settle*.

## Agents

| Agent | Owns |
|---|---|
| `product-manager` | WHAT and WHY: the user, the goal, which data belongs on the screen, action priority, states, what is out of scope |
| `ux-designer` | HOW it is arranged: layout, hierarchy, which tokens, what a component would have to be if one is needed |
| `frontend-engineer` | Building it |

Both of the first two are read-only. They produce a written spec of intent that the
engineer builds from — and when the two disagree, the disagreement surfaces before the
code rather than inside it.

## Seeing them

Prototypes render in the same Storybook as the design system, under the `Prototypes/`
heading, and publish with it:

```bash
npm run storybook
```

Sharing the Storybook is deliberate. A prototype next to the tokens it uses is a
prototype whose colour decisions can be checked at a glance.
