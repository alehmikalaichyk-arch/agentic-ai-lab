---
# GENERATED FILE — DO NOT EDIT.
# Source: plugin/skills/ds-component-pipeline/SKILL.md
# Regenerate: ./tools/make-rule.sh
# Trigger globs are read from ds-kit.config.yml.
applies-when:
  - "src/components/ui/**"
  - "src/components/**"
  - "docs/component-specs/**"
  - "docs/component-retrofits/**"
  - "docs/component-requirements/**"
  - "component-prototypes/**"
---


# DS Component Pipeline — Agent Rule

Applies to: all work touching component source or a component decision document, and to any DS
skill invocation for a new or modified DS component.

## Authority

DS stack identity, token architecture, and the component inventory are produced by
`ds-context` (#1); the rules over them are produced by `ds-governance` (#2). This rule
covers the **PR boundary structure** and the **human-merge checkpoint**. It does not
redefine governance rules — those belong to #2.

Every path, branch name, script name and check name in this rule is a placeholder for a
key in `ds-kit.config.yml` at the repository root. Where this rule writes
`docs/component-specs/`, read `paths.specs`; where it writes `src/components/`, read
`paths.components_ui` and `paths.components_composite`; where it writes `main`, read
`main_branch`. Illustrative paths are kept literal for readability — the config is
authoritative.


## Pipeline Overview

The DS component pipeline runs stages #0–#8 across 2 PR boundaries:

```
#0 requirements brief (owner's ask, normalised + feasibility-audited)
  ↓
#1 context → #2 governance → #3 token-guardian → #4 spec (freeze_candidate)
  ↓
[visual draft — the owner looks; feedback is folded into the spec, not the draft]
  ↓
[PR-1: spec (+ the draft) — review-approved check → human merge → frozen]
  ↓
#5 impl+tests → #6 stories → #7 a11y → #8 quality gate
  ↓
[PR-2: impl+tests+stories+a11y, and deletion of the draft]
```

**Stage #0 is not a PR boundary.** A Component Requirements Brief lives at
`docs/component-requirements/<component>.md` (`paths.requirements`), outside every path the
diff classifier reads, so the PR gates never classify it and it never travels with a spec or
with source. It ships in its own PR, before PR-1.

**Why #0 comes first, when its audit reads the repository.** Normalising the owner's ask must
not be conditioned on what the codebase already contains, or the requirements silently become a
description of the status quo. The audit phase then consults #1 and #2 freely — technical data
checks the input, it does not define the output. See `component-requirements-builder` §2.

**Stage #0 is scoped by promises, not by newness.** It runs when a new component is proposed, and
equally when an existing component's **promises** change — props, variants, defaults, observable
behaviour, or accessibility contract — whether or not a spec exists. TextArea was exactly the second
case: an ask that read as greenfield and was in fact an evolution of a component consumed in 6
places.

It does **not** run for: appearance changes that stay inside promises already made; token-only
changes; bug fixes that restore documented behaviour. For those the existing gates
carry the quality, and a brief would only add a second place for the same facts to live.

Note that #0's scope is therefore **wider than the rest of this pipeline**, which covers new
components only. A promise-changing modification of an existing component gets a brief and then follows the
"Changing an EXISTING Component" path below — not the #1–#8 new-component chain.


## PR Boundaries — Binary Definitions

### PR-1: Frozen Spec Only

**Allowed files in PR-1:**
- `docs/component-specs/<component>.md` — the component spec
- `component-prototypes/<component>/**` — the visual draft, if one was made
  (see "Visual draft" below). Outside every classified path, so it does not change PR-1's
  classification: a PR carrying a spec plus a draft is still `SPEC_ONLY`.

**Forbidden files in PR-1:**
- Any file under `src/components/` — NO implementation
- Any file under `src/` other than component specs — NO stories, NO tests
- Any token file under `tokens/` that exists solely to support the new component

**Violation:** PR-1 contains any file from `src/components/<c>/` or `src/components/ui/<c>.tsx`
alongside `docs/component-specs/<c>.md`. This is a PR boundary violation regardless of how many
other files are in the PR.

**PR-1 body — required sections.** In addition to the standard task reference and
acceptance-criteria checklist:

| Section | Content |
|---|---|
| `## Visual` | **Both**: a live link to the draft's own story, and screenshots. See "Serving the draft" at the end of the visual-draft section — the link is what gets the draft looked at, the screenshots are what survive after the server stops. |
| `## Draft reuse` | If a draft exists: which of its decisions the spec adopted, and which were rejected. If no draft was made: one line saying why. |

The `## Visual` section is what makes the human control point real. A reviewer approving a spec
they have not seen rendered is approving prose, and prose is exactly what the twelve post-freeze
revisions were rewriting.

**A spec may carry a machine-readable `contract:` block.** Where it does, that block is meant to
be checked against the built component once PR-2 lands, and the spec additionally linted for hex
literals, TS/JS fenced blocks, and px values a token already carries. Adoption is opt-in: a spec
without the block is skipped, so existing specs are unaffected.

> **This kit ships the convention, not the checker.** The drift test and the spec linter are not
> in `repo-enforcement/` — they are the one part of the system this was extracted from that is too
> coupled to its own token build to travel. Until you write them, a `contract:` block is **read by
> humans and enforced by nothing**. Say so where your team will read it, rather than inheriting the
> paragraph below and assuming a red build that will not happen.

Two consequences for the PR boundary, and no gate changes for either:

- **PR-1 with a contract block is still `SPEC_ONLY`.** The classifier reads only
  `src/components/**` and the two PR-1 document directories; a YAML block inside a spec file is
  invisible to it. The drift test reports the spec as *pending implementation* and skips it.
- **PR-2 is where the contract binds.** From the moment the component exists, a divergence between
  the two is a red build rather than a review finding. A contract that is wrong therefore fails
  PR-2, not PR-1 — which is the correct place, since PR-1 has no component to be wrong about.

If you build the checker, give it a normative schema document of its own and point at it from
here — one definition, in the repository where the test lives. The authoring rules an author must
follow are in `component-spec-writer` §8d.

### PR-2: Implementation + Tests + Stories + A11y

**Allowed files in PR-2:**
- `src/components/ui/<component>.tsx` — implementation
- `src/components/<component>/` — composite component directory
- `src/components/ui/<component>.test.tsx` — unit tests
- `src/components/ui/<component>.stories.tsx` — Storybook stories
- `e2e/<component>.spec.ts` — Playwright E2E tests
- Token files under `tokens/` that the component requires (must reference semantic tokens per governance #2 §3)

**Forbidden files in PR-2:**
- `docs/component-specs/<c>.md` — spec must already be merged via PR-1

**Violation:** PR-2 opens before PR-1 is merged. PR-2 includes a new component spec file
alongside implementation code.

## Visual draft — between stage #4 and PR-1

**Why this step exists.** The owner's first sight of a component used to be after it was
implemented, so visual decisions arrived as revisions to an already-frozen spec: 12 spec
revisions against 10 initial freezes, four of them explicitly owner-visual (a
divider's default variant, a context-switcher, a checkbox-card's resting border, an accordion
header's height). Those decisions cannot be made from prose. The draft moves them before the freeze.

**Where the draft lives.** `component-prototypes/<component>/<component>.stories.tsx` at the
**repository root** of the DS repository. See that directory's README for the full contract. It is
deliberately outside `src/`: consumer apps alias `@design-tokens` directly at `src/`, so a draft
cannot be imported by a product app, and the published package ships only `build/` and `tokens/`.

**Not under `.storybook/`, and this rule said otherwise until 2026-08-14.** The dot-directory was
tried and measured to fail in a way no gate could see: Storybook **indexed** the drafts — they
appeared in `storybook-static/index.json` and CI's index cross-check passed — but the built preview
could not load the module, so every draft rendered `Cannot find module './.storybook/…'` instead of
a picture. `build-storybook` exits 0 either way. The only way to notice was to open the story,
which is the one thing the artifact exists for. Full measurement:
`component-prototypes/README.md`. **This kit ships no test pinning it** — in the system it came
from, one existed and failed
any `stories` glob in `.storybook/main.ts` carrying a dot-directory segment.

**A draft is TypeScript, and is typechecked.** `tsconfig.json` includes this directory, so
`npm run typecheck` covers it — narrowly and deliberately. Measured on PR #127: a blatant type
error in a draft passed `typecheck`, `lint` **and** `build-storybook`, because Storybook transpiles
without typechecking and the other two were scoped to `src/`. The draft is the evidence the human
freeze gate looks at, so it had no quality floor at the moment it mattered most. What the gate
still does not catch — a mistyped Tailwind class, the wrong token picked deliberately, wrong
spacing — is exactly what the human is looking at the draft *for*.

**How the owner sees it.** Every the DS repository pull request uploads its built Storybook as an
artifact and links it from a PR comment (`.github/workflows/ci.yml`). The draft renders there
under "Prototypes", alongside the real components. No local checkout, no local deploy.

**Who looks, and what happens to the feedback.**

| Question | Answer |
|---|---|
| Who reviews the draft | The owner — the person whose visual decisions the spec is encoding. Not the reviewer bot: the reviewer bot reviews the spec text, and cannot see a rendering. |
| Where the feedback lands | In the **spec**. The draft is re-rendered as often as needed and carries no history obligation; it is the spec that must end up correct. |
| Who decides the freeze | A human, by merging PR-1. Unchanged by this step. |
| When the draft is deleted | In PR-2. It is scaffolding. |

**The draft never freezes a spec.** Running the draft step, and getting a "looks right" from the
owner, is not a freeze. The spec stays a freeze candidate until a human merges PR-1 — that merge
is the only thing that makes a spec `frozen`.

**`frozen` is a fact, not a field.** The spec file's `lifecycle` tops out at
`freeze_candidate`; no agent, human or script writes `frozen` into it. A spec is frozen when it
is present on the DS repository `origin/main`. This is not a new convention — it is the one CI has
always enforced (`require-document-on-base` reads **file presence at the base SHA**), now
stated once instead of competing with a declarative copy that drifts. The measurement that
settled it: of the 29 specs on `main`, **11 carry no `lifecycle` field at all** and shipped
anyway, 16 say `frozen` because their author wrote it, and `textarea.md` says `draft` after
its PR-1 merged. Full rationale: `component-spec-writer` §3.

**Draft reuse — the constraint, verbatim:**

> The draft may seed the implementation only where that does not prematurely fix the public API
> or internal architecture.

Concretely: appearance decisions carry over — spacing, colour roles, density, which states are
visually distinct. Prop names, component boundaries, state ownership and DOM structure do not.

**A draft is not "80% of the implementation" and must not be presented as one.** For an
interactive component the weight sits in state, focus management, the controlled/uncontrolled
API and accessibility. A picture addresses none of them.

**No gate changes for this step, and that is load-bearing.** `tools/classify-pr-diff.sh` reads
only `src/components/**` and the two PR-1 document directories (`docs/component-specs/**` and,
since an earlier change, `docs/component-retrofits/**`); `ds-pipeline-guard.sh` blocks only the
two conditions listed under "What the PreToolUse hook actually enforces", and neither can reach a
draft — condition 1 is scoped to `src/components/**`, and condition 2 fires only between that path
and a PR-1 document (`docs/component-specs/**` or `docs/component-retrofits/**`). The guard has no
knowledge of the draft directory at all. A draft path is outside all of them, so PR-1 carrying a draft is still
`SPEC_ONLY` and a write to a draft is not blocked. That is the rule as written, not a way
around it — and it is pinned by regression tests rather than by this paragraph:

| Claim | Test | Runs in |
|---|---|---|
| A spec PR carrying a draft stays `SPEC_ONLY`; a draft adds no component to the one-per-PR count | **nothing in this kit** — the classifier behaves this way, and no test pins it. Write one, or verify it by hand on the first draft PR | — |
| Neither hook condition fires on a write to a draft path | `ds-pipeline-guard.test.sh` (ships with the hook, Level 2) | CI |

If either fact stops holding, those tests fail. They exist so that a future edit to the
classifier or the hook cannot silently reclassify every draft as component source.


### Serving the draft — the agent starts it and reports the exact story URL

**When PR-1 opens, the agent starts a local Storybook and reports two links: the pull
request, and the draft's own story.** Not the Storybook root — the story. "It is in
there somewhere, look for it" is how a checkpoint quietly becomes optional.

```bash
npm run storybook &
./tools/draft-links.sh <component>
```

Neither obvious alternative gives one click. A published Storybook deploys from the
main branch, so it cannot show a draft that lives on a spec branch — it would appear
after the merge it was supposed to inform. A CI artifact is a zip to download and
unpack. Both are worth having; neither is a link.

Two obligations come with the link, because a link that misleads is worse than none:

- **Say that it is local and temporary.** The server stops when the session does, and
  a reviewer clicking a dead localhost link assumes they broke something.
- **Attach screenshots anyway.** They are the durable record — the thing still
  readable when someone re-reads the pull request in a month to ask why a decision
  was made.

Resolve the URL from the running server's index, never by composing it from the
title. Storybook slugs story ids by its own rules, and a guessed id loads the shell
and silently shows nothing — indistinguishable from a draft that renders empty.

## Changing an EXISTING Component

The PR-1/PR-2 structure above governs **new** components. Modifying a component that
already shipped is a different path. Which path applies depends on two questions: does the
change alter the component's public contract, and how many components does it touch?

### Decision table

| Situation | Path | Spec work required |
|---|---|---|
| Change alters the component's public contract (props, variants, defaults, a11y semantics) **and** a frozen spec exists | Spec revision PR (PR-1 shape) → then impl PR | Yes — revise the frozen spec first; see `component-spec-writer` §8b.2 (RA-M1) — **one** authored version in `spec_status.spec_version`, plus append-only `revision_history` and `changelog` entries. Do not hand-edit a frontmatter `version:` copy into a spec that has none. Precedent: `divider.md` v1.1, `chip.md` v1.1 |
| Change alters the public contract and **no** spec exists | Write the spec (PR-1) → then impl PR | Yes — a contract change is the right moment to pay the spec debt |
| Mechanical change to ONE existing component that **has** a frozen spec on base, no contract change (token swap, class rename, internal refactor) | Ordinary impl PR | No |
| Mechanical change to ONE existing component with **no** frozen spec on base | Retrofit addendum PR-1 → then impl PR. Live in CI — see "Existing Component Retrofit" below | A migration addendum, not a spec — see "Existing Component Retrofit" |
| Mechanical change sweeping TWO OR MORE existing components (radius / cursor / token unification) | **One PR per component** — this kit ships no multi-component exemption; see "Cross-cutting changes" below | No |

Writing a full spec from scratch solely to change a border radius is not required and never was.
For a spec-less component the relief is the retrofit addendum — the next section.

### Single spec-less component — the retrofit path

`require-document-on-base` (Job 3 of `pr-gates.yml`) makes **no new-vs-existing
distinction**, and it never will: any PR the classifier labels `COMPONENT_SOURCE` must have an
accepted PR-1 document present at the base SHA. What changed  is that there are now **three** accepted documents, not one:

| # | Path on base | Extra condition |
|---|---|---|
| 1 | `docs/component-specs/<name>.md` | — |
| 2 | `docs/component-specs/<name>-base.md` | the `-base` naming variant |
| 3 | `docs/component-retrofits/<name>.md` | the component must **already exist** on base at its exact layout path |

Source 3 is the standing relief for the single spec-less component, and it is live in CI. The
need is not an edge case: **20 of the 43** production components in `src/components/ui/` have
neither `<name>.md` nor `<name>-base.md` on `main` (measured 2026-08-10).

**Artifact-only edits no longer demand a document.** Job 3 evaluates the classifier's
`real_components`, so a PR touching only `<name>.test.tsx`, `<name>.stories.tsx`, or a
`__snapshots__` entry passes. It still *classifies* `COMPONENT_SOURCE` — the classifier is
unchanged, deliberately: deriving `HAS_COMPONENT_SOURCE` from real components would move a
spec-plus-test PR from `MIXED` to `SPEC_ONLY` and relax the PR-1 boundary. Job 2 still counts
`components`, so the one-component-per-PR rule is unaffected.

Two real options, cheapest first:

| Option | When it applies |
|---|---|
| Write a retrofit migration addendum (PR-1), then the impl PR | The default for a visual-system migration of an existing spec-less component — see "Existing Component Retrofit" below |
| Write the spec first (PR-1), then the impl PR | The component is worth specifying anyway, or the change is close enough to a contract change that the spec is owed |

Do **not** document or assume a single-component *exemption*. There is none: source 3 is a
document requirement, not a bypass — it replaces the spec with a narrower document, and the
pre-existence condition means it can never carry a new component.

### Existing Component Retrofit — the migration addendum

This is the third option above ("change the gate"), specified. It keeps the two-PR shape — a
merged document precedes the implementation PR — and replaces the full frozen spec with a
narrower **migration addendum** bounded to visual-system migration.

**Status: live, and exercised.** `require-document-on-base` accepts a merged addendum as of
a later change. The gate consumes the storage path and entry
condition 1 from this section verbatim, which is why the section was written before the gate
existed — change either here and the gate has to change with it.

**First component through the path**: a close-button, addendum PR →
implementation #131. Use it as the worked example — it is the only one, and its addendum is the
reference for the ten required elements. Its gate log line is what to compare against, because a
green check alone does not tell you which of the three grounds carried the PR:

```text
Retrofit addendum found for 'close-button' at 'docs/component-retrofits/close-button.md' on base
(0681667…), and the component already exists there at its Layout-A path — OK.
```

**Why an addendum and not an inferred exemption.** an earlier change measured the cheaper alternative —
skip the gate when the diff makes no public-API change, determined mechanically from emitted
declarations — and rejected it: on `divider.tsx` a `defaultVariants` flip (a contract change by
this repo's own record, `divider.md` v1.1) and a Tailwind-class-only change produce a
**byte-identical** `.d.ts`. The two cases the check must separate are indistinguishable to it. So
the addendum is an **author's declaration, reviewed and merged** — never a property CI derives
from a diff. That is what makes it a gate rather than a heuristic.

#### Entry conditions — all five must hold

| # | Condition | Checked by |
|---|---|---|
| 1 | The component already exists in `src/components/` | **Mechanically enforced by CI** — `require-document-on-base` tests that the component already exists at the base commit, at its exact classifier layout path. `BASE_SHA` must be set. Not an entry condition an author is merely asked to honour |
| 2 | No frozen spec exists for it | The gate — a component with a spec on base already passes, and needs no addendum |
| 3 | The change makes no public API change | The author, declared in the addendum; the human reviewer at PR-1 |
| 4 | The change makes no interaction, state, or accessibility change | The author, declared in the addendum; the human reviewer at PR-1 |
| 5 | The change is limited to visual-system migration covering tokens, typography, spacing, radius, or colours | The author; the human reviewer at PR-1 |

Condition 1 is called out because it is the one that would otherwise reopen a real bypass: a
genuinely new component whose author hand-writes an addendum would ship with no spec and no PR-1.
The retrofit path must not open that hole, so the check is CI's, not prose's.

#### Where the addendum lives — literal path

```text
docs/component-retrofits/<component>.md
```

Alongside `docs/component-specs/` (`paths.specs`), in the same repository as the components.
`require-document-on-base` resolves its lookup with `git show "${BASE_SHA}:<path>"` inside the
repository under test; a path in another repository would be unreachable from that gate.

Deliberately **not** inside `docs/component-specs/`: in the reference implementation a non-spec
`.md` in that directory failed 4 of the 6 spec-lifecycle tests — one of them globs the whole directory and both
shrink-list assertions compare for exact equality.

**Naming rule.** `<component>` is exactly the component name that `tools/classify-pr-diff.sh`
derives from the source path — not the file's own basename, and not a display name:

| Source layout | Classifier name | Addendum file |
|---|---|---|
| `src/components/ui/<name>.tsx` (layout A) | `<name>` | `docs/component-retrofits/<name>.md` |
| `src/components/<dir>/<anything>` (layout B) | `<dir>` | `docs/component-retrofits/<dir>.md` |
| `src/components/<name>.tsx` (layout C) | `<name>` | `docs/component-retrofits/<name>.md` |

The trap this rule exists to prevent: `breadcrumbs-item` is a file **inside**
`src/components/breadcrumbs/`, so every consumer — the classifier, the gate, and the guard —
resolves it to `breadcrumbs`. An addendum written as `breadcrumbs-item.md` would never be found by
anything. Derive the name from the layout, never from the filename you are editing.

#### One addendum file per component — the decision, and what it costs

**One file per component. There is no shared multi-component addendum document.** The alternative
was considered and rejected: a shared document forces the gate to answer "which components does
this document cover?" by scanning prose, which is the same inference an earlier change rejected, one layer
up. One file per component keeps the gate's lookup a single `git show` by name — and it keeps the
guard's lookup a single component-name comparison in session state. The two are different
operations and only the gate's touches the filesystem: the guard never checks whether an addendum
exists (see "What the guard enforces here, and what it deliberately does not" below). Both stay
one-step only because the component name maps to exactly one filename.

Related components may still share **one PR-1 and one PR-2** — but each component contributes its
own addendum file, with its own token mapping and its own acceptance criteria. Grouping is a PR
convenience, never a document merge.

Note what that costs at the CI layer, so nobody plans around a benefit that is not there: a
retrofit PR-2 touching 2+ components is a `COMPONENT_SOURCE` PR with `COUNT > 1`, so
`enforce-one-component-per-pr` fails it. This kit ships no multi-component exemption — see
"Cross-cutting changes" below. The retrofit path's reason to exist is the single spec-less
component.

#### Required content of a retrofit migration addendum

Each of the ten elements below is required. An addendum missing any of them is not ready for PR-1.

| # | Required element | What it must state |
|---|---|---|
| 1 | Component name and purpose | The classifier-derived name, and one line on what the component is for |
| 2 | Current value and how it is set | The value on `main` today and the mechanism that sets it — a Tailwind class, a CVA variant, an inline style, a token reference |
| 3 | Target design-system token or utility | The exact token or utility replacing it, named as it appears in `tokens.css` / `tailwind-theme.css` |
| 4 | Before and after | The literal old and new source fragments, so a reviewer compares values rather than descriptions |
| 5 | Whether the actual rendered value changes | Yes or no, explicitly. A token swap that resolves to the same pixels is a different review from one that shifts the rendering |
| 6 | Affected variants and states | Every variant, size, and state the change reaches — including states not visible in the default story |
| 7 | Confirmation that public API, behaviour, and accessibility are unchanged | An explicit declaration, not an omission. This is entry conditions 3 and 4 made reviewable |
| 8 | Visual acceptance criteria | What a reviewer looks at to decide the change is correct |
| 9 | Storybook surfaces used for verification | The specific stories that exercise the affected variants and states, by name |
| 10 | Non-goals | What this retrofit deliberately does not change, so scope creep is visible in review |

**Content adequacy is the human reviewer's gate at PR-1 — not the guard's and not CI's.** Neither
mechanical check reads the file. The guard tests neither existence nor content: it only blocks
writing an addendum and that component's source in one agent session (see "What the guard enforces
here, and what it deliberately does not" below). CI tests **existence at `BASE_SHA`** — and only
existence; it does verify the path is a regular file blob rather than a symlink or a directory
named `<name>.md`, but it never opens it. So an empty or stub addendum passes everything
mechanical, which is exactly what the PR-1 human review is for.

#### When a retrofit is NOT allowed — a full frozen spec is required instead

Any change to props, variants, interaction, keyboard behaviour, accessibility contract, structure,
or the component's visual semantics. "Visual semantics" means the change alters what the appearance
*communicates* — a resting border that starts signalling selection, a colour that moves from
neutral to danger — as opposed to re-expressing the same meaning through a token.

If a change of that kind is discovered mid-retrofit, stop and write the spec. Do not widen the
addendum to cover it.

#### Precedence — spec and addendum are alternatives, not a hierarchy

A component with a frozen spec does not need an addendum. A component with an addendum does not
need a spec. Neither supersedes nor upgrades into the other, and a component holding both is
allowed and not an error — the spec already satisfies every gate and the addendum is redundant,
not conflicting.

#### PR structure and the merge gate

Identical in shape to PR-1/PR-2 above, with the addendum in place of the spec:

| PR | Contents | Gate |
|---|---|---|
| Retrofit PR-1 | `docs/component-retrofits/<component>.md` only | `review-approved` check green, then **human merge** |
| Retrofit PR-2 | The component source change | Retrofit PR-1 must be merged |

Retrofit PR-1 is merged by a human under the **same** `review-approved` merge gate as a spec
PR-1, and the No-Self-Skip-Review rule applies unchanged: **no agent approves its own PR**, and no
agent manufactures the check green. The reviewer bot is run manually after a human's review.

Two mechanisms make the ordering binding rather than advisory, and they are different mechanisms:

- **CI** — the classifier (`tools/classify-pr-diff.sh`) treats **both** PR-1 document directories
  the same way: `^docs/(component-specs|component-retrofits)/`. So an addendum-only PR classifies
  `SPEC_ONLY`, and an addendum plus source in one PR classifies `MIXED` and is failed by
  `enforce-spec-pr-separation` — identically to a frozen spec. `require-document-on-base`
  short-circuits on `MIXED`, because Job 1 has already rejected the PR.
- **The guard** — writing an addendum and that component's source in one agent session is blocked,
  the in-session form of the same boundary.

**This was asymmetric until an earlier change, and the asymmetry was a real hole.** The classifier's spec
flag matched `^docs/component-specs/` only, so an addendum next to its component's source
classified `COMPONENT_SOURCE`: `enforce-spec-pr-separation` never fired, and
`require-document-on-base` *passed* whenever the addendum was already on base — that gate asks
only whether the document is **present** at `BASE_SHA`, never whether the PR leaves it alone. An
**already-merged** addendum could therefore be rewritten inside the implementation PR with no gate
objecting. A frozen spec could not, because a spec path made the PR `MIXED`.

Two consequences of the fix worth stating, because both are easy to read backwards:

- **The first-addendum case did not get weaker — it moved gates.** It used to fail at Job 3 (the
  document is absent from base). It now fails at Job 1 (the PR is `MIXED`). The `MIXED` rule is a
  strictly wider net: the base-SHA lookup could only ever see an addendum that was *missing*, so it
  was structurally incapable of catching the rewrite case.
- **An addendum-only PR moved from `NONE` to `SPEC_ONLY`.** Job 1 passes `SPEC_ONLY`; Job 2 counts
  `components`, which a document path never contributes to, so it passes with an empty count; Job 3
  short-circuits on any non-`COMPONENT_SOURCE` classification. All three are pinned by tests
  (tests you will have to write; this kit ships none of them) rather than
  asserted here.

#### What the guard enforces here, and what it deliberately does not

`ds-pipeline-guard.sh` treats `docs/component-retrofits/<c>.md` as a PR-1 document alongside
`docs/component-specs/<c>.md`. That is the whole of its retrofit awareness.

**The guard is not authoritative for whether a spec or an addendum exists, and it is not
authoritative for whether the component pre-exists.** It performs neither check. Do not read
"addendum present → the guard allows the write" as the complete rule: the guard allows that write
today whether or not any document exists, because it has never checked. Both conditions are
bound in CI instead, which has `BASE_SHA` and fails closed.

This split is deliberate, and the decisive reason is not merely that the hook is fail-open. The
hook has **no PR context at all** — no label, no PR body, no `BASE_SHA`. A guard that blocked
source writes for every component lacking a spec or addendum would make each spec-less component
unwritable at the keyboard, including for changes CI would happily accept. In the reference
implementation that was 20 of 42 components in `src/components/ui/`. CI has the context to
decide; the hook does not.

Unchanged by any of the above: a path under `src/components/` that is not a component — a shared
helper, a barrel file — is classified exactly as it is today. The addendum lookup adds no new
classification of non-component paths.

### Cross-cutting changes — no exemption ships in this kit

A change that must touch two or more existing components at once — a radius unification, a
cursor rule, a token rename sweeping every consumer — has **no exemption** here.
`enforce-one-component-per-pr` fails such a PR, and the only compliant route is one PR per
component.

**This is a deliberate omission, and it has a cost.** The reference implementation does carry a
labelled multi-component exemption, gated by six guards: a PR label, a real-component check, a
CI-supplied layout list, a minimum of two components, a base-existence check on every component,
and a rationale section in the PR body naming each one. Four such PRs merged there. That
machinery is roughly a third of the gate code and the single most common source of
"why did the gate say *not applicable*?" confusion, so this kit leaves it out.

What you give up, stated plainly:

| | With one PR per component | With a sweep exemption |
|---|---|---|
| A token rename touching 12 components | 12 PRs, 12 reviews, 12 merges | 1 PR |
| Atomicity | the 12 land separately; `main` is briefly inconsistent | all or nothing |
| Gate code to maintain | classifier + base check | classifier + base check + 6 guards + rationale parser |

If the atomicity matters more to you than the simplicity — a rename that leaves `main` broken
between merges is the clearest case — you need the exemption, and adding it back is a real piece
of work, not a config flag. Decide before your first sweep, not during it.

## HARD STOP — Human Spec-Merge Checkpoint

**This is a mandatory blocking gate, not a suggestion.**

The agent executing stage #5 (implementation) MUST NOT start implementation until:

1. The human control point has been satisfied: a human performs a **visual review of PR-1 before the reviewer bot is run**. The reviewer bot is started **manually** — there are no draft PRs and no automatic bot runs.
2. An approving review has been posted — by the automated bot the reviewer bot or by any human reviewer other than the PR's author — and the required `review-approved` status check has turned green. the reviewer bot is a read-only actor, so its APPROVED review alone cannot unblock Merge; the `review-approved` check (driven by a GitHub Actions workflow off `pull_request_review` events) is what converts that review into the signal that unblocks Merge, without granting the bot elevated rights. The gate keeps **no** reviewer allow-list — see "The approval override already exists" below.
3. PR-1 has been merged to main in the DS repository — a **human performs the merge** (agents never merge).
4. The agent has confirmed merge status via `gh pr view <pr-url> --json state` returning `MERGED`.

If the `review-approved` check is not yet green (or PR-1 is not yet merged):
- The orchestrator reports the PR-1 URL to the user and halts.
- The orchestrator does NOT auto-proceed after any timeout.
- The orchestrator does NOT skip the checkpoint even if the PR looks "obviously correct".
- Reset-on-push is strict: any new push returns `review-approved` to pending, and the reviewer bot must be re-run manually.

If PR-1 is closed without merging (rejected by a reviewer):
- The orchestrator surfaces the rejection to the user and halts.
- The orchestrator does NOT auto-reopen or rewrite the spec.
- The user decides whether to revise and re-open PR-1 or cancel the component.


## No-Self-Skip-Review

Agents MUST NOT approve their own PRs or manufacture the `review-approved` signal for them.

- An agent that opens PR-1 cannot be the reviewer whose approval drives the `review-approved` check — never the agent that authored the PR. That is the **only** identity constraint the gate implements; see "The approval override already exists" below for what it does and does not filter. The bot is run manually after a human's visual review, and a human performs the merge.
- An agent that opens PR-2 cannot run stage #8 (production-quality-gate) and self-certify PASS.
- Stage #8 PASS/FAIL is determined by the `production-quality-gate` skill (#8) operating as an independent agent invocation — not by the same context that wrote the code.
- On stage #8 FAIL: the orchestrator returns the failure details to the user and to the owning stage agent. The orchestrator does NOT merge, does NOT mark the task completed, and does NOT retry implementation autonomously.


## Review-Round Budget and What Counts as a Blocker

**Rounds 1–2: fix everything worth fixing. From round 3: a finding that is not a blocker becomes a
follow-up issue and is not fixed in this PR.**

### Why a budget, measured

Round N keeps producing the finding of round N+1. One documentation-only PR — **zero
blockers** — took 5 rounds, grew 190 → 229 insertions from its own review, and round 5 found a
contradiction in text that round 4 had added. Another PR took 9 rounds while the
generator's output stayed byte-identical throughout.

This is not an occasional tail. Counted over the DS repository `#121`–`#128`, the ten most recently
merged PRs as of 2026-08-08:

| Measure | Value |
|---|---|
| Median rounds | **6** |
| Mean | 6.4 |
| Maximum | **15** (`#126`, Textarea implementation) |
| PRs reaching round 3 or beyond | **7 of 10** |

**A round is one non-approving review** — `CHANGES_REQUESTED` or `COMMENTED`. The final `APPROVED`
is not a round; it is the end of them. Counting every review instead inflates each PR by exactly
one and is the likeliest source of a number that disagrees with this table. Re-measure with
`gh pr list --repo <owner>/<repo> --state merged --limit 10 --json number,additions,reviews`
and exclude `state == "APPROVED"`.

So the budget is the normal case, not an exception — and the cost is not proportional to the size
of the change. Per 1000 added lines:

| Group | PRs | Rounds | Added lines | Rounds per 1000 |
|---|---|---:|---:|---:|
| Spec | `#127` `#124` `#123` `#121` | 23 | 2,913 | **7.9** |
| Implementation | `#128` `#126` | 19 | 5,715 | **3.3** |

Those are group aggregates, not per-PR rates — individual PRs sit either side (`#124`: 13 rounds on
+1224 lines; `#126`: 15 on +3717). A spec draws roughly twice the review per line that an
implementation does, which is precisely where an unbounded loop does most damage: the artifact is
prose, so there is always another wording to prefer.

### Blocker

A finding is a blocker when it says the change is *wrong*, not that it could be *better*:

- contradicts approved requirements
- contradicts the component's public contract
- unhandled breaking change for existing consumers
- build, type or test failure
- runtime defect
- accessibility regression
- incorrect semantics
- violation of a mandatory governance rule

### Not a blocker

- wording improvement
- optional refactor
- additional documentation
- extra scenario outside the agreed scope
- hypothetical future-proofing

A blocker is fixed at **any** round number. The budget bounds the second list only.

### Three cases the first two lists could not classify

All three were found the first time the budget was applied in anger (see the evidence section
below). None fits either list, and getting them wrong breaks the rule in different directions.

The third — an **unresolved disagreement**, where the finding is sound but the two sides do not
converge and the PR closes on a recorded rationale — is described with its evidence below, because
its shape is only visible from the audit. Short form: it owes a recorded argument in the PR, and
**no follow-up issue**.

**A regression this PR introduced is always a blocker, whatever the round.** The lists are written
as though every finding describes pre-existing work. They do not cover the case where round N's own
fix creates the defect that round N+1 reports. `#140` round 5 is the worked example: the round-4 fix
ended a grammar disagreement by deriving one detector from the other, and thereby carried a
backtracking cost into a path that ran over every spec — measured 0 ms → 188 ms. By the letter of
the lists that is "optional refactor, performance only", deferrable at round 5.

It is not. **The budget defers inherited debt; it never defers damage the PR itself did.** Merging
your own fresh regression because the round counter is high is the one outcome that would make the
budget worse than no rule.

**A finding whose premise is false is a third outcome, not a lenient blocker.** The lists assume the
finding is true and ask only how much it matters. Some are simply wrong. `#140` round 10 reported
that a pipe inside a backtick code span is "a single cell to the Markdown renderer" and that
splitting on it truncates the cell — rendered through the forge's own API, a bare pipe splits the
cell **there too**, so the parser agreed with what a reader sees.

Answer these with a measurement, in the PR, and decline them. Do not fix them to close the round,
and do not file them as follow-ups — a follow-up issue for a false premise is a defect report that
sends the next person to reproduce something that does not happen. **Rejecting a finding is not the
same as deferring one**, and only deferral needs an issue.

Where the premise is false but the neighbourhood holds a real defect, take the real one and say
which is which: the same round-10 finding was declined, and the *escaped* `\|` form it pointed at —
where the renderer joins the cell and the parser split it — was fixed in the same commit.

### "Blocker" already means two other things — keep them apart

The word is overloaded in this repository, and conflating the three inverts the rule:

| Term | Owner | Meaning | Does the round budget apply? |
|---|---|---|---|
| **review blocker** (this section) | reviewer / author | a finding that must be fixed in this PR | it *is* the budget |
| `freeze_blockers` | `component-spec-writer` (#4) | a spec cannot advance to `freeze_candidate` | **no** — always blocking |
| `blocker → FAIL` | `production-quality-gate` (#8) | a gate failed | **no** — always blocking |

A red gate is a blocker by construction. "It is round 4, so the failing test becomes a follow-up" is
a misreading: a build, type or test failure is in the blocker list above precisely so that the
budget can never be read that way.

### The follow-up is created before merge — not after

Deferring a finding **requires** a linked follow-up issue on the PR before it merges. Not a comment
promising one, not a note in the task file: an issue, linked.

Without it "defer" quietly becomes "lose", and the rule is discredited within about three
components — at which point reviewers stop honouring it and every PR is unbounded again.

### The approval override already exists — it is not built here

`design-tokens/.github/workflows/review-gate.yml` implements it. Verbatim from the source:

> Any approving review unblocks merge (owner policy, 2026-07-08). An APPROVED review takes
> precedence over a CHANGES_REQUESTED from another reviewer: a single approval — from any reviewer —
> is sufficient, regardless of who else requested changes. This is what lets a human approval
> override the advisory reviewer bot's CR.

So "defer the non-blockers to follow-ups, then a human approves" produces a green
`review-approved` **today**. Nothing new is required. It was simply written down nowhere, which
is why the bot's `CHANGES_REQUESTED` reads as a merge block when it is advisory.

Measured confirmation that this is the working practice, not a theoretical path: **all ten** of the
recently-merged PRs counted above carry at least one `APPROVED` alongside the bot's CRs.

**There is no reviewer allow-list in the gate.** The only identity filter in the code is that the
PR author's own review never counts. Any other reviewer's approval greens the check — the trust
anchor is that the repository is private, so submitting a review already requires repo access.
`author_association` is deliberately not used: inside CI the `GITHUB_TOKEN` cannot see a private org
member's membership, so it misreports `MEMBER` as `NONE` and would strand a legitimately-approved
PR — observed on PR #114, after which the filter was reverted.

**In the system this came from, the rule claimed otherwise in four places for a month, and every
one of them was stale.** An allow-list of three logins — the reviewer bot plus two humans — had been
replaced by the any-approve policy a month earlier, and the replacement was recorded only in the
design note that made it ("any reviewer with repo access counts; no login list, no
`author_association` filter"). The note was updated; the rule's four copies were not. Consequence of
believing them: an agent expects a fourth reviewer's approval not to green the check, and waits for
someone who is not required. **If you write an allow-list into your own copy of this rule, write it
in one place** — the logins that appear in a repository's review history are who reviews in
practice, not who the gate requires.

Keep the **mechanism** in this paragraph — why the bridge exists, why `author_association` is not
used, what the trust anchor is, what happened on PR #114. Elsewhere, point here rather than
restating it; four copies of the mechanism is what diverged for a month.

**The operational consequence is not the mechanism, and it may be repeated.** A file that tells an
agent what to *do* — `CLAUDE.md`, `ds-pipeline-orchestrator.md` — may say "any non-author
reviewer's approval greens the check, do not wait for a specific person", and should, because
the trade-off is already settled elsewhere in this kit: indirection is rejected on the grounds that
an agent loading one document cannot afford a second lookup. An
orchestrator that reaches the HARD STOP holding only a pointer either spends a lookup or waits for
someone who is not required — which is the exact failure the four stale copies caused.

The line is therefore: **one sentence of consequence, plus a pointer, is correct; a second copy of
the reasoning is not.** If the policy changes, the sentence changes with it in three known places,
and the rule is the one that explains why.

### Reset on push is strict, by design

A review counts only against the **current head SHA** — the gate skips any review whose
`commit_id` differs. Stale approvals are not auto-dismissed by GitHub
(`dismiss_stale_reviews_on_push=false`), so this SHA check is the only thing preventing an old
approval from greening a new commit.

Consequence for the budget: pushing the round-3 deferrals returns the check to pending, and the
approval has to be re-cast against the new head. Land the deferrals **first**, then ask for the
approval — the reverse order costs a round.

### The rule has now been used — verdict: adopt, with the additions above

This rule shipped with an acceptance criterion it could not satisfy itself: *"the rule is unproven
until it has survived one real use."* This is that record, measured twelve days after the budget
landed, over every PR merged in that window — 53 PRs, counted the way this section defines a round
(non-approving reviews only).

The measurement's timestamp is not decoration: one PR merged **between two runs of the same count**,
moving it 52 → 53. Re-measure in your own repository before citing these numbers; do not average a
disagreement with them.

**The first PR to reach round 3 under the rule was `#135`** (9 rounds). Nothing between the rule and
it went past round 2.

| | Before (the 10 PRs above) | After (53 PRs) |
|---|---:|---:|
| Median rounds | 6 | **2** |
| Mean | 6.4 | **3.8** |
| Maximum | 15 | **23** (`#136`) |
| Reached round 3+ | 7 of 10 | 25 of 53 |
| Within the ceiling of 8 | — | 45 of 53 |

**Adopt.** The median fell from 6 to 2 and 85% of PRs now finish inside the ceiling. Three things
qualify that, and all three are the point of recording it rather than declaring victory:

**The tail got worse, not better.** Eight PRs went past 8 rounds and the maximum rose 15 → 23. The
budget bounds what is *fixed*, not what is *found* — a reviewer that keeps finding real fail-opens
produces real rounds, and three PRs each did. The ceiling is a signal to escalate to a human, not a
limit the loop can enforce on itself.

**The spec-versus-implementation gap closed, and that falsifies the original reasoning.** The "why"
above argues a spec draws roughly twice the review per line because prose always has another wording
to prefer. Measured now: spec PRs median 3.0, implementation PRs median 2 — no meaningful gap. The
likelier cause of the old 7.9-vs-3.3 split was the absence of a two-layer document format, not prose
itself.

**Neither failure mode this rule feared appeared — audited per PR, not asserted.** Deferrals did not
accumulate unfiled, and the exact count is **7 of 7**: every PR that deferred anything filed the
follow-up inside its own review window.

The audit covers the 11 round-3+ PRs from `#138` on — the slice where the document format, the
budget and the automated reviewer were all in force together. A follow-up counts only if the issue
was created between the PR opening and its merge; an issue merely *cited* does not count.

| PR | Rounds | Deferred during review | Outcome |
|---|---:|---|---|
| `#138` | 5 | 3 issues | deferred, filed |
| `#139` | 12 | — | **nothing deferred** — final review 0 blockers / 0 must-fix / 0 unresolved |
| `#140` | 10 | 3 issues | deferred, filed |
| `#141` | 10 | 1 issue | deferred, filed |
| `#142` | 3 | — | **nothing deferred** — 0/0/0 |
| `#143` | 4 | — | nothing deferred; **2 unresolved disagreements**, settled by argument |
| `#144` | 5 | — | nothing deferred; **3 unresolved disagreements**, settled by argument |
| `#145` | 3 | 1 issue | deferred, filed |
| `#146` | 14 | 2 issues | deferred, filed |
| `#147` | 3 | 2 issues | deferred, filed |
| `#148` | 3 | 2 issues | deferred, filed |

Nor did everything become a blocker from round 3: the four PRs with no follow-up deferred nothing,
rather than deferring silently.

**"Unresolved disagreement" is a fourth outcome the lists do not name, and it needs no issue.**
`#143` and `#144` closed with disagreements recorded and settled by argument — the author explained,
the reviewer accepted the explanation and classified it out-of-scope. That is neither a fix, nor a
deferral, nor a false premise. It owes a recorded rationale in the PR, not a follow-up: filing an
issue for a settled disagreement re-opens it in a place nobody will re-read the argument.

**Two of these round counts are not clean measurements, and saying so is part of the evidence.**
`#139` was merged by the author mid-run, so one of five reviewer passes never executed; `#142` lost
two passes to model capacity. Their rounds are real but their finding counts are floors, not totals.
The same caveat applies to any recount you run: a round is what the reviewer *completed*, not what
it attempted.

For the 14 earlier round-3+ PRs the same audit was not run — the follow-up trail there predates the
issue-linking habit, so absence of a filed issue in the window would not distinguish "nothing
deferred" from "deferred and unrecorded". Reproduce either slice with:

```bash
gh api "repos/<owner>/<repo>/pulls/<n>/reviews?per_page=100" \
  --jq '[.[]|select(.state!="APPROVED")]|length'
```

**One number here was wrong once and is now corrected.** An earlier record of the same ten PRs said
median 5.5 / mean 6.6; the table above is the recount. If a third number appears, re-measure rather
than average them.

### Scope

This section governs review of PRs in the repository where the review gate is installed. In a
repository without a `review-approved` check the override paragraph does not apply — the budget
and the blocker classification still do, as review discipline.


## ESLint and Token-Guardian — Complementary, Not Duplicates

These two mechanisms serve different purposes and both are required:

| Mechanism | Scope | When | What it checks | Blocking? |
|---|---|---|---|---|
| ESLint rules (features 289/290) | `src/components/**` | CI on every PR | **Mechanical** — raw hex literals, arbitrary px typography values, forbidden import patterns | Yes — CI fails, PR blocked |
| `token-guardian` (#3 and #8) | All files in the agent session | In-session at stages #3 and #8 | **Semantic** — token architecture chain violations, contextual design value usage, governance rule conformance | Yes — stage fails, gate blocks merge |

ESLint is a mechanical floor: it catches obvious forbidden patterns automatically in CI without requiring an agent session. Token-guardian is a semantic ceiling: it evaluates the component's token usage against the governance rule set in context. A component can pass ESLint and still fail token-guardian (e.g. using a semantically incorrect token to avoid an arbitrary value). Both must pass before merge.


## Enforcement Layers

The **Kit level** column is the one to read first: it tells you whether a given mechanism is
present in your installation at all. A level you did not install enforces nothing, however
firmly this rule is worded.

| Mechanism | Kit level | Scope | When it fires | Blocking? |
|---|---|---|---|---|
| This rule, read by an agent | **L1** | The agent's own session | While the agent works | **No.** The process is described; nothing checks it. |
| Orchestrator with no Write/Edit tools | **L1** | Orchestrator sessions only | At delegation time | Partial — the orchestrator cannot itself author spec and source, but a directly-invoked agent is unaffected. |
| PreToolUse hook (`ds-pipeline-guard.sh`) | **L2** | Write/Edit calls touching component source or a PR-1 document | At agent Write/Edit time — before the file is written | Yes — but only for the two conditions it detects (see note below), and only inside a harness that runs the hook. |
| Hook self-test | **L2** | The hook itself | On demand / in CI | Yes — verifies the hook still detects what it claims to. |
| CI: spec-PR separation | **L3** | Every PR | On PR open/update | Yes — fails if a PR-1 document and component source appear in one PR. |
| CI: one component per PR | **L3** | Every PR | On PR open/update | Yes — fails if more than one component directory is modified. No exemption ships in this kit. |
| CI: document on base | **L3** | PRs containing component source | On PR open/update | Yes — fails if no spec or retrofit addendum for that component exists at the base commit. |
| Review gate (`review-approved`) | **L3** | Every PR | On `pull_request` / `pull_request_review` | Yes — required status check; green when any non-author reviewer's latest review **against the current head SHA** is APPROVED. |
| Branch protection | **L3** | The `main` branch | At merge time | Yes — blocks merge unless the required checks pass. Needs repository-admin rights. |
| Linter rules (raw hex, arbitrary typography) | **L3, example only** | Component source | On every PR via the lint script | Yes where installed — but these ship as **examples for one stack**, not as a supported part of the kit. |

**Why the review gate is a status check rather than a review count.** Where the automated
reviewer is a read-only actor, its APPROVED review does not count toward
`required_approving_review_count`. Setting that count to `0` and requiring a status check
instead converts the review into a merge signal without granting the bot write access. A human
still performs the merge. Rollout order is fixed: the workflow merges first, then an
administrator applies the branch-protection change — the reverse order requires a check that
does not exist yet and blocks every PR.

**What the PreToolUse hook actually enforces.** `ds-pipeline-guard.sh` has no knowledge of PR state
and never queries the forge. It blocks exactly two conditions, and allows everything else (it is
fail-open by design — CI is the primary gate):

1. A write to component source while on a branch whose name marks it as spec-only
   (`spec/`, `decomp/`, `research/` by default — configurable in the hook's own header).
2. Writing a **PR-1 document** — a spec (`docs/component-specs/<c>.md`) **or** a retrofit migration
   addendum (`docs/component-retrofits/<c>.md`) — and the source for the **same component within
   one agent session**, in either order. This is the in-session form of the PR-1/PR-2 boundary, and
   it covers the addendum because a spec and an addendum are alternatives, not a hierarchy: both
   sit on the PR-1 side of that boundary. Writing a spec and an addendum for the same component is
   therefore *not* a violation — only either of them paired with that component's source is.

It does **not** check whether a spec exists, and does **not** block modification of an
existing component that has no spec. Treat "the hook will stop me" as true only for those two
conditions; everything else is enforced by CI and branch protection.


## Failure Modes

| Situation | Required behaviour |
|---|---|
| Agent attempts to open PR-2 (implementation PR) without PR-1 merged | STOP. Do not write any implementation file. Report to user: "PR-1 `<url>` must be merged before implementation starts." |
| Agent mixes spec + impl files in a single PR | STOP. This is a PR boundary violation. The PR must be split: spec files go to a new PR-1 branch; implementation files stay for after PR-1 merges. |
| Agent attempts to approve its own PR or force `review-approved` green | FORBIDDEN. The approving review must come from someone other than the PR's author — the gate drops the author's own review and keeps no allow-list beyond that. The agent posts the PR URL to the user and waits for the review; a human performs the merge. |
| Ambiguous file classification (e.g. PR adds both `docs/component-specs/foo.md` AND `src/components/ui/foo.tsx`) | This is a PR-1 boundary violation regardless of intent. Split the PR. |
| PR-1 is merged but the agent's context doesn't reflect it yet | Agent MUST verify via `gh pr view --json state` before proceeding to stage #5. Do not rely on in-memory assumptions. |
| Stage #8 (production-quality-gate) returns FAIL | Orchestrator reports failure details to user and returns control to the owning agent for the failing stage. Never self-proceeds past a FAIL. |
| PR-1 closed without merging | Orchestrator halts. User decides to revise or cancel. Agent does not auto-retry. |
| A reviewer requested changes on PR-1, and `review-approved` has **not** since gone green | Orchestrator halts, as above. A new push returns the check to pending; the automated reviewer must be re-run. |
| A reviewer requested changes, then an approval turned `review-approved` green | **Not a halt** — the CR was overridden. Keep waiting for the human merge. This is the path the round budget produces (non-blockers deferred to follow-ups, then an approval); halting here would strip the budget of effect exactly where it applies. |
| Component predates this rule | The PR-1/PR-2 structure applies to all **new** components from the date the rule is installed. It does not retroactively demand a spec — but `require-document-on-base` still does for any PR touching that component's source, so which path applies depends on whether a spec or addendum exists on base. See "Changing an EXISTING Component" above. |
| A change must touch exactly ONE existing component that has no spec | Write a retrofit migration addendum, merge it as PR-1, then open the impl PR — `require-document-on-base` accepts it. See "Existing Component Retrofit" above for the entry conditions and required content. Do not invent a bypass: the addendum is a document requirement, not an exemption. |
| A change must touch 2+ existing components at once | One PR per component. This kit ships no multi-component exemption — see "Cross-cutting changes" above for what that costs and when to build one. |
| Agent claims implementation is blocked because a component lacks a spec | The claim is correct, and the routing is the retrofit addendum — see "Single spec-less component" above. Blocked is not the same as impossible. |


## Cross-References

Paths below are where each artifact lands after installation; adjust for your harness.

- Orchestrator agent: `agents/ds-pipeline-orchestrator.md`
- DS context: `skills/ds-context/SKILL.md` (#1)
- DS governance: `skills/ds-governance/SKILL.md` (#2)
- Token-guardian: `skills/token-guardian/SKILL.md` (#3)
- Production quality gate: `skills/production-quality-gate/SKILL.md` (#8)
- PreToolUse hook: `scripts/ds-pipeline-guard.sh` (Level 2)
- Review gate workflow: `.github/workflows/review-gate.yml` (Level 3)
- Structural gates: `.github/workflows/pr-gates.yml` (Level 3)
- Configuration surface: `ds-kit.config.yml`


## Out of Scope

- Token architecture and governance rules — see `ds-governance` (#2).
- A multi-component ("sweep") exemption — deliberately omitted; see "Cross-cutting changes".
- Publishing or releasing the design system to consumers — a release step, not a pipeline stage.
- Auditing how product screens *consume* the design system — a separate concern with its own
  inputs and outputs; not part of this kit.
- Figma synchronisation in either direction.
