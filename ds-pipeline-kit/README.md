# DS Pipeline Kit

A portable pipeline for building design-system components the same way every time, whether a
person or an agent does the work: **numbered requirements → a spec a human merges before any code
exists → implementation → stories → an accessibility pass → an independent quality gate.**

The transferable asset is not the code. It is the set of decisions already made — which questions
belong in the spec rather than surfacing after implementation, why the quality gate must run in a
different session from the one that wrote the code, why a reviewer's fourth round of wording
preferences becomes a follow-up issue instead of an in-PR fix. Those are expensive to derive and
cheap to copy.

---

## The shape of it

```
  #0 requirements brief          the owner's ask, normalised + audited against the repository
        │
  #1 context  #2 governance  #3 token scan        what exists · what the rules are · what already violates them
        │
  #4 spec  →  #4.5 visual draft                   the owner SEES it before the spec is frozen
        │
     ┌──────────── PR-1: the decision document, alone ────────────┐
     │  ▓▓▓ a human reviews and merges. no code exists yet. ▓▓▓   │
     └────────────────────────────────────────────────────────────┘
        │
  #5 implementation + tests   #6 stories   #7 accessibility
        │
  #8 quality gate                                  in a DIFFERENT session than #5
        │
     ┌──────────── PR-2: implementation ──────────────────────────┐
     │  a human merges. the component exists.                     │
     └────────────────────────────────────────────────────────────┘
```

Two pull requests. One mandatory human checkpoint between the decision and the code. One gate
that cannot mark its own homework.

---

## Three levels. Each works on its own.

Pick one, install it, and know exactly what you have. **Every level's page states what it
enforces and what it does not**, because the gap between those two is where processes quietly
fail.

| | What you get | What it enforces | Cost |
|---|---|---|---|
| **[Level 1](docs/level-1.md)** | Nine skills, the orchestrator, the process rule, templates | **Nothing.** The process is described; nothing checks it. | One command. No permissions. |
| **[Level 2](docs/level-2.md)** | L1 + a write-time guard and its 54-test suite | Two conditions, at one keyboard, fail-open | One command + a settings entry |
| **[Level 3](docs/level-3.md)** | L2 + CI gates, two tools, branch protection | The boundary, on the branch, for everyone | Copy a directory + one admin action |

If you install Level 1 and tell your team "the pipeline is in place", you have told them
something untrue. That is not a criticism of Level 1 — it is genuinely useful — it is the reason
each page says so plainly.

---

## Install

New here? **[QUICKSTART.md](QUICKSTART.md)** gets Level 1 running in ten minutes, and starts with
the five-row check of whether your repository fits at all.

**Levels 1 and 2** — a plugin:

```bash
claude plugin marketplace add <this-repository-url>
claude plugin install ds-component-pipeline
```

**Level 3** — copy `repo-enforcement/` into the target repository. It cannot ship as a plugin:
CI workflows and branch rules live in the repository, not in an agent's configuration.

Then copy `ds-kit.config.yml` to the repository root and edit it. Full detail in
[INSTALL.md](INSTALL.md).

---

## Everything you change is in one file

`ds-kit.config.yml`. That is the whole configuration surface — if you find a project-specific
value anywhere else in the kit, that is a bug in the kit.

| Key group | What it binds |
|---|---|
| `ds_package_root`, `main_branch` | Where the design system lives; which branch pull requests target |
| `paths.*` | Component source, decision documents, visual drafts, tokens |
| `tokens_namespace.*` | Your CSS custom-property prefix and package specifier |
| `npm_scripts.*` | Script names the quality gate runs by name (`null` = this project has no such stage) |
| `status_checks.*` | Required check names — must match the CI job names exactly |
| `agents.*` | Which agent runs the stages, and which runs the gate |
| `review.*` | Round budget; whether one approval overrides another reviewer's changes-requested |
| `a11y.*` | WCAG level, and whether contrast is measured against already-shipped components |

The write-time guard, the diff classifier, the base-branch check, the branch-protection script
and the rule generator all read it. None of them hardcodes a path.

---

## Verify before you rely on it

```bash
./verify.sh
```

Checks de-identification, scope, cross-reference integrity between skills, packaging, and that
each level's page states its enforcement honestly. Exit 0 means releasable.

The cross-reference check is the one worth understanding: **renaming a skill breaks the preflight
chain silently.** The downstream skill still runs — it simply never finds the upstream output it
was told to read first, and produces confident work from an empty context. Nothing else detects
this.

---

## What is deliberately not here

| Not included | Why |
|---|---|
| A multi-component ("sweep") exemption | Six guards, a rationale parser, and the most common source of "why did the gate say *not applicable*?". One pull request per component instead — the cost is in the pipeline rule. |
| A third pull request for publishing | This kit assumes one repository. If your design system ships as a versioned package, releasing it is a release step, not a pipeline stage. |
| Screen- and application-level auditing | A separate concern with its own inputs and outputs. |
| Design-tool synchronisation | Not shipped, and — this matters — **not enforced by anything here.** Where the governance skill states rules about it, they are convention checked by humans, and it says so. |
| A coverage gate | Yours will differ. Wire it into your own CI. |

---

## Provenance

Extracted from a working design system that took more than thirty components through this
pipeline. The measurements throughout — six review rounds median before the round budget and two
after it, twelve spec revisions against ten initial specs, five findings that dissolved when a
spec revision merged — are real, and they are the evidence the rules rest on. Organisation,
repository, person, ticket and pull-request identifiers have been removed; the numbers have not,
because a rule without its measurement is just an assertion.

The round budget is the one rule here that has also been measured **after** adoption, over 53
subsequent pull requests: median 6 → 2, 85% inside the ceiling, and a tail that got *worse*
(maximum 15 → 23). Both halves are in [examples/reference/measurements.md](examples/reference/measurements.md).

Where a section explains why something is the way it is, that reasoning is load-bearing. It is
what lets you decide correctly in a case the rule does not literally cover.
