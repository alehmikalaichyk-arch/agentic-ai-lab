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
| `.claude/` | The pipeline **in effect here**: 10 skills, the orchestrator, the write-time guard, and the directory-triggered rule. Present on clone; no install step. |
| `ds-pipeline-kit/` | The same pipeline as a **portable kit**, as it would be handed to another repository. Skills, orchestrator, guard, CI gates, and its own [INSTALL.md](ds-pipeline-kit/INSTALL.md) / [QUICKSTART.md](ds-pipeline-kit/QUICKSTART.md). |
| `ds-kit.config.yml` | The only file that binds the kit to *this* repository. Paths, branch, script names, check names. |
| `tokens/` | DTCG token sources. Primitive → semantic → component, in that order, with no shortcuts. |
| `generated/` | Built from `tokens/`. **Not committed** — every script that needs it runs `build:tokens` first. |
| `src/components/ui/` | Component source. |
| `docs/component-specs/` | The frozen specs. One per component, merged before its implementation. |
| `component-prototypes/` | Visual drafts — throwaway renderings the owner looks at *before* a spec is frozen. |
| `.github/workflows/` | CI, the three structural gates, the review gate, and Storybook publishing. |

### Why the pipeline is here twice

`.claude/` and `ds-pipeline-kit/plugin/` hold the same ten skills and the same
orchestrator, and `tools/check-claude-dir-in-sync.sh` fails CI if they ever differ.

The kit is designed to install as a plugin, and a plugin has to be *installed* —
`claude plugin marketplace add` then `install`, once per machine, per person. Pointing
a `.claude/settings.json` at the vendored copy does not resolve; all three path forms
were tried. So a fresh clone would have the whole pipeline on disk and none of it in
effect, which is the worst of both states: it reads as deployed and behaves as absent.

Two copies and a drift check is the boring option, and the boring option is the right
one for something that has to work on someone else's laptop on the first try.

**Edit the kit, then re-copy** — never the other way round:

```bash
cp -r ds-pipeline-kit/plugin/skills/. .claude/skills/
cp ds-pipeline-kit/plugin/agents/ds-pipeline-orchestrator.md .claude/agents/
```

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

**Two honest caveats, stated because a demonstration that hides them is a sales pitch.**

Branch protection here runs with `enforce_admins` **off** — the kit's runbook recommends starting
that way, since turning it on before the gates have proven themselves is a fast way to freeze a
repository. The consequence is real: a repository administrator's `git push` straight to `main`
**succeeds**, with GitHub printing the required-checks notice and pushing anyway. On a
one-person repository the process is therefore voluntary for that one person. It has already
happened once here, and the commit was kept rather than rewritten — see the history.

And `review-approved` needs an approving review from someone who is not the author. With a single
contributor there is nobody to give it, so pull requests here are merged with an administrator
override. That is a scaffolding-phase exception, not the intended flow: the moment a second
reviewer exists — a person or an automated one with repository access — the override stops being
needed.

## The published Storybook

**https://alehmikalaichyk-arch.github.io/agentic-ai-lab/**

Rebuilt and republished on every push to `main`. This link is not a convenience: stage #4.5 of
the pipeline asks the owner to *look* at a component before its spec is frozen, and that only
happens if looking costs one click. Where the Storybook build runs but is not published, every
review turns into "run it locally so I can look" and the checkpoint gets skipped for being
expensive — measured, and the reason the publishing workflow shipped with the scaffold rather
than later.

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

- **`tokens/color/primitives.json`** — the raw palette. Colour steps named by family
  (`brand-500`, `neutral-100`).
- **`tokens/color/semantic.json`** — roles. `fg.default`, `surface.accent-red-subtlest`,
  `outline.focus`. Every value references a primitive and nothing else.
- **`tokens/component/`** — component-layer values referencing semantic roles.

427 tokens, built by Style Dictionary into `generated/`.

**Two things have to be withheld, not one.** `sd.config.mjs` publishes the semantic layer to
Tailwind and withholds our primitives, so `bg-brand-500` is not a class. That alone is not
enough: Tailwind ships a full palette of its own, so `bg-red-500`, `text-neutral-900` and
`bg-slate-100` were all real, working classes reaching straight past the semantic layer.
`src/styles.css` deletes them with `--color-*: initial`. `src/tailwind-surface.test.ts` compiles
Tailwind for real and asserts both halves — reading the theme file was exactly what said
everything was fine.

Three traps worth knowing before you add a token:

- **`-bold` means different things on different roles.** On a foreground role it means *darker
  text*; on a surface role it means *a strong fill*. They are not symmetrical.
- **`-boldest` does not mean "dark".** `surface-neutral-boldest` is a light grey (`#c5c8d1`).
  The suffix orders steps within a family and promises nothing about lightness — reading it as a
  promise is how white text ends up on a light background.
- **On a soft accent surface, the matching foreground fails AA.** `fg-accent-red` on
  `surface-accent-red-subtlest` is **3.12:1**; only the `-boldest` step passes. The pairing that
  reads as obviously correct is the wrong one, so both directions are asserted in
  `src/tokens.test.ts` — the passing pairs *and* the tempting ones that fail.

The build refuses to guess: an unclassified token group, or two tokens publishing the same
Tailwind variable, each stop the build with a message naming them.

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
