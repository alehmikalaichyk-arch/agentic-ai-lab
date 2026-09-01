# Level 3 — The process, the guard, and gates that actually block

**Includes all of [Level 2](level-2.md).** **Install cost:** copying a directory into the target
repository, plus one administrator action. **Permissions needed:** ability to add CI workflows,
and — for the last step — repository administrator rights.

---

## What Level 3 enforces

**The boundary itself, on the branch, for everyone.** This is the level at which the process
stops depending on anyone's cooperation.

| Gate | Blocks |
|---|---|
| `enforce-spec-pr-separation` | A pull request carrying both a decision document and component source. |
| `enforce-one-component-per-pr` | A pull request touching more than one component. |
| `require-document-on-base` | A pull request carrying component source when no spec or retrofit addendum for that component is **already merged**. |
| `review-approved` | Merging without an approving review from someone other than the author. |

`require-document-on-base` is the one that carries the human checkpoint. It reads the **base
branch**, so a document added in the same pull request does not satisfy it. That single property
is what forces PR-1 to be separate, reviewed, and merged by a person before any implementation
can land.

### Compound components need one optional file

If a component's source is split across several files but the pipeline freezes **one** spec for
the whole of it, the classifier reports the secondary file's own name and the gate looks for a
document that was never meant to exist. Add `compound-spec-alias.json` at the repository root:

```json
{ "page-shell-header": "page-shell" }
```

Three properties are not negotiable, and the shipped script has all three:

- **An explicit table, never a suffix rule.** Stripping a trailing `-base` or `-picker` would
  collapse `input-base` and `date-time-picker` — real components with specs of their own — into
  names that are not theirs.
- **Read at the base commit, never from the checkout.** Otherwise a pull request adding both a
  new component and its own alias entry grants itself another component's spec. That is a
  complete bypass of PR-1, and `check-document-on-base.test.sh` has the regression case for it.
- **Spec probes only.** A retrofit addendum always names the exact component it retrofits, so the
  addendum probe and the pre-existence check are never aliased.

No file, no aliasing — the gate behaves exactly as it did before the table existed. A malformed
one fails the gate closed rather than emptying silently, because an empty table reports a
spurious missing spec for every compound component.

## What Level 3 still does not enforce

Worth stating, because "we have CI gates" is where teams stop reading.

- **Nothing, until branch protection is applied.** Until then the gates report a red X and the
  Merge button still works. A failing check that does not block is a notification.
- **Nothing against a repository administrator, until you turn that on.** The runbook has
  `enforce_admins` off deliberately — turning it on before the gates have proven themselves is
  the second-most-common way to freeze a repository. The consequence, though, is that an admin's
  `git push` to the protected branch **succeeds silently**: GitHub prints the required-checks
  notice and pushes anyway. On a one-person repository that means the process is voluntary for
  the one person, which is worth knowing before demonstrating it to anyone. Turn it on once the
  gates have blocked a real pull request — and note that with `review-approved` required and no
  second reviewer, nothing can then be merged at all until one exists.
- **Quality.** These gates decide the *shape* of a pull request — how many components, which
  file classes together, what exists on base. They never run your build, your tests, or your
  linter. Wire those separately; the quality gate skill (#8) describes what to aggregate.
- **That the spec is any good.** A one-line spec satisfies `require-document-on-base` exactly as
  well as a thorough one. The document gate checks presence; the human review checks content.
  This is deliberate — a machine cannot judge the second — but it means the checkpoint is only
  as strong as the person at it.

## What ships

```
repo-enforcement/
├── .github/workflows/
│   ├── pr-gates.yml        three structural gates
│   └── review-gate.yml     bridges an approving review into a required status check
├── tools/
│   ├── classify-pr-diff.sh             describes a diff; never blocks
│   ├── check-document-on-base.sh       the base-branch document check
│   └── check-document-on-base.test.sh  8 cases, builds its own fixture repository
├── eslint-rules/           EXAMPLES for one stack — see its README
├── scripts/
│   └── apply-branch-protection.sh
└── docs/
    └── branch-protection-runbook.md   including the path with no admin rights
```

Two tools, deliberately. The system this came from has several more — a multi-component
exemption with six guards, an exit-code router, a coverage gate. They are left out because each
one is a place for the gate to say "not applicable" for a reason nobody can reconstruct.

## Install

1. Copy `repo-enforcement/` contents into the target repository: workflows to
   `.github/workflows/`, `tools/` and `scripts/` to their matching directories.
2. Copy `ds-kit.config.yml` to the repository root and edit it. The job names in `pr-gates.yml`
   **must** match `status_checks` in that file exactly.
3. Merge those files to `main`.
4. Open one pull request and let all four checks report at least once.
5. Only then apply branch protection — see the runbook. Reversing steps 3 and 5 freezes the
   repository until an administrator undoes it.

## Read this before enabling `review-gate.yml` on a public repository

The gate implements "any non-author approving review greens the check, with no allow-list". That
is safe **because the repository is private**: the ability to submit a review is already
restricted to accounts with repository access.

**On a public repository it is not safe** — anyone can submit a review. Add an identity or
permission check before using this workflow publicly. The caveat is repeated in a comment at the
top of the workflow, where someone changing it will see it.

## Verify the gates bite

Do not skip this. Configuration that looks correct and enforces nothing is the specific failure
this level exists to prevent, and it is silent. The runbook has three probes; run them once, on
purpose, and watch two of them go red.
