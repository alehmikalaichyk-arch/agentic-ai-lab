# Next session: take HorizontalStepper through PR-2

The spec and its visual draft are in PR-1; the requirements brief is in its own PR before it. This
is the session that builds the component — implementation, tests, stories, accessibility pass, and
the quality gate.

It has to be a **new** session, and not for tidiness: the session that wrote the spec cannot write
the source. `ds-pipeline-guard.sh` condition 2 blocks a PR-1 document and that component's source
in one agent session, in either order. That is the in-session form of the PR-1/PR-2 boundary, and
it is live.

Paste the prompt below into a fresh session opened in a clone of
`https://github.com/alehmikalaichyk-arch/agentic-ai-lab`.

---

## Read this first: the run stops before it starts unless two things are true

**PR-1 must be merged.** The rule's HARD STOP is not advisory — stage #5 does not begin until
`gh pr view --json state` returns `MERGED`. A spec is frozen by being merged, and a human performs
that merge.

**The freeze blockers must be resolved in the merged spec.** The spec ships at `lifecycle: draft`
carrying three, and two of them are decisions reserved to this repository's governance owner:

| | What has to be decided |
|---|---|
| **FB-1** | Governance §15 Requires-Review, on two grounds — new component, new boundary overlap. The source system's approval was granted by *its* owner and does not transfer. |
| **FB-2** | Whether the current segment may be drawn partly filled. **This chooses between two different components.** Option A (CR-007, three solid tones) distinguishes states at 2.67:1 and degrades badly as segments narrow — at ~25px the current segment has to be hunted for. Option B (half-fill) distinguishes at 7.55:1 and degrades well, but turns the whole strip into a percentage: `[half, empty, empty, empty]` reads as 12.5 % complete. |
| **FB-3** | A precondition, not a decision: the brief reads `status: draft` where the skill wants `ready-for-spec-authoring`. |

If the merged spec still carries an unresolved FB-1 or FB-2, **stop and say so**. Building either
option on your own authority is exactly the failure the pipeline caught once already, when a
decision made by another organisation's owner arrived inside a document and would have been
inherited silently.

---

## Traps in this repository that a careful implementer still walks into

Each was measured during PR-1. None is a matter of taste.

**Motion compiles, and it is the wrong motion.** `generated/tokens.css` defines ten `--ds-motion-*`
properties. `generated/tailwind-theme.css` publishes **zero** — there is no token-derived
`duration-*`, `ease-*` or `transition-*` utility. But `duration-150` and `ease-out` **do** compile,
from Tailwind's own defaults, which `src/styles.css` never neutralises. Their values are
byte-identical to `--ds-motion-duration-normal` and `--ds-motion-easing-ease-out`. So
`transition-all duration-150 ease-out` renders exactly right through entirely the wrong channel,
and nothing asserts otherwise. **The spec resolved this: no motion at all.** Do not add a transition.

A corollary worth knowing before you write a guard for it: Tailwind v4 scans tracked Markdown, so
the spec paragraph forbidding those three utilities materialises them into the compiled stylesheet.
A guard that greps build output would be defeated by the document that forbids them. It must scan
component source.

**`-boldest` does not mean dark.** This component binds two `-boldest` tokens as adjacent segment
tones: `surface-neutral-boldest` is `#c5c8d1`, a *light* grey, and `surface-accent-grey-boldest` is
`#2d3342`, near-black. Same suffix, opposite ends of the ramp, two rows apart in the same table.

**`default` is the lighter weight.** `--ds-font-body-sm-default` is weight **300**;
`--ds-font-body-sm-moderate` is weight **400**. Binding the label to `moderate` and the count to
`default` inverts the subordination the spec requires while looking correct in a diff.

**Primitives have no Tailwind utility, by construction.** `--ds-brand-500` exists in `tokens.css`
and `bg-brand-500` does not exist. Reaching for one means reaching past the semantic layer.

**`--ds-fg-subtlest` fails AA on one of the two page surfaces** — 4.49:1 on `surface-page`, 4.73:1
on white. The spec moved the separator off it onto `fg-subtle` for that reason. It appears in
neither `PAIRS` nor `KNOWN_BELOW_AA` in `src/tokens.test.ts`; adding it to `KNOWN_BELOW_AA` is a
PR-2 test facet the spec names.

**Verify a utility by compiling, not by grepping the theme.** `generated/tailwind-theme.css` is
exactly the file `src/tailwind-surface.test.ts` exists because of — it once said everything was
fine while `bg-red-500` still worked.

---

## What the identifier check does and does not protect

`tools/check-no-source-identifiers.sh` runs in CI and reads its patterns from `.identifiers`, which
is **gitignored** — the script's own header explains why: "a check for a brand that publishes that
brand is the failure it exists to prevent."

The consequence is worth stating plainly rather than discovering: **on CI the file never exists, so
the check always prints `SKIP: … this check verifies NOTHING` and exits 0.** It is a local
instrument for whoever copies `.identifiers.example` and fills it in. Treat the repository's public
status as your own responsibility, not the gate's — no organisation name, no ticket id, no product
screen name, no absolute path, in source, tests, stories or commit messages.

---

## The prompt

```
Repository: agentic-ai-lab. You are in it.

TASK: take HorizontalStepper through PR-2 — implementation, tests, stories, the
accessibility pass and the quality gate — following the pipeline rather than
working around it.

WHY THIS IS A FRESH SESSION: ds-pipeline-guard.sh condition 2 blocks writing a PR-1
document and that component's source in one agent session, in either order. The
session that wrote the spec therefore cannot write the component. That is the
boundary working, not an inconvenience.

STEP 0 — prove the pipeline loaded, and prove the gate is passed.

First run the checks in docs/verify-pipeline-loaded.md. Two probes matter most:
  a. For EVERY skill you invoke, report the `Base directory for this skill:` line
     VERBATIM. Each must be inside THIS repository. A same-named skill from another
     project loads silently and reads plausibly; the base directory is the only
     reliable discriminator.
  b. Agent(subagent_type: "frontend-engineer") must resolve AND actually have the
     Skill tool. Ask it to enumerate its own tool schema — "present and resolvable"
     is not "can run a stage". Agent definitions are read at session start, so a fix
     pulled mid-session may not be in effect.
If the verdict is anything other than LOADED, STOP.

Then verify the HARD STOP is satisfied. Do not take my word for any of it:
  gh pr list --state merged --limit 10 --json number,title
  gh pr view <PR-1 number> --json state        # must be MERGED
  git log origin/main --oneline -5
  ls docs/component-specs/horizontal-stepper.md docs/component-requirements/horizontal-stepper.md
Both the brief and the spec must be present on origin/main. A spec is frozen BY
BEING MERGED — the file may still read `lifecycle: draft` or `freeze_candidate` and
that is correct. Do NOT "fix" it to frozen; no agent and no person writes that value.

Then read the merged spec and check its freeze blockers. FB-1 (the §15
Requires-Review approval) and FB-2 (whether a segment may be drawn partly filled)
are decisions for THIS repository's owner. If either is still unresolved in the
merged spec, STOP and report it. FB-2 in particular chooses between two different
components — do not pick one yourself.

STEP 1 — set up.
  npm install && npm run build:tokens
  git checkout -b feature/horizontal-stepper-implementation
generated/ is gitignored, so every token check silently reads an empty directory
without that build.
The branch prefix matters: on a spec/ branch the guard refuses component source by
design. feature/ is not protected, which is correct here and means the guard will
NOT catch a mistake for you — CI and the gate will.

STEP 2 — run the stages, delegating each to the agent ds-kit.config.yml names.
Read the config: agents.implementer runs #1-#7, agents.gate runs #8. Use the Agent
tool — do not run the stages yourself in this session.

  #1 ds-context     #2 ds-governance     #3 token-guardian (pre-scan)
  #5 component-implementation            #6 storybook-stories-generator
  #7 a11y-interaction-review

Stages #0 and #4 are done and merged. Do not re-open the brief or the spec.
Note that ds-context §0 reads ds-kit.config.yml as its FIRST action and is the only
skill that reads it, carrying resolved paths into the Context Snapshot that every
downstream skill consumes. If §0 does not happen, that is a regression — report it.

STEP 3 — delete the visual draft.
component-prototypes/horizontal-stepper/ is scaffolding and the rule says PR-2 is
where it goes. Removing it is part of this PR, not a follow-up.

STEP 4 — the gate, in a SEPARATE agent invocation.
Delegate production-quality-gate to agents.gate as a fresh Agent() call, never as a
continuation of the implementing work. In the implementer's context it inherits the
implementer's reading of the spec, and a spec-versus-code mismatch — the thing it
exists to catch — then reads as agreement. Report its verdict verbatim, including a
FAIL. On FAIL: report and stop. Do not retry implementation autonomously, do not
merge, do not mark anything complete.

STEP 5 — open the PR. A human merges it; you do not, and you do not approve it.

BUILD WHAT THE SPEC SAYS, NOT WHAT SEEMS BETTER. Where you disagree, say so in the
PR body as a follow-up. The spec was merged by a human; that is what makes it the
contract. It carries 20 acceptance criteria — expect a test file that addresses each
by name.

TRAPS MEASURED DURING PR-1 — verify each rather than trusting this list:

- NO MOTION. tokens.css has ten --ds-motion-* properties; tailwind-theme.css
  publishes zero. But `duration-150` and `ease-out` DO compile from Tailwind's own
  defaults, and their values are byte-identical to --ds-motion-duration-normal and
  --ds-motion-easing-ease-out. You would get exactly the right rendering through
  entirely the wrong channel. The spec resolved this: no transition at all.
- `-boldest` is not "dark". surface-neutral-boldest is #c5c8d1, a LIGHT grey;
  surface-accent-grey-boldest is #2d3342, near-black. Both are segment tones, two
  rows apart in the same table.
- `--ds-font-body-sm-default` is weight 300 and `--ds-font-body-sm-moderate` is 400.
  "default" is the LIGHTER one. Inverting them looks correct in a diff.
- Primitives have no Tailwind utility by construction. `bg-brand-500` does not exist.
- `--ds-fg-subtlest` measures 4.49:1 on surface-page and 4.73:1 on white. The spec
  put the separator on fg-subtle for that reason. Adding the failing pair to
  KNOWN_BELOW_AA in src/tokens.test.ts is a test facet the spec names.
- Verify a utility by COMPILING Tailwind against the repo's own import chain, not by
  grepping generated/tailwind-theme.css — that file is exactly what
  src/tailwind-surface.test.ts exists because of.

GOVERNANCE RULES THAT DECIDE THE SHAPE OF THE CODE:

- §6.1: spread `...props` FIRST, own attributes after. A spread placed last lets a
  caller overwrite data-slot, which is how every harness finds the element.
- §6.2: this is an INERT component and steppers are named in that set. Keep the wide
  React.HTMLAttributes rest type. Do NOT Omit tabIndex, role or event handlers to
  enforce inertness — §6.2 says why: it advertises as a guarantee something a ref and
  a listener walk straight past. The second safeguard IS required: a NODE_ENV-gated,
  once-per-mount development warning naming the prop and the value received.
- Every design value comes from a semantic token, via cn() from src/lib/utils.ts.
- The spec's D14/D15 corrections are load-bearing and came from the visual draft:
  the separator and label share ONE clipping box (so no width can render a trailing
  separator with nothing after it), and the root carries min-w-min with the count
  shrink-0 (so below intrinsic width the component refuses to shrink and the
  container overflows visibly instead of failing where review cannot see it). The
  text row's internal gap is a bound token, not a space character — flex collapses
  the whitespace a separator would sit in.

THIS REPOSITORY IS PUBLIC AND ON A PERSONAL ACCOUNT. Nothing you write may name the
source organisation, its people, its ticket ids, its product screens, or a path on
anyone's laptop — in source, tests, stories, or commit messages. Note that
tools/check-no-source-identifiers.sh reads .identifiers, which is gitignored, so on
CI it always SKIPs and verifies nothing. This is yours to hold, not the gate's.

EVIDENCE I want in the final report:
  - the step 0 verdict, with every `Base directory for this skill:` line quoted
  - the merge confirmation: gh pr view output showing MERGED, and the blockers'
    resolution as the merged spec records it
  - which agent ran which stage
  - each check as command -> actual output. Never `npm test | tail`: that returns
    tail's exit code, which is 0 almost always. Redirect, echo $?, then read.
  - the gate's verdict, unedited, including a FAIL
  - proof the draft was deleted
  - the PR URL and the head SHA

If the guard blocks a write, report exactly what it said including which rule file it
cited, and stop that line of work. Do not route around it with a shell heredoc — a
block is a finding about the session, not an obstacle.
```

---

## What a good outcome looks like

The component exists at `src/components/ui/horizontal-stepper.tsx`, exported from the barrel, with
a test file addressing the spec's 20 acceptance criteria by name, stories, an a11y pass, the draft
deleted, and the gate saying PASS with its evidence. The PR is open and unmerged.

## What is worth noticing regardless of outcome

**If the gate says FAIL**, that is the pipeline working. A first implementation that passes a real
gate on the first attempt is more often a weak gate than strong code.

**If the implementation adds something the spec does not describe** — an `onClick`, a hover state,
a size the spec does not list, a transition — that is the failure mode the PR-1/PR-2 split exists
to prevent, and it is worth recording rather than quietly correcting.

**If a token binding turns out not to compile**, that is a finding about the token layer, not a
reason to substitute a near-enough utility. PR-1 found two such gaps by compiling rather than
grepping, and both changed the spec.
