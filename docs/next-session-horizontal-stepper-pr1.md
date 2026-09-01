# Next session: take HorizontalStepper through PR-1

An externally-authored specification from another design system arrives as the owner's ask. This
is the session that turns it into a Component Requirements Brief and a spec for *this* repository
— stage #0, #1, #2 and #4, plus a visual draft — and stops at PR-1. The implementation is PR-2, in
a separate session, and the write-time guard enforces the split.

The session that produced this document got as far as setup and then stopped, because it could not
delegate a single stage. That failure is the most useful thing it found, and it is the first
section below rather than a footnote.

Paste the prompt below into a **fresh** session opened in a clone of
`https://github.com/alehmikalaichyk-arch/agentic-ai-lab`.

---

## Read this first: two config surfaces, opposite reload semantics, no indication of either

`.claude/settings.json` is re-read **live**. `.claude/agents/*.md` is **frozen at session start**.

Both were observed in the same session, minutes apart:

| Fix pulled mid-session | On disk after the pull | In effect in the running session |
|---|---|---|
| #11 — quote the hook command in `.claude/settings.json` | ✅ | ✅ **yes** — a real `Write` to `src/components/ui/` was refused immediately after the pull |
| #10 — add `Skill` to `.claude/agents/frontend-engineer.md` | ✅ | ❌ **no** — the delegate still enumerated `Read`, `Write`, `Edit`, `Bash` |

`grep '^tools:' .claude/agents/frontend-engineer.md` printed `Read, Glob, Grep, Write, Edit, Bash,
Skill` while the running delegate reported four tools and "NO Skill tool". Nothing surfaces the
disagreement — the file is right, the check that reads the file passes, and the roster in memory is
stale.

**Consequences:**

- **Any change to an agent definition requires a session restart.** Verifying the fix by reading
  the file — including via `tools/check-agents-exist.sh`, which reads the disk — proves nothing
  about the session you are in. Ask the agent to enumerate its own tool schema instead.
- **Do not assume symmetry for skills.** Whether `.claude/skills/*/SKILL.md` reloads live is *not*
  established. One surface reloads and one does not; treat a third as unknown until measured.

This is also why "the pipeline is deployed" and "the pipeline is in effect" are different claims,
which is what `docs/verify-pipeline-loaded.md` exists to separate.

---

## Repository state — verified, not assumed

| | |
|---|---|
| Branch | `spec/horizontal-stepper` — created, rebased onto `390218b`, **zero commits of its own** |
| `main` at handover | `390218b fix(ds-context): a design system with no components is a Warning, not Catastrophic (#12)` |
| `npm install` | exit 0 |
| `npm run build:tokens` | exit 0 — `generated/` populated, 427 `--ds-*` custom properties |
| gh identity | active account `alehmikalaichyk-arch`; `permissions` → `push: true`, `admin: true` |
| Guard | **live and correct** — self-test 54/54 exit 0; a real `Write` to `src/components/ui/` on a `spec/` branch refused by the harness, citing `.claude/rules/ds-component-pipeline.md` |
| Working tree | one pre-existing unstaged edit: `.gitignore` +`.claude/settings.local.json`. Not part of PR-1; leave it unstaged. |

Fixes pulled and independently re-verified during that session: **#10** (agent `Skill` tool),
**#11** (guard command quoting + self-test no longer reading the ambient branch), **#12**
(`ds-context` §9 tier + tracked `src/components/ui/.gitkeep`).

Stages #1 and #2 were *hand-executed* — the delegate read `SKILL.md` by path and followed it,
because it had no `Skill` tool. **Discard those outputs and run both properly.** A hand-executed
stage is indistinguishable from the failure case `docs/verify-pipeline-loaded.md` is designed to
detect, which is precisely why it cannot be accepted as a stage having run.

---

## Drift already established — re-confirm, do not re-derive

Each item was checked against the live repository. Two of them change what the next session can do
and are being fixed on `main`; see "Blocked on two fixes" below.

### Affects HorizontalStepper directly

1. **The visual draft is ungoverned, and the pipeline rule claims the opposite.** The rule states
   *"A draft is TypeScript, and is typechecked. `tsconfig.json` includes this directory."* It does
   not. `tsconfig.json` `include` is `["src", "generated", ".storybook", "prototypes",
   "vitest.config.ts"]` — `prototypes`, **not** `component-prototypes`. `lint` is
   `eslint 'src/**/*.{ts,tsx}' 'prototypes/**/*.{ts,tsx}'`, the same miss. So a draft can carry a
   type error no gate sees — the exact failure the rule's own PR #127 measurement records.

2. **PR-1 cannot carry a Storybook preview link.** `ci.yml` has no Storybook build, no artifact
   upload and no PR comment. `storybook-pages.yml` triggers on `push: branches: [main]` and
   `workflow_dispatch` only — no `pull_request`. The published Storybook is therefore built from
   `main`, so a draft on a spec branch does not appear there until PR-1 merges — after the freeze
   it exists to inform. A visual draft the owner cannot see is not a checkpoint.

3. **`component-prototypes/` does not exist yet.** The draft will be the first thing in it.
   `.storybook/main.ts` already globs it, so it will be indexed once created.

### Kit bugs — neither `ds-context` nor `ds-governance` reads `ds-kit.config.yml` at all

`grep 'ds-kit.config'` returns zero hits in both skills, while the config's own header says a
project-specific value found elsewhere in the kit is a bug to report. Hardcoded instead:
`src/components/ui/`, `tokens/`, `generated/`, `src/lib/utils.ts`, `--ds-` (should read
`tokens_namespace.css_prefix`), `npm run test:e2e` (the config sets `e2e: null`), the eleven colour
families, `governance_owner`.

`ds-context` §6 says *"Do not bake any inventory list into the snapshot template"*; §7 then bakes an
eight-entry `stack:` list of which **four are false here** — no shadcn (`components.json` absent),
no Radix (zero packages), no Webpack (Vite 6 + `@vitejs/plugin-react`), no Playwright.

### Enforcement stated but absent

- The rule cites `tools/visual-draft-boundaries.test.ts`, `tools/pr1-document-boundary.test.ts` and
  `tools/check-frozen-spec-on-base.test.ts` as the pins for load-bearing claims. **None exists.**
- The rule describes ESLint "features 289/290" as a blocking mechanical floor for raw hex literals
  and arbitrary px values. `.eslintrc.cjs` has no hex rule, no arbitrary-value rule and no import
  restriction — only recommended sets plus two react-hooks rules. Governance §15's Blocker tier has
  no mechanical enforcer; only `token-guardian`, in session.
- Governance §11 "current CI gating" asserts Playwright (absent) and lists lint as a *gap* (it
  runs). Actual `ci.yml`: `npm ci` → `check-claude-dir-in-sync` → `check-agents-exist` →
  `check-prototypes-are-ungated` → `build:tokens` → `typecheck` → `lint` → `test`.

### Behaving as documented

`pr-gates.yml` defines exactly the three job names in `ds-kit.config.yml`; `review-gate.yml` sets
`review-approved`; `classify-pr-diff.sh` and `check-document-on-base.sh` both resolve their paths
*from* the config and fail closed when it is missing.

### Constraints the spec must respect

- Runtime dependencies are exactly three: `class-variance-authority`, `clsx`, `tailwind-merge`. No
  Radix, no icon set. Governance §15 makes a new runtime UI dependency a Requires-Review item.
- The token namespace is `--ds`. The source system's `pg-` classes do not exist here; every binding
  must be verified against `generated/tailwind-theme.css` after `build:tokens`.
- The Context Snapshot contract has **no `css_prefix` field**, and §7 forbids inventing fields. The
  prefix comes from `ds-kit.config.yml` or from governance's `css_namespace`.
- Governance §6.2 names **steppers** explicitly in the inert-component set and states what
  inertness does and does not promise — direct support for keeping the source spec's D3.
- The empty component inventory is now a Warning, and it is correct information. *"This is the
  first component in the repository"* is a real input to stage #0.

---

## Blocked on two fixes — do not start PR-1 until the owner confirms

Drift items 1 and 2 are being fixed on `main`. Both gate stage #4.5 rather than merely annoying it:

- **the Storybook link (item 2)** — a draft the owner cannot see is not a checkpoint, and the
  freeze gate is the whole reason the draft step exists;
- **the `component-prototypes/` typecheck gap (item 1)** — a draft that can carry an unseen type
  error is the failure the kit's own measurements record.

The next session runs Step 0 through stage #4 regardless. It stops before the draft and PR-1 until
the owner says both have landed.

---

## The prompt

```
Repository: agentic-ai-lab. You are in it. Continuing a task from a restarted session.

WHY THE RESTART, and the finding to carry forward:
Two config surfaces have OPPOSITE reload semantics and neither announces it.
.claude/settings.json is re-read LIVE — a hook fix pulled mid-session took effect
immediately. .claude/agents/*.md is FROZEN AT SESSION START — a fix adding the Skill
tool to the delegates was on disk and absent from the running roster at the same
time, with nothing indicating the disagreement.

Consequences: any change to an agent definition requires a session restart, and
reading the file to verify it (including tools/check-agents-exist.sh, which reads
the disk) proves nothing about the session you are in — ask the agent to enumerate
its own tool schema instead. Whether SKILL.md files reload live is NOT established;
do not assume symmetry.

GOAL: PR-1 for HorizontalStepper — the requirements brief and the component spec,
authored through the pipeline's own stages. No implementation: that is PR-2, in a
separate session, and the write-time guard is LIVE and will enforce the split.

INPUT — an externally-authored specification from another design system. Treat it
as the owner's ask, not as the deliverable. Both paths are readable directly with
the Read tool; the previous session confirmed this, so no /add-dir and no .input/
copy is needed:
  brief: /Users/olegmikolajcik/pegbo/docs/design-system/component-requirements/horizontal-stepper.md
  spec:  /Users/olegmikolajcik/pegbo/apps/shared/design-tokens/docs/component-specs/horizontal-stepper.md

HOLD — read before planning the run.
Two defects that gate the visual draft are being fixed on main. Run Step 0 through
stage #4, then STOP and ask the owner to confirm both have landed before doing
STEP 5 or STEP 6:
  - ci.yml builds no Storybook and comments no link; storybook-pages.yml triggers
    only on push to main + workflow_dispatch. So a draft on a spec branch is
    invisible to the owner until after the merge it was meant to inform.
  - component-prototypes/ is in neither the lint globs nor the tsconfig "include",
    so a draft can carry a type error that no gate sees.
Do not work around either. Do not fix either on this branch.

ALREADY DONE — verify, do not redo:
  - Branch spec/horizontal-stepper exists, is rebased onto main, and has ZERO
    commits of its own. Stay on it. (Rebase onto the latest main first.)
  - npm install and npm run build:tokens both ran, exit 0. generated/ is populated.
  - gh auth: active account alehmikalaichyk-arch, permissions push:true. Re-check
    with `gh auth status` but it is known good.
  - Fixes #10 (agent Skill tool), #11 (guard quoting + self-test), #12 (ds-context
    §9 tier + tracked src/components/ui/.gitkeep) are all on main.
  - One PRE-EXISTING unstaged edit: .gitignore +.claude/settings.local.json. It is
    not mine and not part of PR-1. Never stage it.

STEP 0 — re-run the verification. Do NOT assume it from the previous session.
Run the checks in docs/verify-pipeline-loaded.md, plus three probes:
  a. For EVERY skill you invoke, report the `Base directory for this skill:` line
     VERBATIM. Each must be inside this repository. A same-named skill from another
     project loads silently and reads plausibly — the base directory is the only
     reliable discriminator. The previous session could produce ZERO such lines;
     that is what must now change.
  b. Agent(subagent_type: "frontend-engineer") must resolve AND must actually have
     the Skill tool. Ask it to enumerate its own tool schema before trusting it.
     "Present and resolvable" is not the same as "can run a stage".
  c. When the guard blocks a write, its message must cite
     .claude/rules/ds-component-pipeline.md. If it cites docs/agent-rules/..., a
     different repository's guard fired. STOP.
Expected now: guard self-test 54/54 exit 0, and a real Write to src/components/**
refused by the harness. If the verdict is anything other than LOADED, STOP.

STEP 2 — stages #1 and #2, delegated to the agent ds-kit.config.yml names as
agents.implementer. Do not run them yourself in this session — one context must not
run ds-governance and then author the spec that governance governs.
  #1 ds-context     — the Context Snapshot. It should now produce a snapshot with a
                      WARNING about the empty component inventory rather than
                      halting. That warning is correct information: this is the
                      first component in the repository. Carry it into stage #0.
  #2 ds-governance  — the Governance Rule Set.
Report where the live repository contradicts what a skill asserts. The previous
session found substantial drift; re-confirm rather than inherit it.

STEP 3 — stage #0, component-requirements-builder, same agent.
Feed it the two input documents as the owner's ask. Both outputs matter:
  - docs/component-requirements/horizontal-stepper.md — the brief (the directory
    does not exist yet)
  - the repository feasibility audit — binding facts and named conflicts
Report the audit IN FULL. A conflict it names is worth more than a brief it writes.

STEP 4 — stage #4, component-spec-writer, same agent.
Output: docs/component-specs/horizontal-stepper.md
  - The source spec is precedent and evidence, not a file to copy. Where this
    repository differs, state what is true HERE.
  - Never write `lifecycle: frozen`. freeze_candidate is the ceiling a spec earns;
    frozen is the merge.
  - The source spec's D3 — "fully non-interactive, with no interactive states at
    all" — is load-bearing. Keep it and the reasoning. Governance §6.2 names
    steppers in the inert set and defines what inertness does and does not promise.
  - The source spec's D11 records the owner overriding requirement CR-007. Do NOT
    inherit that override silently: this repository has a different owner. Surface
    it as a decision to be made, and state what the spec does meanwhile.
  - Re-measure every contrast claim against THIS repository's built tokens.
  - Token bindings: the namespace here is --ds, not the source system's. A class
    like `rounded-pg-xs` does not exist. Verify each binding resolves to a real
    utility in generated/tailwind-theme.css and show it doing so.

Then STOP and report, per the HOLD above.

STEP 5 — the visual draft, same agent. ONLY after the owner confirms the two fixes
landed. component-prototypes/ (ds-kit.config.yml paths.drafts) does not exist yet;
the draft will be the first thing in it. Render the stepper at its states and
actually look at it — a draft catches geometry and contrast no gate catches.

STEP 6 — open PR-1. A human merges it; you do not.
Before opening, run: git diff --name-only main...HEAD
Every path must be under docs/ or component-prototypes/. Anything under src/ means
the boundary was crossed.
Report the PR URL AND the head SHA. The review gate counts an approving review only
when its commit_id equals the current head SHA. After reporting it, push nothing
further: a new commit resets the gate to pending and silently invalidates an
approval already given.
The PR body needs a `## Visual` section — required by the rule, and the reason is
that a reviewer approving a spec they have not seen rendered is approving prose.
Note in the body whether the guard was live during this work; a gate's state during
a change belongs in the record.

CONSTRAINTS, each a real boundary:
- This repository has exactly three runtime dependencies: class-variance-authority,
  clsx, tailwind-merge. No Radix, no icon set. Governance §15 makes a new runtime
  UI dependency a Requires-Review item. HorizontalStepper was chosen because it
  needs none — if your spec requires one, that is a finding to report, not a step
  to take.
- Write nothing under src/. If the guard blocks a write, report exactly what it
  said including which rule file it cited, and stop that line of work. Do not route
  around it with a shell heredoc — a block is a finding about the session, not an
  obstacle.
- One component per PR: this PR carries HorizontalStepper and nothing else. Do not
  fix kit bugs on this branch; report them for a separate PR on main.
- Do not write implementation, do not open PR-2, do not approve, do not merge.

EVIDENCE wanted in the final report:
  - the step 0 verdict, with every `Base directory for this skill:` line quoted
  - which agent ran which stage
  - the stage #0 feasibility audit, in full
  - each check as command -> actual output. Never `npm test | tail`: that returns
    tail's exit code, which is 0 almost always. Redirect, echo $?, then read.
  - the spec's token-bindings table, each binding shown resolving to a real utility
    in generated/tailwind-theme.css
  - the PR URL and the head SHA
```

---

## What a good outcome looks like

A brief at `docs/component-requirements/horizontal-stepper.md`, a spec at
`docs/component-specs/horizontal-stepper.md` reading `lifecycle: freeze_candidate`, a draft under
`component-prototypes/`, and PR-1 open and unmerged with a `## Visual` section a human can act on.
Every token binding in the spec shown resolving to a real utility in `generated/tailwind-theme.css`
— not asserted from the source system's table.

## What is worth noticing regardless of outcome

**If the delegate still has no `Skill` tool**, stop. That is the roster-freeze problem above and no
amount of reading `SKILL.md` by path substitutes for it.

**If stage #0's audit names a conflict**, that is worth more than the brief it writes. The audit is
the step that discovers what this repository cannot do, and the input document was written for a
different one — different token namespace, different dependencies, a different owner.

**If the spec ends up needing a runtime dependency**, that is a finding to report, not a step to
take. HorizontalStepper was chosen precisely because it needs none.

**If D11 is inherited silently** — the source spec records its owner overriding requirement CR-007
— the spec has imported another organisation's decision as though it were a fact. This repository
has a different owner, and that override is theirs to make or decline.
