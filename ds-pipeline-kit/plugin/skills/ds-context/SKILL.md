---
name: ds-context
description: >
  Live map of the design-system package at `ds_package_root`:
  stack identity, pipeline stages (tokens → generated → Tailwind theme →
  components → stories → tests → specs), key paths, current inventory, and
  the normalized Context Snapshot consumed by every other DS skill. Read this
  as the first action whenever working on the DS — downstream skills
  assume you have. Read-only.
tools: Read, Glob, Grep
---

# DS — Context

This is the **context layer** for the design system. It establishes the
facts that every other DS skill (#2–#10) reads as its first action: pipeline
shape, stack identity, key paths, current inventory, and known anomalies.

The skill produces a single normalized output — the **Context Snapshot** —
that downstream skills consume instead of re-scanning the repository.

This skill is read-only. It never modifies the repo, never regenerates tokens,
never fixes issues it reports.

---

## 1. Pipeline shape

The DS pipeline has seven stages, in order:

```
tokens → generated → tailwind-theme → components → stories → tests → specs
```

- **tokens** — DTCG-format JSON token files under `tokens/` (color, typography,
  spacing, radius, shadows, motion, chart).
- **generated** — derived artifacts written by Style Dictionary into
  `generated/` (`tokens.css`, `tokens.ts`, `tailwind-theme.css`, `figma-*.json`).
  Never edited by hand.
- **tailwind-theme** — Tailwind 4 CSS-first configuration via the `@theme`
  directive, consuming `generated/tailwind-theme.css`.
- **components** — React + TypeScript components under `src/components/ui/`
  (shadcn-level atoms) and `src/components/` (composite components).
- **stories** — Storybook stories under `.storybook/` and colocated
  `*.stories.tsx` files.
- **tests** — Vitest unit tests (`*.test.tsx`) colocated with components,
  Playwright e2e under `e2e/`.
- **specs** — component specifications under `docs/` (when present).

---

## 2. Stack identity

The stack is fixed as follows. `package.json` is the live verifier — when in
doubt, read it.

- shadcn (manually initialized, not via `shadcn init`)
- Radix UI primitives
- Tailwind 4 (CSS-first, no `tailwind.config.js`)
- Style Dictionary
- Webpack 5
- Storybook
- Playwright (e2e)
- Vitest (unit)

---

## 3. Source of Truth hierarchy

When two sources state conflicting facts about the same claim, trust them in
this order:

1. `package.json`
2. `sd.config.mjs`
3. `tokens/`
4. `src/components/`
5. `generated/`
6. `README.md`

This is a **tie-breaker for the same claim**, not a global authority ranking.
`tokens/` and `src/components/` answer different questions and rarely conflict
on the same fact.

`README.md` is informational only and must never override live state. The
current README claims "scaffold only" — this is out of date and must be
disregarded when reconciling against live files.

---

## 4. Key paths

All paths are relative to `ds_package_root`.

| Path | Role |
|---|---|
| `package.json` | Highest-authority source. Live `scripts`, dependencies, version. |
| `components.json` | shadcn config (style, aliases). |
| `sd.config.mjs` | Style Dictionary config (source globs, platforms). |
| `tokens/` | DTCG token files, one subdirectory per category. |
| `src/components/ui/` | shadcn-level atoms (`button.tsx`, `select.tsx`, etc.). |
| `src/components/` | Composite components (`breadcrumbs/`, `drawer/`, `global-header.tsx`, `page-shell.tsx`). |
| `src/lib/utils.ts` | The `cn()` helper. Mandatory for all component styling. |
| `generated/` | Derived artifacts. Never edited by hand. |
| `.storybook/` | Storybook configuration. |
| `playwright.config.ts` | E2E test config. |
| `vitest.config.ts` | Unit test config. |
| `webpack.config.js` | Build config. |
| `README.md` | Informational only — currently out of date. |

---

## 5. Generated state rules

The `generated/` directory is **derived state**. It may be inspected for
validation, but it is never the
primary source of truth when a source file exists.

Authority pairs:

```
tokens/         is authoritative over   generated/tokens.css
tokens/         is authoritative over   generated/tokens.ts
tokens/         is authoritative over   generated/tailwind-theme.css
tokens/         is authoritative over   generated/figma-*.json
src/components/ is authoritative over   dist/
src/components/ is authoritative over   storybook-static/
```

If `generated/` is missing entirely, this is a Warning (see §9), not a fatal —
it just means the package hasn't been built.

---

## 6. How to assemble live state

Read files in this exact order to produce the Context Snapshot. The order
matters for determinism — every agent collects in the same sequence.

1. `package.json` — extract `version`, `scripts`, key dependency versions
   (`tailwindcss`, `style-dictionary`, `storybook`, `@radix-ui/*` aggregate).
2. `components.json` — extract `style`, `aliases`.
3. `sd.config.mjs` — extract source globs and platforms.
4. `tokens/` — list directory (one level deep). Capture subdirectory names and
   any loose JSON files at root.
5. `src/components/ui/` — list directory. Capture file basenames (strip `.tsx`,
   `.test.tsx`, `.stories.tsx`).
6. `src/components/` — list directory. Capture subdirectory names and top-level
   component files.
7. `generated/` — list directory. Capture file names verbatim.
8. `README.md` — read for informational context only; reconcile against live
   state, do not let it override.

Do not bake any inventory list into this file or into the snapshot template.
Always read from the file system.

---

## 7. Context Snapshot Contract

The skill produces a single output — a Context Snapshot — with the following
fixed structure. Downstream skills consume the snapshot; if a field is missing,
the snapshot is incomplete and must be re-collected.

```yaml
snapshot:
  schema_version: 1
  generated_at: <ISO 8601 timestamp>
  generator: ds-context

ds_package_root: 

versions:
  package: <from package.json#version>
  tailwindcss: <from dependencies>
  style-dictionary: <from dependencies>
  storybook: <from dependencies>
  radix-ui: <from dependencies, aggregate count or list>

stack:
  - shadcn
  - radix
  - tailwind-4-css-first
  - style-dictionary
  - webpack-5
  - storybook
  - playwright
  - vitest

pipeline_stages:
  - tokens
  - generated
  - tailwind-theme
  - components
  - stories
  - tests
  - specs

inventories:
  tokens: [<dir names + loose files from tokens/>]
  components_ui: [<file basenames from src/components/ui/>]
  components_composite: [<dir + file names from src/components/>]
  generated_artifacts: [<file names from generated/>]

configs:
  shadcn: components.json
  style_dictionary: sd.config.mjs
  storybook: .storybook/
  playwright: playwright.config.ts
  vitest: vitest.config.ts
  webpack: webpack.config.js

commands_source: package.json#scripts

anomalies: [<see §8>]

health: [<see §9>]
```

Downstream skills must not invent additional fields. The snapshot is the only
sanctioned interface.

The `schema_version` field allows the contract to evolve while keeping
downstream skills version-aware. Increment it only on structural or breaking
changes; additive field changes do not require a bump.

---

## 8. Known anomalies

Document these explicitly in the snapshot's `anomalies` array:

- `README.md` claims "scaffold only" but the package has shipped tokens,
  components, and Storybook. Disregard the README claim when reconciling state.
- `chip.json` sits at the root of `tokens/`, outside the DTCG subdirectory
  structure. It is a component-token file using raw dimension values rather
  than referencing semantic tokens — flagged as tech debt; do not use as
  precedent for new component tokens.
- `generated/figma-*.json` exists, meaning a code→Figma contract is live.
  Its origin and trigger are unknown at the time of this skill's writing.
  Reconciling it against the design tool is out of scope for this kit — no skill here does it.

---

## 9. Health warnings

The skill reports, never fixes. Issues are sorted into two tiers.

**Catastrophic** — the snapshot cannot be produced. Stop and report:

- `package.json` missing or unreadable.
- `tokens/` missing.
- `src/components/` missing.

**Warning** — the snapshot is produced with a caveat. Report and continue:

- `sd.config.mjs` missing — pipeline definition unknown.
- `components.json` missing — shadcn aliases unknown.
- `generated/` missing — package not built; downstream skills that need
  derived artifacts will be blocked.
- `.storybook/` missing — stories stage of the pipeline absent.
- `playwright.config.ts` or `vitest.config.ts` missing — tests stage absent.
- Unknown file directly under `tokens/` (anything other than a known DTCG
  subdirectory) — e.g. the current `chip.json` case.

Report-only. Never attempt to fix.

---

## 10. Never

- Never modify any repository file.
- Never regenerate tokens or any other build artifact.
- Never bake an inventory list into this skill body or into any output
  document — always read from the file system.
- Never reuse a snapshot from a previous session — always re-collect at the
  start of a new session.
- Never treat generated artifacts as primary source when a source file exists.
- Never infer repository state without reading it.
- Never attempt to fix issues surfaced by health warnings — report only.

---

## 11. Other DS skills — when to use which

After this skill produces the snapshot, route to the appropriate downstream
skill.

**Verify presence before trusting this list.** It is prose, and prose about a
roster drifts. In the reference implementation every entry from #3 to #8 sat
marked *planned* here for months after the skill had shipped — so an agent
reading it was told that the spec writer, the build layer, the a11y audit and
the merge gate did not exist. One command settles it, and costs nothing:

```bash
ls <your harness's skills directory>
```

| # | Skill | Use for |
|---|---|---|
| 0 | `component-requirements-builder` | The owner's ask, normalised into numbered observable requirements, plus a repository feasibility audit. Runs **before** a spec exists. |
| 2 | `ds-governance` | Token architecture, naming, contribution flow, boundaries, forbidden patterns. Read before specing or implementing anything in the DS. |
| 3 | `token-guardian` | Detects token-rule violations. Owns detection, never the rules or the severities. |
| 4 | `component-spec-writer` | Writes the component spec — anatomy, variants, states, controlled/uncontrolled API, ARIA. Stops at `freeze_candidate`. |
| 5 | `component-implementation` | Builds a merged spec into source and authors the component test file. |
| 6 | `storybook-stories-generator` | Generates stories for variants, sizes and required states as a projection of spec × component. |
| 7 | `a11y-interaction-review` | WCAG and interaction QA against the spec's a11y contract. |
| 8 | `production-quality-gate` | Final merge gate — typecheck, lint, tests, Storybook build, generated-state integrity. |

Those nine are the whole kit. If you extend it, add the new skill here — and
read the next section before you write a rule that depends on one you have not
built yet.

### A rule whose named enforcer does not exist is enforced by nothing

This is the failure mode that a roster table invites, and it is worth stating
because it does not announce itself. Two kinds of reference to an absent skill,
failing differently:

| Kind | Shape | What it means |
|---|---|---|
| **Enforcement deferral** | a rule states a requirement and names skill X as its enforcer | the requirement is **stated and enforced by nothing**; it reads as governed |
| **Scope exclusion** | a skill says "not my job, ask X" | a dead pointer — but it reads to an agent as coverage that exists elsewhere |

The first is the damaging one. Before extending this kit with a rule that defers
enforcement, confirm the enforcer exists. If it does not, say so *in the rule*,
in those words, rather than naming a skill and leaving the reader to assume.

Count these by searching for the **skill number as well as the name**. In the
reference implementation a count taken by grepping the name alone was wrong,
because several references cite only the number.

---

## 12. What this skill does NOT cover

- Rules and conventions — see `ds-governance` (#2).
- Token-rule violations — see `token-guardian` (#3).
- Component specifications — see `component-spec-writer` (#4).
- Implementation code — see `component-implementation` (#5).
- Stories — see `storybook-stories-generator` (#6).
- Accessibility and interaction QA — see `a11y-interaction-review` (#7).
- Builds, lint, tests as gates — see `production-quality-gate` (#8).
- Design-tool synchronisation in either direction — no skill in this kit does it.
- Auditing how product screens *consume* the DS — a separate concern, not shipped here.
- Anything outside the DS package (`ds_package_root`) — out of scope by design.
