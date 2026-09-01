# Reference implementation — what was measured

Every rule in this kit came from something that went wrong and was counted. This page collects
the counts in one place, because a rule separated from its measurement degrades into an
assertion, and an assertion is the first thing a team drops under pressure.

The identity of the organisation, repository, people, tickets and pull requests has been removed.
The numbers have not. **Confidential is *who*; not confidential is *what was measured*.**

Pull-request numbers appear as `#101`–`#148`, renumbered from the originals **preserving their
relative order**, because "A was superseded by B" only reads correctly if A still precedes B.
They start at 101 so no pull-request number can be mistaken for a skill number (`#0`–`#15`).

Scale of the source: **more than 30 components** through this pipeline, **34 specs**, roughly
**60 components** in the library at the time of extraction.

---

## 1. Review rounds — why there is a round budget

Counted over the ten most recently merged pull requests at the time.

| Measure | Value |
|---|---|
| Median rounds | **6** |
| Mean | 6.4 |
| Maximum | **15** |
| Pull requests reaching round 3 or beyond | **7 of 10** |

A "round" is one non-approving review. The final approval is not a round; it is the end of them.

**Cost is not proportional to change size.** Per 1000 added lines:

| Group | Pull requests | Rounds | Added lines | Rounds per 1000 |
|---|---:|---:|---:|---:|
| Spec | 4 | 23 | 2,913 | **7.9** |
| Implementation | 2 | 19 | 5,715 | **3.3** |

A spec draws roughly twice the review per line that an implementation does — which is exactly
where an unbounded loop does most damage, because the artifact is prose and there is always
another wording to prefer.

**The two cases that made the rule:**

- A documentation-only pull request with **zero blockers** took **5 rounds**, grew 190 → 229
  insertions **from its own review**, and round 5 found a contradiction in text that round 4 had
  added.
- Another took **9 rounds** while the thing it changed stayed byte-identical throughout.

→ Rule: rounds 1–2 fix everything worth fixing. From round 3, a finding that is not a blocker
becomes a linked follow-up issue, created **before** merge. Without the link, "defer" becomes
"lose", and the rule is discredited within about three components.

### 1a. The rule was then measured in use — this is the only number here taken *after* a rule

Every other measurement on this page is the evidence that produced a rule. This one is the
evidence that the rule worked, counted over the 53 pull requests merged in the twelve days after
the budget landed.

| | Before (the 10 above) | After (53) |
|---|---:|---:|
| Median rounds | 6 | **2** |
| Mean | 6.4 | **3.8** |
| Maximum | 15 | **23** |
| Reaching round 3+ | 7 of 10 | 25 of 53 |
| Within the ceiling of 8 | — | 45 of 53 |

**Adopt — with three qualifications, which are the point of recording it rather than declaring
victory.**

- **The tail got worse.** Eight pull requests went past 8 rounds and the maximum rose 15 → 23. The
  budget bounds what is *fixed*, not what is *found*. The ceiling is a signal to escalate to a
  human, not something the loop enforces on itself.
- **The spec-vs-implementation gap closed, falsifying the reasoning above.** Spec median 3.0,
  implementation median 2 — no meaningful gap. The likelier cause of the old 7.9-vs-3.3 split was
  the absence of a two-layer document format, not prose itself.
- **Deferrals did not accumulate unfiled: 7 of 7.** Every pull request that deferred anything
  filed the follow-up inside its own review window, audited per pull request over the 11
  round-3+ cases in the window where the format, the budget and the automated reviewer were all
  in force.

Two round counts in that window are floors rather than totals — one pull request was merged
mid-run, one lost reviewer passes to model capacity. A round is what the reviewer *completed*.

**Three finding shapes the blocker/non-blocker split could not classify** turned up the first time
the budget was applied in anger, and all three are now in the rule: a regression the pull request
itself introduced (always a blocker, whatever the round); a finding whose premise is false
(decline it with a measurement — do **not** file a follow-up for it); and an unresolved
disagreement settled by argument (owes a recorded rationale, no issue).

---

## 2. Spec revisions — why the owner sees a picture before the freeze

| Measure | Value |
|---|---|
| Initial specs | 10 |
| Revisions to those specs | **12** |
| Revisions explicitly driven by the owner's visual judgement | 4 |

More revisions than specs. The four visual ones were: a divider's default variant (too faint), a
checkbox-card's resting border (needed to be visible), an accordion header's height and type
size, and bringing a context-switcher's spec into line with what was actually built.

**This is not carelessness.** Those decisions cannot be made from prose. The old order was:
write the spec → approve it → build → the owner sees it for the first time. Part of the approved
document could not have been right, because the decision had not been made yet.

→ Rule: stage #4.5. A throwaway rendering the owner reviews **before** the spec is frozen.
Feedback goes into the spec while it is still editable.

→ And: the draft only pays for itself if CI publishes the preview. Where the build ran but was
not published, every review became "run it locally so I can look" — and the checkpoint got
skipped for being expensive. Introduce the draft and the published preview together.

---

## 3. Reviewing a spec revision in parallel with its implementation

A spec revision and an implementation pull request were open at the same time. Round 1 of the
implementation produced **five violation findings — all five dissolved** when the revision
merged. They were violations against the pre-revision contract that happened to be on the main
branch at review time, not against the contract either pull request was building toward.

→ Rule: merge the spec revision first, then request review on the implementation. In an
automated review pipeline this matters more than the wasted time: a false blocker has no obvious
resolution path.

---

## 4. `lifecycle: frozen` written by its own author

A spec arrived carrying `lifecycle: frozen` **before any gate had run**.

Then the measurement that settled the design: of 29 specs on the main branch, **11 carried no
`lifecycle` field at all** and shipped anyway; 16 said `frozen` because their author wrote it;
one still said `draft` after its own PR-1 had merged.

The field was never the gate. It recorded only what the author believed.

→ Rule: `frozen` is not an authored value. A spec is frozen by being merged. The authoring skill
tops out at `freeze_candidate`, and only when every gate passes.

---

## 5. The human checkpoint catching real defects

On the pilot component, the human review of the spec — **before any code was written** — caught
**four serious problems**. One of them would have shipped a divider whose line did not render at
all.

→ Rule: the HARD STOP is not bureaucracy. It is the cheapest point at which those four were
findable.

---

## 6. Contrast measured in a vacuum

A new component was measured at **12 of 15 colour pairs** below the accessibility threshold.
Then the already-shipped components were measured: **8 of 13 pairs** below it, including the
primary button.

The debt belonged to the palette, not to the newest component — but it was about to be charged
to whoever happened to be building at the time.

→ Rule: contrast findings are measured **relative to already-shipped components**. A
palette-wide debt is escalated to whoever owns the palette, not attached to the next component
through the door.

---

## 7. A spec-less library is the normal case, not the exception

**20 of 42** components in the canonical directory had neither a spec nor a naming variant of
one. A gate that demanded a full spec before any change to any of them would have made nearly
half the library unmodifiable.

→ Rule: the retrofit migration addendum. A narrower document for a mechanical change to an
existing spec-less component — bounded to visual-system migration, and accepted by the gate only
when the component demonstrably pre-exists.

**And why it is a declaration rather than something CI infers:** the cheaper alternative was
measured — decide "no public API change" mechanically from the emitted type declarations. On one
component a `defaultVariants` flip (a contract change by that project's own record) and a
utility-class-only change produced **byte-identical** declaration output. The two cases the check
must separate were indistinguishable to it.

---

## 8. A guard that indexed but did not render

Visual drafts were first placed inside a dot-directory. The story tool **indexed** them — they
appeared in the generated index and CI's cross-check passed — but the built preview could not
load the module, so every draft rendered an error instead of a picture. The build exits 0 either
way.

The only way to notice was to open the story, which is the one thing the artifact exists for.

→ Rule: drafts live in a plain top-level directory, and a regression test fails any configuration
that reintroduces a dot-directory segment.

→ And a general one: **a check that passes for the wrong reason is worse than no check.** This
kit hit the same class of bug while being built — a release check for stray Cyrillic characters
reported 939 hits against a corpus containing none, because a character range in a shell bracket
expression is resolved by locale collation rather than by code point, and an em dash sorts inside
it. That scan now runs in Python, where ranges are by code point.

---

## 9. Type errors invisible to every gate

A blatant type error in a visual draft passed the type check, the linter **and** the story build
— the story tool transpiles without type checking, and the other two were scoped to source only.
The draft is the evidence the human freeze gate looks at, so it had no quality floor at the exact
moment it mattered most.

→ Rule: drafts are type-checked. What that still cannot catch — a mistyped utility class, a
deliberately wrong token, wrong spacing — is precisely what the human is looking at the draft
*for*.

---

## What to take from this page

The pattern in all nine: **the failure was not a lack of discipline, and could not have been
fixed by asking people to be more careful.**

Each one was a structural property — a decision required before the information to make it
existed, a field that could be written by the person it was meant to check, a gate that could
not see what it claimed to check. The fix in each case removed the *cause*, not added a rule
about the *symptom*.

That is the design principle underneath the whole kit: **do not add rules, remove reasons.**
