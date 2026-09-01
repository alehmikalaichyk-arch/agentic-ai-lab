# Next session: take HorizontalStepper through PR-1

An externally-authored specification from another design system arrives as the owner's ask. This
is the session that turns it into a Component Requirements Brief and a spec for *this* repository
— stage #0, #1, #2 and #4, plus a visual draft. It produces **two** pull requests: PR-0 carrying
the brief alone, then PR-1 carrying the spec and the draft. The implementation is PR-2, in a
separate session, and the write-time guard enforces that split.

**The brief and the spec must not share a pull request**, and nothing mechanical stops them.
`.claude/rules/ds-component-pipeline.md` §*"Stage #0 is not a PR boundary"* says the brief *"never
travels with a spec or with source. It ships in its own PR, before PR-1."* But
`tools/classify-pr-diff.sh` reads only `docs/component-specs/` and `docs/component-retrofits/` — it
never looks at `docs/component-requirements/`. A PR carrying both classifies `SPEC_ONLY`, every
gate goes green, and the violation ships silently. Two branches, checked by eye.

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
| Branch | `spec/horizontal-stepper` — created, rebased onto `f135d17`, **zero commits of its own** |
| `main` at handover | `f135d17 fix: four drift findings from the first real pipeline run (#13)` |
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

## Drift found, and what happened to it

Four findings came out of the stopped session. **All four are fixed on `main` in `f135d17`**, and
each fix below was independently re-verified rather than taken on report. They are kept here
because the next session should know what was true and why the current state is not an accident.

### 1. The visual draft was ungoverned — FIXED

The rule states *"A draft is TypeScript, and is typechecked. `tsconfig.json` includes this
directory."* It did not: `include` listed `prototypes`, not `component-prototypes`, and `lint`
globbed the same two directories. A draft could carry a type error no gate saw — the exact failure
the rule's own PR #127 measurement records.

Now: `tsconfig.json` `include` carries `component-prototypes`, and `lint` is
`eslint --no-error-on-unmatched-pattern 'src/**' 'prototypes/**' 'component-prototypes/**'`. The
flag is there because both draft directories are empty between components, and a lint that goes red
when there is nothing to lint teaches everyone to ignore it. Verified by mutation: a type error in a
draft now fails.

### 2. PR-1 could not show the owner anything — FIXED

`ci.yml` had no Storybook build and `storybook-pages.yml` triggers only on push to `main`, so a
draft on a spec branch stayed invisible until after the merge it was meant to inform.

Now: `ci.yml` runs on `pull_request`, builds Storybook and uploads it via `upload-artifact` as
`storybook-<PR number>` (~2 MB). **Not a link** — a reviewer downloads the artifact and opens it. So
PR-1's mandatory `## Visual` section points at the CI artifact, with screenshots as a fallback
rather than the only option.

### 3. The skills did not read `ds-kit.config.yml` — FIXED, and the measurement was understated

The stopped session reported two skills ignoring the config. The real number was **nine of ten**,
while the config's header claimed all of them read it.

The fix is architectural rather than ten amendments: **`ds-context` is the single reader**, at its
new §0 *"Resolve the paths before reading anything"*, and carries the resolved values into the
Context Snapshot under `paths` — which every downstream skill already consumes. So nine skills still
do not open the file, by design, and the header's claim is now true because it describes what
happens.

**This makes `ds-context` §0 load-bearing for the whole run.** If stage #1 does not read
`ds-kit.config.yml` as its first action, that is a regression — report it rather than working
around it.

### 4. Tests named as pins did not exist — FIXED

The rule cited `tools/visual-draft-boundaries.test.ts`, `tools/pr1-document-boundary.test.ts` and
`tools/check-frozen-spec-on-base.test.ts` as the pins for load-bearing claims. None existed. The
references are corrected, and `ds-pipeline-kit/verify.sh`'s existing `check_absent "no reference to
unshipped enforcers"` guard now covers those three names, so the class cannot silently return.

### Still true, and still unfixed — report if it matters, do not fix here

- The rule describes ESLint "features 289/290" as a blocking mechanical floor for raw hex literals
  and arbitrary px values. `.eslintrc.cjs` has no hex rule, no arbitrary-value rule and no import
  restriction — only recommended sets plus two react-hooks rules. Governance §15's Blocker tier has
  no mechanical enforcer; only `token-guardian`, in session.
- Governance §11 "current CI gating" asserts Playwright (absent) and lists lint as a *gap* (it
  runs).
- `ds-context` §6 says *"Do not bake any inventory list into the snapshot template"*; §7 then bakes
  an eight-entry `stack:` list of which **four are false here** — no shadcn (`components.json`
  absent), no Radix (zero packages), no Webpack (Vite 6 + `@vitejs/plugin-react`), no Playwright.

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

## Not blocked — the run goes end to end

An earlier revision of this document held the run before stage #4.5, because a draft the owner
could not see is not a checkpoint and a draft that can carry an unseen type error is the failure the
kit's own measurements record. Both were fixed in `f135d17` before the next session started, so the
hold is lifted and the run goes Step 0 through PR-1 without stopping.

Rebase onto `f135d17` or later first. On an older base the draft is neither typechecked nor built
into a reviewable artifact, and the run silently reverts to the state that caused the hold.

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

GOAL: take HorizontalStepper through stage #0 and stage #4 — a requirements brief
and a component spec, authored through the pipeline's own stages. No implementation:
that is PR-2, in a separate session, and the write-time guard is LIVE and will
enforce that split.

THREE PRs, NOT TWO — and nothing mechanical enforces this, so read it carefully.
  PR-0  docs/component-requirements/horizontal-stepper.md      (the brief, alone)
  PR-1  docs/component-specs/horizontal-stepper.md + the draft (the spec)
  PR-2  implementation                                          (a later session)
The rule is explicit at .claude/rules/ds-component-pipeline.md §"Stage #0 is not a
PR boundary": the brief "never travels with a spec or with source. It ships in its
own PR, before PR-1."
The trap: tools/classify-pr-diff.sh reads ONLY docs/component-specs/ and
docs/component-retrofits/. It never looks at docs/component-requirements/. So a PR
carrying the brief AND the spec classifies SPEC_ONLY, every gate goes green, and the
violation ships silently. This boundary is yours to hold; no check will catch you.
Use two branches. Do not put the brief on the spec branch.

INPUT — an externally-authored specification from another design system. Treat it
as the owner's ask, not as the deliverable. Both paths are readable directly with
the Read tool; the previous session confirmed this, so no /add-dir and no .input/
copy is needed:
  brief: /Users/olegmikolajcik/pegbo/docs/design-system/component-requirements/horizontal-stepper.md
  spec:  /Users/olegmikolajcik/pegbo/apps/shared/design-tokens/docs/component-specs/horizontal-stepper.md

BASE REQUIREMENT — rebase onto f135d17 or later before doing anything.
Two defects that gated the visual draft were fixed there: component-prototypes/ is
now typechecked and linted, and CI builds Storybook on every pull request and
uploads it as an artifact. On an older base the draft is neither checked nor
reviewable and the run silently loses both. Verify, do not assume:
  grep -n component-prototypes tsconfig.json package.json
  grep -n "pull_request\|upload-artifact" .github/workflows/ci.yml

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
  #1 ds-context     — the Context Snapshot. Two things to watch, both load-bearing:
                      (a) its FIRST action must be reading ds-kit.config.yml (§0).
                          ds-context is the single reader of the config for the whole
                          kit and carries resolved paths into the snapshot under
                          `paths`; downstream skills take their paths from there and
                          never open the file. If §0 does not happen, that is a
                          REGRESSION — report it, do not work around it.
                      (b) it should report the empty component inventory as a
                          WARNING, not halt. That warning is correct information:
                          this is the first component in the repository. Carry it
                          into the stage #0 brief as a real input to the
                          requirements, not as noise to suppress.
  #2 ds-governance  — the Governance Rule Set.
Report where the live repository contradicts what a skill asserts. The previous
session found four drift items, all since fixed; re-confirm rather than inherit,
and expect to find different ones.

STEP 3 — stage #0, component-requirements-builder, same agent.
Do this on its OWN branch off main, not on spec/horizontal-stepper:
  git checkout main && git checkout -b spec/horizontal-stepper-requirements
Keep the spec/ prefix: it is what makes the write-time guard active on the branch.
Feed it the two input documents as the owner's ask. Both outputs matter:
  - docs/component-requirements/horizontal-stepper.md — the brief (the directory
    does not exist yet)
  - the repository feasibility audit — binding facts and named conflicts
Report the audit IN FULL. A conflict it names is worth more than a brief it writes.

Then open PR-0 with that ONE file and nothing else. Verify before opening:
  git diff --name-only main...HEAD
  # must print exactly: docs/component-requirements/horizontal-stepper.md
Report its URL and head SHA. A human merges it; you do not. You do NOT have to wait
for that merge to continue — no gate blocks PR-1 on PR-0 — but the brief must not
appear in PR-1's diff, which is why it lives on a different branch.

STEP 4 — stage #4, component-spec-writer, same agent.
Switch back first: git checkout spec/horizontal-stepper
The brief is in your session context; the spec does not need PR-0 merged.
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

STEP 5 — the visual draft, same agent. component-prototypes/ (ds-kit.config.yml
paths.drafts) holds only a .gitkeep; the draft will be the first real thing in it.
Render the stepper at its states and actually look at it — a draft catches geometry
and contrast no gate catches.
It IS typechecked and linted now, so run both and report the results:
  npm run typecheck > /tmp/tc.log 2>&1; echo $?; tail -20 /tmp/tc.log
  npm run lint      > /tmp/lint.log 2>&1; echo $?; tail -20 /tmp/lint.log

STEP 6 — open PR-1, the SPEC pr. A human merges it; you do not.
Before opening, run: git diff --name-only main...HEAD
Two things must hold, and only the first has a gate behind it:
  - nothing under src/ — the boundary between PR-1 and PR-2
  - nothing under docs/component-requirements/ — the brief belongs to PR-0, and no
    check will tell you if it leaked in. Confirm by eye.
Everything left must be docs/component-specs/ or component-prototypes/.
Report the PR URL AND the head SHA. The review gate counts an approving review only
when its commit_id equals the current head SHA. After reporting it, push nothing
further: a new commit resets the gate to pending and silently invalidates an
approval already given.
The PR body needs a `## Visual` section — required by the rule, and the reason is
that a reviewer approving a spec they have not seen rendered is approving prose.
CI now builds Storybook on every pull request and uploads it as an artifact named
`storybook-<PR number>` (~2 MB), so point `## Visual` at that artifact — it is a
download, not a link, so say so plainly — and add screenshots of the main states as
a fallback. Confirm the artifact actually exists on YOUR pr before citing it:
  gh run list --branch spec/horizontal-stepper --limit 3
  gh api repos/alehmikalaichyk-arch/agentic-ai-lab/actions/artifacts \
    --jq '.artifacts[] | select(.name|startswith("storybook")) | "\(.name) \(.size_in_bytes)"'
Also note in the body whether the guard was live during this work; a gate's state
during a change belongs in the record.

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
  - BOTH pr URLs and head SHAs — PR-0 (brief) and PR-1 (spec + draft) — and the
    `git diff --name-only main...HEAD` output for each, showing they do not overlap
```

---

## What a good outcome looks like

**Two** pull requests open and unmerged, with disjoint diffs:

- **PR-0** — `docs/component-requirements/horizontal-stepper.md` and nothing else.
- **PR-1** — `docs/component-specs/horizontal-stepper.md` reading `lifecycle: freeze_candidate`,
  plus a draft under `component-prototypes/`, plus a `## Visual` section a human can act on.

Every token binding in the spec shown resolving to a real utility in `generated/tailwind-theme.css`
— not asserted from the source system's table.

**If one PR carries both documents, the run failed even though every check was green.** That is the
whole point of the unenforced boundary above, and it is the cheapest thing on this page to get
wrong.

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
