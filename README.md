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
| `.claude/` | The pipeline **in effect here**: 10 skills, 3 agents, the write-time guard, and the directory-triggered rule. Present on clone; no install step. |
| `ds-pipeline-kit/` | The same pipeline as a **portable kit**, as it would be handed to another repository. Skills, orchestrator, guard, CI gates, and its own [INSTALL.md](ds-pipeline-kit/INSTALL.md) / [QUICKSTART.md](ds-pipeline-kit/QUICKSTART.md). |
| `ds-kit.config.yml` | The only file that binds the kit to *this* repository. Paths, branch, script names, check names. |
| `tokens/` | DTCG token sources. Primitive → semantic → component, in that order, with no shortcuts. |
| `generated/` | Built from `tokens/`. **Not committed** — every script that needs it runs `build:tokens` first. |
| `src/components/ui/` | Component source. |
| `docs/component-specs/` | The frozen specs. One per component, merged before its implementation. |
| `component-prototypes/` | Visual drafts of a single component — what the owner looks at *before* a spec is frozen (stage #4.5). |
| `prototypes/` | **Whole-screen prototypes. No spec, no gates, disposable.** A different thing from a draft — see [its README](prototypes/README.md). |
| `.github/workflows/` | CI, the three structural gates, the review gate, and Storybook publishing. |

**Before demonstrating any of this, verify it actually loaded** — in a fresh clone and a fresh
session: [docs/verify-pipeline-loaded.md](docs/verify-pipeline-loaded.md). A session with no
skills loaded behaves exactly like one that did not need them, until the moment the process
depends on one.

### Who actually does the work

Three agents, and the split between them is the mechanism rather than a division of
labour.

| Agent | Runs | Notably cannot |
|---|---|---|
| `ds-pipeline-orchestrator` | Sequences the stages, holds the HARD STOP at the spec merge | **Write, Edit** — so it cannot collapse two stages by authoring both itself |
| `frontend-engineer` | Stages #1–#7: context, governance, token scan, spec, draft, implementation, stories, a11y | Decide a spec is frozen; open or merge a pull request |
| `quality-reviewer` | Stage #8, the merge gate | **Write, Edit** — a gate that can fix what it finds stops being a gate |

The absent tools are the point. An instruction not to fix things is a preference; a
missing tool is a guarantee. The same reasoning gives the orchestrator no write
access: it is the mechanical reason it cannot write a spec and its implementation in
one session, which is the boundary the whole pipeline is built around.

`quality-reviewer` must also run in a **fresh context**, not a continuation of the
session that wrote the code — in the author's session it inherits the author's
reading of the spec, and a spec-versus-code mismatch is exactly what it exists to
catch. Delegating to it as a subagent gives that for free; running stage #8 by hand
in the implementing session does not.

`ds-kit.config.yml` names the two delegates, and `tools/check-agents-exist.sh` fails
CI if a name there has no agent behind it. A rule that names an enforcer which does
not exist is enforced by nothing — and this repository shipped exactly that until the
agents were written.

### Two zones, and the rule between them

The repository does two things that want opposite speeds.

| | Component pipeline | `prototypes/` |
|---|---|---|
| Pace | Deliberately slow — spec, draft, human merge before any code | Deliberately fast — build it, look at it, throw it away |
| Gates | All four | **None.** A prototypes-only diff classifies as `NONE` — verified, not assumed |
| Output | A component the system depends on for years | An answer to one question |

Run prototypes through the pipeline and they stop being prototypes. Loosen the
pipeline so prototypes fit and there is no pipeline. Hence two zones and one rule:

**A prototype never becomes a component by being moved.** When a prototype shows that
a component is needed, that component enters at stage #0 with a requirements brief
like any other. What the prototype contributes is evidence — the strongest kind,
because the need was demonstrated rather than predicted.

`tools/check-prototypes-are-ungated.sh` fails CI if a classified path ever grows to
contain `prototypes/`, since the first symptom would otherwise be a prototype PR
demanding a frozen spec.

**Prototypes are still type-checked and linted.** "No gates" means no *process* gates
— not that a draft may be broken. That distinction was worth enforcing: they were
outside `tsconfig` until a deliberate type error passed every check, which is exactly
the failure the kit's own measurements record.

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

### Deployed is not loaded, and loaded is not current

The same failure has a runtime half. [docs/verify-pipeline-loaded.md](docs/verify-pipeline-loaded.md)
is the procedure; these are the three things it exists to separate, each learned by being caught
out by it.

**A skill that loaded and a skill that was read off disk are indistinguishable in the output.** An
agent asked to follow `SKILL.md` by path produces entirely plausible work. The only reliable
discriminator is the `Base directory for this skill:` line the harness emits on invocation — it
must be inside this repository, because a same-named skill from another project loads silently.

**An agent that resolves is not an agent that can run a stage.** Every stage is a skill
invocation, so a delegate without the `Skill` tool is present, addressable by name, and unable to
do anything. Ask it to enumerate its own tool schema rather than reading its definition file.

**Agent definitions are read at session start; `.claude/settings.json` is re-read live.** Both were
observed in one session: a hook fix pulled mid-run took effect immediately, while a fix adding the
`Skill` tool to the delegates sat on disk with the old roster still in memory and nothing
signalling the disagreement. `tools/check-agents-exist.sh` reads the disk, so it passed throughout.
An agent-definition change needs a session restart. Whether skills reload live is not established —
one surface refreshes and one does not, so do not assume a third.

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

And `review-approved` needs an approving review from someone who is not the author — GitHub
forbids approving your own pull request, so with one contributor the check can never go green.

It is therefore **reported but not required** here (`require_review_to_merge: false`). It still
evaluates, still shows pending or green, and starts blocking the day a second reviewer exists. The
three structural gates plus CI remain required and genuinely block.

The alternative was leaving it required and merging every pull request with an administrator
override — which is worse than it sounds: an override used routinely stops being an exception, and
a team that reaches for `--admin` by habit has no gates at all, only the appearance of them.
Making the unreachable check non-blocking keeps the reachable ones meaningful.

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
| `npm run lint` | ESLint over `src/`, `prototypes/` and `component-prototypes/` |
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

**Colour is the only namespace where both halves are done.** `src/styles.css` resets `--color-*`
and nothing else, and the token build publishes colour, type, radius, shadow and spacing to
Tailwind — but not motion. So `tokens.css` defines ten `--ds-motion-*` properties that reach no
utility, while Tailwind's own `duration-*` and `ease-*` survive the reset and compile. The
collision is worse than a plain gap: `duration-150` is `150ms`, byte-identical to
`--ds-motion-duration-normal`, and `ease-out` is `cubic-bezier(0, 0, 0.2, 1)`, byte-identical to
`--ds-motion-easing-ease-out`. Writing `transition-all duration-150 ease-out` therefore renders
*exactly right* through a channel that bypasses the token layer entirely, and no test says
otherwise. Verify a utility by compiling, never by grepping `generated/tailwind-theme.css`.

A guard for this has to scan component source, not build output. Tailwind v4 scans tracked
Markdown, so a document warning against those three classes emits them into the compiled
stylesheet — the prose forbidding them would defeat the check looking for them.

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
- **`default` is the lighter weight in the type scale.** `--ds-font-body-sm-default` is weight
  **300** and `--ds-font-body-sm-moderate` is **400**. Binding a label to `moderate` and its
  subordinate text to `default` inverts the hierarchy while looking correct in a diff.
- **Which page surface a component lands on can decide AA.** `fg-subtlest` measures 4.73:1 on
  white and **4.49:1** on `surface-page` — passing and failing across the two surfaces this
  palette ships. A component that does not choose its own background cannot bind it. The pair is
  in neither list in `src/tokens.test.ts`, so this one is documented and not yet asserted.

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
