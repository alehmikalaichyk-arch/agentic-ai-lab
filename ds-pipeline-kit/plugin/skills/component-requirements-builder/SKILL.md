---
name: component-requirements-builder
description: >
  Use this skill whenever a component ask arrives from an owner — prose, a Linear
  issue, a Figma frame, screenshots, or an externally-authored specification —
  and before any spec authoring begins. Use it also for any change that alters an
  existing component's promises: props, variants, defaults, behaviour, or
  accessibility. It is stage #0 of the design-system pipeline: it turns
  arbitrary input into a Component Requirements Brief — numbered, observable
  behaviour in plain language, never implementation — and runs a repository
  feasibility audit that returns binding facts and named conflicts to the owner.
  It owns business and behavioural requirements only; how those requirements land
  on primitives, tokens, composition and code is downstream. Soft preflight: it
  may consult #1 and #2 during the audit, but does not require them to start.
tools: Read, Glob, Grep, Write, Edit, Bash
---

# component-requirements-builder

The **intake layer** of the design system. It answers *what must be true
for the user*, before anyone decides *how the component is built*.

Nothing else in the pipeline does this. Today the owner's input goes straight
into `component-spec-writer` (#4), where requirements and implementation
decisions are written in one pass by one author. Two costs follow: a reader
cannot tell which lines are the ask and which are the solution, and a false
premise in the ask survives until review.

The value is measured, not assumed. The hand-authored audit of the TextArea
brief overturned **four premises** before spec authoring: the component was
believed new but ships today and is consumed in 6 places; one "open question"
was already settled by a frozen `input-base` contract; the size scale was
believed absent but is implemented; React 19 was assumed, 18.3.1 is actual. Each
of those would otherwise have been found by a reviewer, against a frozen spec.

---

## 1. Ownership model

```
component-requirements-builder (#0)  →  owns business + behavioural requirements
(this skill)                         →  owns requirement numbering (CR / OD)
                                     →  owns the feasibility audit and its findings
        ↓
ds-context (#1)                →  owns the inventory (what exists)
ds-governance (#2)             →  owns the rules (what is allowed)
token-guardian (#3)                  →  owns detection
        ↓
component-spec-writer (#4)           →  owns the spec (what this component IS)
                                     →  owns the component strategy decision
                                     →  owns the CR-to-spec traceability map
```

Requirements-builder **owns**: the brief document, requirement and open-decision
identifiers, the repository feasibility audit and its findings, and the brief's
lifecycle status.

Requirements-builder does **not** own: the spec (#4), the **component strategy
decision** (#4 — see §6), the rules (#2), the inventory facts (#1), component
source (#5), stories (#6), the a11y audit (#7), or the merge decision (#8). It
never decides *how* anything is built, and it never decides *what the product
should want* — that is the owner's.

---

## 2. When this stage applies

Run stage #0 when:

- a new component is proposed; or
- an existing component's **promises** change — props, variants, defaults,
  observable behaviour, or accessibility contract — whether or not a spec exists.
  The TextArea case was exactly this: an ask that read as greenfield and was in
  fact an evolution of a component consumed in 6 places.

Do **not** run stage #0 for:

- appearance changes that stay inside promises already made;
- token-only sweeps and cross-cutting sweeps;
- bug fixes that restore documented behaviour.

For those, the existing gates carry the quality; a brief would add ceremony and
a second place for the same facts to live.

---

## 3. Preflight — soft, and deliberately so

Stage #0 runs **first**. It does not require a Context Snapshot (#1) or a Rule
Set (#2) to begin, and that ordering is the point: normalising what the owner
wants must not be conditioned on what the codebase already contains, or the
requirements quietly become a description of the status quo.

The **audit phase** (§10) is the opposite — it exists to confront the ask with
reality, and there it reads the repository and consults #1 and #2 freely. Using
them as inputs to the audit does not move this skill later in the chain; the
technical data checks the input, it does not define the output.

If #1/#2 are unavailable at audit time, run them, or report the audit as
**incomplete** — and an incomplete audit blocks promotion (§4). Never skip the
audit silently: a brief with no audit is an unverified ask, and a brief with a
partial audit that reads as complete is worse than either.

---

## 4. Brief lifecycle

```
draft  →  ready-for-spec-authoring  →  superseded
  ↑                 │
  └─── re-opened ───┘
```

- **draft** — open to change. Not consumable by #4.
- **ready-for-spec-authoring** — the owner has accepted the requirements and the
  audit findings, and every active requirement is unambiguous (§5). This is the
  state #4 requires.
- **superseded** — a later brief replaces it wholesale; kept for the record.

**Promotion is the owner's act.** The skill proposes the transition and states
what is still open; it never promotes on its own judgement. This mirrors the
spec's freeze rule: the artefact becomes binding by a human act, not by an
agent's assessment.

Promotion is refused while any of these hold: a blocking open decision remains
(§8), the audit is incomplete (§3), or an active requirement still carries two
competing formulations (§5).

**Re-opening.** Any change to an active requirement after promotion returns the
brief to `draft`, records the reason, and invalidates the promotion. #4's
traceability map is stale until the brief is promoted again. This is the path for
visual feedback at the owner's pre-freeze review that turns out to change
observable behaviour, and for an impossibility discovered during implementation.
A brief is not superseded for a one-line change — `superseded` is for wholesale
replacement.

Note the deliberate asymmetry with a spec's `draft → frozen → deprecated →
retired`. A brief has no `deprecated`: it is superseded or it stands.

**Status lives in one place** — the `status` key in the document's YAML
frontmatter, with a value from the lifecycle set above. Do not restate the status
or a version number in the body; a fact written twice diverges, silently.

---

## 5. Requirements must be single-valued when promoted

While the brief is in `draft`, an owner's original claim and the audit finding
that contradicts it both stand, visibly — that is how the owner sees what
changed and why.

On promotion this collapses. Every **active** requirement states the accepted
formulation and only that. The superseded claim and the finding that displaced it
move into the audit history (§10), dated. `component-spec-writer` reads active
requirements and never arbitrates between two versions of one requirement: "the
brief says X, the audit says Y, the audit wins" is not a requirement, it is an
unfinished decision wearing a requirement's number.

The lint enforces the mechanical part — an audit fence may not sit inside a `CR`
declaration. The rest is the author's and the reviewer's.

---

## 6. Accepted inputs

| Input | Role |
|---|---|
| Owner prose, notes, a Linear issue body | **Primary.** The ask, in the owner's words. |
| Figma frame or screenshot | Reference only, bounded by §7. Never parsed programmatically. |
| Externally-authored specification | Treated as an **ask**, not as a spec — written without repository access, it is the highest-risk input for false premises. |
| Existing component source and its consumers | Audit evidence only (§10). |
| `ds-context` (#1) Context Snapshot | Audit evidence. |
| `ds-governance` (#2) Rule Set | Audit evidence. A requirement a rule forbids is a **conflict for the owner to decide**, not an automatic correction (§10). |

---

## 7. What a static visual can establish

A Figma frame or a screenshot confirms what is **observable on screen**, and
nothing beyond it. Treating a picture as a behaviour specification is the
quietest way to invent requirements nobody asked for.

| A visual establishes | A visual does not establish |
|---|---|
| Presence and arrangement of visible elements | Hidden or conditional behaviour |
| The depicted state, for the state depicted | Validation rules and error conditions |
| Visible text, iconography, relative emphasis | Keyboard interaction and focus order |
| Grouping and hierarchy as drawn | Persistence, timing, animation, transitions |
| | Responsive behaviour at widths not depicted |

Layer names are not a contract. Several frames depicting a sequence establish the
frames, not the transition between them.

Anything the brief needs but the visual does not show is either **confirmed by
the owner and attributed** to that confirmation, or an **open decision** (§8).
Never inferred silently, and never inferred at all when the inference would
create a requirement.

---

## 8. Blocking semantics

An open decision is owed by the owner, and every one carries an explicit mark:

- **blocking** — the brief cannot be promoted. It stays in `draft` and #4 never
  sees it. A requirement cannot be specified while what it should say is
  undecided.
- **non-blocking** — the brief may be promoted. The decision travels downstream,
  is carried into the spec's `open_questions`, and may block the spec freeze
  there.

An unmarked open decision is treated as blocking. The mark is proposed by the
skill and set by the owner. An unresolved governance conflict (§10, class C) is
blocking by default; the owner may downgrade it, recording why.

**Write the mark as a bracketed annotation**, in the declaration's own first
paragraph:

```md
**OD-001 — Which limit applies.** *(Blocking.)* The owner decides whether the
soft limit is 320 characters or the transport maximum.
```

Two details are load-bearing, and both exist because the looser form was tried
and failed:

- **The bracket.** A bare word is not a mark. "This is not non-blocking; the
  owner must decide" contains the string `non-blocking` and means the opposite;
  a substring test clears exactly the decision that most needs blocking.
- **The position.** Bracketing alone is not enough either — "The (non-blocking)
  path is favoured but not decided" is *syntactically identical* to a mark. Only
  position separates them, so a mark must sit at one end of the declaration:

| Declaration form | Where the mark goes |
|---|---|
| Bold run — `**OD-001 — Limit.** *(Non-blocking.)* …` | **leads** the text after the title |
| Heading — `### OD-001 — Limit. *(Non-blocking.)*` | **closes** the heading line, or opens the paragraph beneath it |

Anything mid-sentence is prose, in either form. A mark trailing a bold
declaration's sentence does not count either — a reader scanning declarations
would not see it.

`CRB-B3` enforces this: on a brief at `ready-for-spec-authoring`, an open
decision that is blocking — or carries no mark at all — is a lint failure, not a
review note. Without it §4's refusal to promote is prose, and a brief can reach
the spec stage with the owner's decision still owed while reading as settled.

**The two legacy briefs are outside this check** and, measured, are outside the
contract too: both are `ready-for-spec-authoring` while `textarea.md` names
Q1/Q2/Q4 "hard implementation blockers". `CRB-B3` reads `OD`, and legacy `Q` is
reachable only on those two exempted paths — so extending the rule to it would
apply to nothing except the two files that cannot be fixed until an earlier change. The
contradiction is real and is recorded there as a decision the migration must
make: either the marks become non-blocking, or the status goes back to `draft`.

---

## 9. Identifiers

| Prefix | Means | Where |
|---|---|---|
| `CR-001`, `CR-002`, … | An **actual requirement**. Nothing else, ever. | Behavioural requirements, states, interaction, content, accessibility, edge cases |
| `OD-001`, `OD-002`, … | An **open decision** owed by the owner. | Open decisions only |

Zero-padded to three digits, unique within the document, never reused after
removal. The spec, stories and tests then **reference** the identifier instead of
restating the requirement, which is what stops a requirement from being
paraphrased into something subtly different three artefacts later.

An open decision never receives a `CR`. A question is not a requirement, and a
`CR` that turns out to be a question in disguise is the failure mode this
separation exists to catch. Where nothing needs to cite an open decision, leave
it without an identifier rather than minting one.

A declaration opens a bold run or a heading:

```md
**CR-001 — Disabled.** When disabled, the component does not respond to pointer
or keyboard interaction and is skipped in the tab order.
```

**Migration, one-shot, no permanent exception — an earlier change.** `textarea.md` and
`charactercounter.md` predate this skill and use `R`/`D`/`Q`. They are renumbered
in a single change, with every reference updated in the same commit — task files,
Linear issue bodies, and any spec that already cites them.

**Until it lands, both remain `ready-for-spec-authoring` and remain consumable.**
That is deliberate, not an oversight: `component-spec-writer` builds its
traceability map against whatever identifiers a brief actually declares (§8c
there), so legacy numbering costs a spec nothing. Blocking spec authoring on a
renumbering would stall live work for a cosmetic reason — and the renumbering is
itself blocked on a cross-repository citation problem, not on effort.

Triage per identifier, because the mapping is not one-to-one:

- `R` (behavioural requirement) → `CR-nnn`.
- `D` (decision already made) → **not** an open decision. If it constrains
  observable behaviour → `CR-nnn`. If it excludes something → Non-goals, no
  identifier. If it records reuse → Dependencies, no identifier.
- `Q` (open question) → `OD-nnn`, with the blocking mark set (§8).

Until the migration lands, those two paths are the lint's only exemption, listed
by path and deleted with the migration. The exemption is a countdown, not a rule:
two live schemes make the lint and the traceability map harder for as long as
they both exist, and the cost of migrating only grows with the reference count.

---

## 10. Repository feasibility audit

The audit confronts the ask with the repository, and it is the highest-value
thing this skill does. An externally-authored specification is the primary
target: written without repository access, it will assert primitives, rules and
absences that do not hold.

Check at minimum:

| Question | How |
|---|---|
| Does the component already exist? | Search the DS component directory and the barrel export — the barrel, not the file's existence. |
| Who consumes it today? | Repository-wide search across **all** in-tree consumers, each with verified status. Never estimate. |
| Is an "open question" already settled? | Search frozen specs for an existing contract that answers it. |
| Does a claimed-absent capability exist? | Check the implementation, not the spec. |
| Do the assumed library versions hold? | Read the manifest of the package being changed. |
| Does a rule forbid the ask? | Consult #2 — and report it as a conflict, class C below. |

### Three classes of finding

**Class F — repository fact. Binding.** The component exists or does not; these
are its consumers; this is the installed version; this capability is implemented;
this frozen contract already answers that question. A fact does not need the
owner's agreement to be true. Where the brief asserts a repository fact the audit
falsifies, that assertion is corrected — no product intent is at stake in a false
fact.

A binding fact does not by itself rewrite a requirement. "The component ships
today and is consumed in 6 places" is binding as a fact; what the product should
therefore require is still the owner's call.

**Class C — conflict. A decision for the owner.** The requirement is legitimate
product intent and it collides with a governance rule (#2) or the system
architecture. The audit names the requirement, the rule, and the nature of the
collision, and returns three options:

1. change the requirement,
2. escalate the rule to the DS owner,
3. drop the requirement.

The audit does not pick one. Rules are not overruled by a brief, but neither is
product intent silently deleted by an agent reading a rule — an ask that a rule
forbids is often the strongest evidence the rule needs revisiting.

**Class S — feasibility recommendation. Advisory.** Whether this is best served
as a new component, an extension of an existing one, a composition of existing
ones, or feature-local code. The audit may recommend, with evidence. The decision
belongs to the spec stage (#4), because it is a decision about *how* the
requirements are met.

### Recording

Findings are returned to the owner as a distinct, reviewable set — not folded
into the prose and not left for the reviewer to discover.

**Audit prose is fenced**, and inside the fence it may name files, tokens,
versions and call sites — evidence that cannot be named is not evidence:

```md
<!-- repo-audit:begin -->
> **[Repo audit 2026-08-06 · class F]** The brief assumes no governed primitive
> exists. It ships today at <path>, with four sizes and a test file, consumed in
> 6 places.
<!-- repo-audit:end -->
```

The exemption is scoped to the fence and covers nothing else in the file. A fence
may not sit inside a `CR` declaration (§5); audit history lives in its own
section.

**The audit reports; it does not decide.** Naming a token an existing component
uses is a finding. Assigning that token to a new variant is a spec decision, and
writing it here takes it away from #4 without review.

---

## 11. Sections — written only when they have something to say

| Section | Contains |
|---|---|
| Problem and purpose | Why the component exists; the user-visible gap. |
| Intended use cases | Named, real consumer scenarios. Not hypotheticals. |
| Strategy recommendation | Advisory only, from the audit (§10, class S). Decided by #4. Omit when the audit has no view. |
| Behavioural requirements | The numbered core (§9). |
| States and transitions | Which states exist and what distinguishes them, observably. |
| Interaction model | Pointer, keyboard, and assistive-technology interaction as the user experiences it. |
| Content model | What content the component carries, and its limits. |
| Accessibility intent | Outcomes, not wiring. "Has a programmatic name", not "`aria-labelledby` composed from…". |
| Edge cases | Empty, long, error, slow, absent — those that apply. |
| DS versus product logic | Which behaviour belongs to the design system and which to the consumer. |
| Acceptance criteria | How the owner will judge the result. |
| Non-goals | Recorded so a future proposal reopens a decision rather than a blank. |
| Dependencies | Other components or contracts this one leans on. |
| Open decisions | `OD-*`, each with a blocking mark (§8). |
| Consumer impact | Who is affected today, verified by repository search — never estimated. |
| Audit history | Findings, dated and classed; superseded claims after promotion (§5). |

**A section with nothing to say is absent.** Not "N/A", not "TBD", not a heading
with one empty bullet. Sixteen headings is the shape that grew `chip.md` to 1659
lines; an empty heading invites filling.

---

## 12. Prohibitions, and the naming boundary

A brief must not contain: CSS classes · TypeScript interfaces or type
annotations · final prop names · file paths · React implementation · internal
token names where the decision is not yet made · any copy of the future spec.

> Right: *"When disabled, the component does not respond to pointer or keyboard
> interaction."*
> Wrong: *"Add `disabled?: boolean` and use `pointer-events-none`."* — that is
> `component-spec-writer`'s sentence, not this one's.

**The naming boundary.** A blanket ban on names is unworkable: it makes
requirements vaguer, not cleaner, because a requirement that may not name the
state it constrains cannot constrain it. The line is *when the name was decided*:

| Allowed — the name predates our decision | Forbidden — we are inventing it now |
|---|---|
| disabled, readonly, hover, focus, error | `bottomSection`, `autosize`, `minRows` |
| platform and ARIA vocabulary | any prop, slot or variant name this work would coin |

Six of these are checked mechanically by
`scripts/design-system/validate-component-requirements.py`. The rest are a
review judgement — the lint is a floor, not the contract.

### Anti-bloat

1. **One requirement = one observable behaviour, one or two sentences.** Longer
   means it is two requirements, or it has already become a spec. Split it or
   move it.
2. **An empty section is absent.** See §11.

A brief past roughly 300 lines is signalling that spec material has leaked into
it. Check before adding more.

---

## 13. Write scope

| Path | Operation |
|---|---|
| `docs/component-requirements/<component>.md` | create / edit the brief |

Lowercase component name, `.md`, under `paths.requirements`. Deliberately outside both
`paths.specs` and the component source paths — the PR gates classify those two, and a
brief must never be mistaken for either.

Nothing else is writable. Not the spec, not tokens, not source, not stories.

**Before handing off, the lint must pass:**

```bash
python3 scripts/design-system/validate-component-requirements.py --all
```

Exit 0 clean, 1 violations, 2 invocation error. It also runs pre-commit on staged
briefs and in CI (`component-requirements-validate.yml`). That workflow validates
brief files inside this repository and is the whole of this skill's automated
enforcement.

---

## 14. Handoff to component-spec-writer

When a brief exists for a component, `component-spec-writer` (#4) must produce a
complete, machine-readable **CR traceability map** — a section headed exactly
`## CR traceability`, with one row per requirement:

```md
## CR traceability

| Requirement | Spec section | Contract |
|---|---|---|
| CR-001 | §5 States | states.disabled |
| CR-002 | §7 Accessibility | a11y.name |
```

Every requirement the brief declares appears in the first column — `CR-nnn`, or,
for the two briefs still awaiting an earlier change, the `R`/`D` identifiers they carry. A
missing one is an incomplete spec: #4 does not return the spec as ready, and the
gap is named.

`OD` identifiers never appear in the map — an open decision is not traceable to a
spec section. Non-blocking open decisions are carried into the spec's
`open_questions`, where they may block the freeze. Blocking ones never reach #4
at all (§8).

No CI check enforces the map today — it is enforced here and in review. The fixed
heading and table shape exist so that a future gate can parse a table rather than free
text. In a single-repository layout the brief and the spec sit side by side, so such a
gate is a straightforward addition; it is simply not written yet.

---

## 15. Procedure

1. **Confirm stage #0 applies** (§2). An appearance-only change or a sweep does
   not get a brief.
2. **Read the ask in full** — every input the owner supplied, before writing
   anything. Do not start from a summary of it.
3. **Restate the problem in one paragraph**, in the owner's terms. If that cannot
   be done, the ask is not yet understood; ask, do not guess.
4. **Draft the requirements.** One observable behaviour each, numbered `CR-*`.
   Plain language. No implementation. Anything a visual implies but does not show
   becomes an owner question, not a requirement (§7).
5. **Run the feasibility audit** (§10). Consult #1 and #2 here.
6. **Class the findings** — F binding fact, C conflict for the owner, S advisory
   recommendation — and write them into the fenced audit history.
7. **Return the findings to the owner** as a distinct, reviewable set, with the
   three options spelled out for every class C conflict.
8. **Apply the owner's decisions.** Each active requirement ends up single-valued
   (§5); what it replaced goes to audit history.
9. **Mark every open decision** blocking or non-blocking (§8).
10. **Drop every empty section.**
11. **Run the lint.** Fix or fence.
12. **Propose promotion to `ready-for-spec-authoring`**, listing what remains
    open. Refuse to propose it while a blocking decision stands, the audit is
    incomplete, or a requirement is still double-valued. The owner promotes.

---

## 16. Never

- Never write implementation: a prop name we are coining, a type, a class, a path outside a fence.
- Never decide the component strategy — recommend it, and leave the decision to #4.
- Never treat a governance conflict as an automatic correction to a requirement (§10).
- Never leave two competing formulations on one active requirement in a promoted brief (§5).
- Never give an open decision a `CR` identifier, and never mix `CR` and `OD` roles.
- Never infer hidden behaviour, validation, keyboard behaviour, persistence or transitions from a static visual (§7).
- Never promote a brief on your own judgement, or with a blocking decision or an incomplete audit outstanding.
- Never skip the feasibility audit, and never report it as done when #1/#2 were unavailable.
- Never rewrite an owner's claim silently — record the finding, take the decision, keep the history.
- Never fill a section with "N/A" or "TBD" instead of removing it.
- Never estimate consumer impact — search for it, list the sites.
- Never reuse a retired identifier.
- Never restate the status or version outside the frontmatter.
- Never write outside `docs/design-system/component-requirements/`.
- Never author the spec (#4), source (#5), or stories (#6).

---

## 17. Dependencies

- **Upstream:** none hard. The owner's input is the input.
- **Consulted during the audit:** `ds-context` (#1), `ds-governance` (#2).
- **Downstream:** `component-spec-writer` (#4) consumes a brief in
  `ready-for-spec-authoring`, decides the component strategy, and produces the CR
  traceability map (§14).
- **Tooling:** `scripts/design-system/validate-component-requirements.py`;
  fixtures under `scripts/design-system/fixtures/`; suite under
  `scripts/design-system/tests/`.
- **Tools:** `Read`, `Glob`, `Grep`, `Write`, `Edit`, `Bash` (audit searches and
  the lint).
