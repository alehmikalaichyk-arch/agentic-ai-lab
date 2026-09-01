# agentic-ai-lab

A workbench for **agent-driven UI work**. Two things live here and they share a spine:

1. **A design system built through a governed component pipeline** — where the decision document
   is reviewed and merged by a human *before any code for it exists*.
2. **Prototyping** — faster, looser exploration that feeds the first one.

Every component here arrived through the pipeline. The pull requests are the demonstration —
read them in pairs.

---

## What is in here

| Path | What it is |
|---|---|
| `ds-pipeline-kit/` | The pipeline itself, vendored. Skills, the orchestrator, the write-time guard, the CI gates. Portable to any repository — see its [INSTALL.md](ds-pipeline-kit/INSTALL.md). |
| `ds-kit.config.yml` | The only file that binds the kit to *this* repository. Paths, branch, script names, check names. |
| `tokens/` | DTCG token sources. Primitive → semantic → component, in that order, with no shortcuts. |
| `generated/` | Built from `tokens/`. **Not committed** — every script that needs it runs `build:tokens` first. |
| `src/components/ui/` | Component source. |
| `docs/component-specs/` | The frozen specs. One per component, merged before its implementation. |
| `component-prototypes/` | Visual drafts — throwaway renderings the owner looks at *before* a spec is frozen. |
| `.github/workflows/` | CI, the three structural gates, the review gate, and Storybook publishing. |

## The shape of the process

```
  requirements brief          the ask, normalised and audited against this repository
        │
  spec  →  visual draft       the owner SEES it before the spec is frozen
        │
     ┌─────────── PR-1: the decision document, alone ───────────┐
     │  a human reviews and merges. no code exists yet.         │
     └──────────────────────────────────────────────────────────┘
        │
  implementation + tests   stories   accessibility
        │
  quality gate                       in a DIFFERENT session than the implementation
        │
     ┌─────────── PR-2: implementation ─────────────────────────┐
     └──────────────────────────────────────────────────────────┘
```

Two pull requests. One mandatory human checkpoint between the decision and the code.

**The gates enforce it rather than describing it.** `require-document-on-base` reads the *base
branch*, so a spec added in the same pull request as the implementation does not satisfy it. That
single property is what makes PR-1 a real checkpoint instead of a convention.

## Running it

```bash
npm install
npm run build:tokens     # generated/ is not committed; nothing works without this
npm run storybook        # http://localhost:6006
```

| Command | What it does |
|---|---|
| `npm run build:tokens` | Style Dictionary → `generated/{tokens.css,tokens.ts,tailwind-theme.css}` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint over `src/` |
| `npm test` | Vitest |
| `npm run build-storybook` | Static Storybook into `storybook-static/` |

## Tokens, and why the layering is strict

Three layers, and the boundary between them is enforced by what class exists rather than by
review:

- **`tokens/color/primitives.json`** — raw palette. `palette.neutral.900` and friends.
- **`tokens/color/semantic.json`** — roles. `fg.default`, `surface.brand-subtlest`,
  `border.focused`. Every value references a primitive and nothing else.
- **`tokens/component/`** — component-layer values that reference semantic tokens.

`sd.config.mjs` publishes the semantic layer to Tailwind and **withholds the primitives**, so
`bg-surface-brand-subtlest` is a real class and `bg-palette-brand-500` is not. A component
reaching past the semantic layer does not get a warning; it gets no class at all.

Two traps worth knowing before you add a token:

- **`-bold` means different things on different roles.** On a foreground role it means *darker
  text*; on a surface role it means *a strong fill that carries inverse text*. They are not
  symmetrical, and reading one as the other is the most common mistake here.
- **A soft accent surface needs the `-boldest` foreground.** Pairing `fg-accent-blue` with
  `surface-accent-blue-subtlest` does not reach AA; the `-boldest` step is what does.

The build fails rather than guesses: an unclassified token group, or two tokens publishing the
same Tailwind variable, both stop the build with a message naming the two.

## Reading the demonstration

Start with a component's spec in `docs/component-specs/`, then its implementation. The spec was
merged first — check the dates. What the spec settles that code cannot: the boundary against
neighbouring components, what each variant *means* rather than what colour it is, and the
accessibility contract with contrast measured rather than promised.

---

## Taking the pipeline to your own repository

`ds-pipeline-kit/` is self-contained and knows nothing about this repository beyond
`ds-kit.config.yml`. Start with [ds-pipeline-kit/QUICKSTART.md](ds-pipeline-kit/QUICKSTART.md),
which gets Level 1 running in about ten minutes, then
[INSTALL.md](ds-pipeline-kit/INSTALL.md) for the levels that actually enforce anything.

Each level states plainly what it enforces **and what it does not** — the gap between those two
is where processes quietly fail.
