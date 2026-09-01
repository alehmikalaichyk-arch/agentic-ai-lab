---
component: HorizontalStepper
spec_version: v1
spec_schema_version: 1
lifecycle: freeze_candidate
change_type: new_component
archetype: status-like
archetype_secondary: navigation-like
requirements_brief: docs/component-requirements/horizontal-stepper.md
---

# HorizontalStepper Specification

> **`frozen` is a fact, not a field.** No agent and no person writes `lifecycle: frozen`. A spec
> is frozen by being merged to the main branch. `freeze_candidate` is a ceiling the spec must
> *earn* by passing every gate below — not a value assigned to satisfy an instruction.

> **This spec is `freeze_candidate`, and that is as far as it goes.** It was held at `draft`
> through authoring and the visual draft, because two decisions it needed belonged to this
> repository's Governance Owner and to nobody else — writing them anyway is how another
> organisation's judgement gets laundered into this one. **Both were decided on 2026-09-01**, the
> brief's own blocking decisions were resolved with them, and every §8 gate now passes: all ten
> `freeze_requirements` flags `true`, every contradiction resolved, no open questions, no freeze
> blockers. The decisions and the alternatives they chose between are kept below under
> **Decisions taken at the freeze**, not deleted — a resolved decision that discards its options
> cannot be reviewed later, only re-litigated.
>
> What remains is not this document's to do: a human merging PR-1 is what makes this spec frozen.

## Provenance — what this spec is made of, and what it refused

Three inputs, in the precedent order `component-spec-writer` §4 fixes:

| Input | Standing here |
|---|---|
| `docs/component-requirements/horizontal-stepper.md` (stage #0, on `spec/horizontal-stepper-requirements`) | **Normative.** Its `CR-001`–`CR-018` are what this component must do. Its repo-audit fences are binding facts about *this* repository. |
| `badge.md`, present on `origin/main` | **Nearest — and only — frozen spec.** Same archetype, same inert contract. Section shape, contrast discipline and the "verified zero" habit are inherited from it. |
| Two externally-authored documents from a different design system — referred to throughout as **the source documents**, and the longer of the two as **the source specification** | **Evidence, never a template.** Read for rigour and for arguments worth stealing. Every value in them was re-derived against this repository or dropped. |

**The brief governs where it and the source documents differ**, and it says so itself in eleven
audited findings. This spec adds a twelfth position of its own: where a *decision* in those
documents rests on **that system's** owner, on a precedent component in that system, or on a
reference screen in that system, it does not transfer, because none of the three exists here. D1
lists what survived that filter.

**Two conditions of `component-spec-writer` were not met by the brief while this spec was authored,
and neither was hidden.** §7 requires a brief in `ready-for-spec-authoring`; it read
`status: draft`. §8c states that a brief carrying a *blocking* open decision is not consumable at
all; it carried two. The spec was authored against it under explicit instruction, and the gap was
recorded as a freeze blocker (FB-3) rather than absorbed.

**Both conditions are now met**, verified on the brief's own branch rather than taken on report: it
reads `status: ready-for-spec-authoring`, and its `OD-001` and `OD-002` are both marked *(Resolved.)*
and dated 2026-09-01. The precondition that made FB-3 a blocker is satisfied by fact, not by
decision — which is why it is recorded below as resolved by fact.

---

## Purpose and boundary

`HorizontalStepper` answers one question for a user part-way through a linear flow: **where am I,
and how much is left.** It renders that answer as a sentence and a strip of segments, and it does
nothing else. It is a read-only report of *ordinal position* — not a quantity, not a control, not a
route.

Stated against every neighbour it could be confused with, following `badge.md`'s pattern, because a
boundary given as a single pair is the one that gets crossed:

| Neighbour | Owns instead | The distinguishing question |
|---|---|---|
| Badge | The **state of the thing beside it**, in one or two words | Is it describing another element, or locating the reader? Describing → Badge. |
| Progress indicator (none here) | A **magnitude** — `role="progressbar"`, `aria-valuenow`, a percentage | Would an assistive technology be right to say "75 per cent"? Then it is not this component. |
| Tabs (none here) | **Navigation** between panels the user chooses | Can the reader change what is shown by using it? Then it is not this component. |
| Breadcrumbs (none here) | **Hierarchy and backward navigation**, as links | Are the items places you can return to? Then it is not this component. |

**This boundary is drawn without local precedent, and that is a finding, not a formality.**
Governance §12 lists six boundary pairs and none of them reaches a stepper; of the components §12
does name, only Badge exists in this repository, and only as a spec. Three of the four rows above
are therefore drawn against components that are **not present** — they describe the shape of a
future collision rather than reconciling a real one. Governance §15 classes "new component boundary
overlap" as Requires-Review for precisely this situation; it was folded into FB-1 and **approved on
that footing** — the Governance Owner granted option 1 on 2026-09-01, which is the option that
accepts a boundary recorded in the abstract and fills it in when a neighbour ships. Governance §12
was deliberately **not** amended (option 2 was available and not taken), so it still contains no
stepper pair. Adding one is future work for whoever ships the first neighbour.

**One honest qualification, from the visual draft.** Rendered, the strip's rhythm reads as
**progress** first and **position** second: the eye takes the contiguous dark run of completed
segments before it finds the marker. The four rows above separate this component from a progress
indicator, and the rendering does not support that separation as strongly as the prose does.

Three things follow, and the first is the one not to skip:

- **It changes nothing about the boundary.** The boundary is an *API and accessibility* contract —
  no `role`, no `aria-valuenow`, no `value`/`max` prop, no announced magnitude — and a visual
  impression cannot cross it. What an assistive technology reports is unaffected, and that is what
  the four rows are about.
- **It is a known cost of the form**, recorded rather than fixed. Any left-to-right strip of segments
  in two weights will read as a fill; that is what makes the form legible at a glance and it is the
  same property that makes it look like progress. A component that avoided it would be a different
  anatomy, which CR-016 forbids.
- **It would have been worse under FB-2's option B** — see the whole-strip percentage reading
  recorded there. The observation argued *for* CR-007 as written, not against this component's
  existence, and CR-007 as written is what the owner chose on 2026-09-01.

HorizontalStepper is **inert**: nothing focusable, nothing clickable, no interactive state, and no
prop that enables interaction later. Governance §6.2 names steppers in the inert set by name, so
this is a local rule the component obeys, not a preference it expresses. See the accessibility
contract for exactly what that promises and — narrower than it reads — what it does not.

---

## Deliberate decisions and rationale

Every contested choice, stated once, with the reason. Reviewer-anticipation RA-1: these belong in
the first draft, not in round four.

### D1 — What was taken from the source documents, and what was not

They are the owner's prose and a worked example from a different design system. Read in full;
transcribed nowhere. Three arguments survived on their own merits and are credited:

| Taken | Why it survives here |
|---|---|
| A stepper must not carry progress-bar semantics | The reasoning is about ARIA, not about the system it came from. Adopted in D3 and in the boundary contract. |
| The two gaps are set independently and merely happen to agree | A maintainability argument about *this* spec's future. Adopted in D6. |
| Contrast is measured, not asserted | `badge.md` already holds this line locally. Adopted, and applied to a scheme the source system never had to measure. |

Everything else was re-derived or dropped. Dropped, with the reason:

| Not taken | Why |
|---|---|
| The 44px fixed root height and its bottom-alignment mechanism | An owner decision of theirs, dated 2026-08-31. D6 derives a height instead of asserting one. |
| The `textSize` prop | Same owner, same date; no `CR` asks for it. D7. |
| The `textInset` prop | Exists for a full-bleed reference screen that does not exist here. D7. |
| The half-filled current segment — the source specification's decision to fill the current segment exactly half way, as a constant marker of position | That system's owner overrode their CR-007 to permit it. Ours **declined** it on 2026-09-01: CR-007 stands as written. FB-2. |
| `motion.duration-normal` on the fill transition | Not expressible from this repository's token layer. D10, measured. |
| `fg.subtlest` on the separator | 4.49:1 on `surface-page` here. D12, measured. |
| The machine-readable `contract:` block | No schema document exists in this repository to write it against. D11. |
| Their `spec_status.precedent` block | Every spec it names is absent here; the brief's audit says so and it is true. |
| Their consumer table | Three named consumers, none of which exists here. See **Consumers**. |

### D2 — A new component, on weak grounds, honestly labelled

Governance §7's decision tree answers *no* at steps 1, 2 and 3 — but it answers *no* trivially,
because the set it ranges over is empty: `src/components/ui/` contains only `.gitkeep`, and
`src/index.ts` is `export {}`. Step 4 asks whether the use case introduces "a reusable pattern with
a stable API", which is a claim about the future in a repository with **zero** call sites.

The strategy decision is this skill's to make (`component-spec-writer` §1) and it is made: **new
component**. The §15 *approval* for it is not this skill's and is not the source system's governance
owner's — it was FB-1, and it was **granted on 2026-09-01 by this repository's Governance Owner**,
on both grounds, taking option 1: the boundary is recorded in the abstract, to be filled in when a
neighbour ships. The weakness of the decision-tree grounds is not retracted by that approval — it is
what the approval was granted in spite of, and it stays on the record above.

### D3 — Fully inert, and the two safeguards governance §6.2 actually requires

CR-008 and CR-018, in full:

- segments are not clickable and not focusable;
- the `Step n of N` text is not clickable; the label is not clickable;
- there is no hover, pressed, selected, focus, disabled or loading state;
- direct navigation between steps is not supported, in any form, and **no prop enables it later**.

Flow controls — Back, Next, Continue, Finish, Cancel — are composed beside the component by the
consumer (CR-010).

**Governance §6.2 defines inertness as a property of what the component *provides*, and lists two
safeguards it considers sufficient.** Both are requirements of this spec:

1. **Rest props spread first** (§6.1), so a caller cannot take over `data-slot` or a mirrored
   attribute. The rest type stays the wide `React.HTMLAttributes<HTMLDivElement>`; it does **not**
   `Omit` `tabIndex`, `role` or event handlers, and it does not strip them at the output layer.
2. **A development-only warning when a caller passes `tabIndex`, `role`, or an activation handler**
   (`onClick`, `onKeyDown`, `onKeyUp`, `onPointerDown`) — `NODE_ENV !== 'production'` gated, once
   per mount, naming the prop and the value received.

Safeguard 2 is the clearest thing this spec has that its counterpart in the source system does not, and it is not
an improvement invented here — it is a local governance rule that a transcribed spec would have
silently omitted.

What that leaves true, stated because the two readings differ: a consumer *can* wrap this component
in a `<button>` or attach a listener by `ref`. Neither is reachable from inside it. Claiming
otherwise would describe a default as a guarantee.

### D4 — Three tones, not three fill extents — and what CR-007 costs

CR-007 says no segment is ever drawn partly filled. The brief's own States section says the
distinction between the three step states "is a matter of tone, not of added ornament". Taken
together those two sentences select the scheme: **one segment, one solid tone, three tones.**

| Step state | Which segments | Fill |
|---|---|---|
| completed | index < `current` | the whole segment, in the completed tone |
| current | index === `current` | the whole segment, in the current tone |
| upcoming | index > `current` | the whole segment, in the upcoming tone |

No segment is ever partly filled; no segment is a bare outline; every segment is the same width and
the same height (CR-002, CR-016).

**This is where CR-007 has a price, and the price is measurable.** It was the substance of FB-2, and
the owner **accepted this price on 2026-09-01** in declining the alternative. It is kept in full,
because the cost of a decision is the part most worth being able to re-read. The source system's scheme carries
the state distinction in fill *extent* — full, half, none — on one fill colour against a track. Bound
to the tokens **this** spec names, that pair is `surface-accent-grey-boldest` against
`surface-neutral-boldest`, and it measures **7.55:1**.

> **This figure read 10.12:1 until the visual draft, and 10.12:1 was wrong here.** It is the source
> system's own measurement, taken against `surface-neutral-bold` `#e4e6ed` — a track token this spec
> **rejects** in the table below, for an unrelated reason. Quoting it imported a number measured
> against a token this document does not use, into the one table the owner decided FB-2 from. That is
> exactly the transcription failure D1 exists to prevent, committed inside the section that costs the
> decision. Corrected in all three places it appeared, and recorded rather than silently overwritten.
> **The correction landed before the decision, which is the only reason it matters**: the owner
> declined the alternative on 2026-09-01 against 7.55:1, not against the 10.12:1 that was never this
> repository's number. One caveat stated at the time and now moot: under the extent scheme the track
> token would have been a fresh choice, so 7.55:1 was the figure *with this spec's faint tone*, not a
> floor. The extent scheme was not adopted, so no track token is owed.

A tone scheme has to find its distinction inside a grey ramp instead, and this palette's resting
greys are not spaced for it:

| Adjacent pair, as rendered side by side | Ratio |
|---|---:|
| current `#2d3342` vs completed `#6d7384` | **2.67:1** |
| completed `#6d7384` vs upcoming `#c5c8d1` | **2.83:1** |
| current `#2d3342` vs upcoming `#c5c8d1` | 7.55:1 |

**Neither adjacent pair clears the 3:1 that WCAG 2.2 SC 1.4.11 sets for a graphical object, and no
choice of tokens in this palette makes them.** The resting greys available as surfaces sit at
relative luminance `0.033`, `0.172`, `0.578`, `0.792`, `0.887` — there is nothing between `0.172`
and `0.578`, and the interaction-state tokens that would fill the gap (`-hovered`, `-pressed`) are
excluded because governance §4 requires a token's leaf name to describe its role and nothing here
is hovered or pressed.

Three things follow, and all three are stated rather than one of them being quietly relied on:

- **1.4.11 does not apply to these segments**, because they are not "required to understand the
  content". CR-001 and CR-004 put the whole of the information in text: the count and the total are
  always readable as words, and the indicator restates them. The indicator is `aria-hidden` and
  decorative by construction (A11Y-002). This is the same argument `badge.md` makes for its `dot`.
- **It is still a real weakness of the scheme, and it is escalated**, non-blocking, to
  `ds-governance` (#2) as a palette gap: the resting grey ramp has no mid step.
- **Resolving FB-2 toward the source system's override would have removed the weakness entirely** —
  the distinction would become extent at **7.55:1** rather than tone at 2.67:1, and would stop
  resting on tone at all. That was a quantified input to the owner's decision that neither input
  document contains, and it is the reason this spec measured the alternative instead of merely
  recording that one exists. What the ratio cannot show is that the two schemes degrade differently
  as segments narrow — see FB-2, which is where that evidence lands.

  **The owner declined it on 2026-09-01 and accepted the 2.67:1 scheme**, with this measurement in
  front of them. The weakness above is therefore a known, accepted property of the shipped
  component — not an unresolved finding, and not an invitation to re-open the decision at review.
  The escalation in the bullet above is the route by which it improves.

**Rejected, with reasons:**

| Rejected | Measured / reason |
|---|---|
| upcoming = `surface-neutral-bold` `#e4e6ed` | Better between segments (3.80:1 against completed) and **1.18:1 against `surface-page`** — the upcoming segments effectively vanish against the background, so the strip stops being countable. D5. |
| A ring or outline on the current segment | The track is 6px tall (D6); a 1px outline consumes a third of it and reads as mush, not as a state. |
| A darker tone from a `-hovered` / `-pressed` token | Governance §4: the leaf name must describe the role. Nothing here is hovered or pressed. |
| Three tones of a brand hue | The source specification measured two of its quiet tones at 1.06:1 against each other and abandoned the approach. Not re-derived; recorded as inherited evidence against an option this spec did not want. |

### D5 — The current segment is the strongest tone, not the darkest-behind-you

| Step state | Token | Value |
|---|---|---|
| completed | `surface-accent-grey-bold` | `#6d7384` |
| **current** | `surface-accent-grey-boldest` | `#2d3342` |
| upcoming | `surface-neutral-boldest` | `#c5c8d1` |

The obvious alternative is a monotonic ramp — completed darkest, current in the middle, upcoming
lightest — so the strip reads like a filled bar. It was rejected on the **first step**, which is
the state a user meets before any other. Monotonic at step 1 of 4 renders `[mid, light, light,
light]`: there are no completed segments, so the marker for "you are here" is the *weakest* tone on
the strip, separated from its neighbours by 3.80:1 and from nothing else. With the current segment
strongest, step 1 renders `[DARK, light, light, light]` and the marker is unmistakable at every step
index.

The brief settles which reading wins: the component exists to answer "*where am I in this
sequence*". It reports position, not quantity. The segment that marks the position should be the
one that carries the weight.

**`-boldest` orders steps within a family and promises nothing about darkness.** `surface-neutral-boldest`
is a light grey (`#c5c8d1`) and `surface-accent-grey-boldest` is nearly black (`#2d3342`); the two
suffixes are identical and the values are at opposite ends of the ramp. `src/tokens.test.ts` already
carries this warning in a comment for the *foreground* case. It is repeated here because this
component binds `-boldest` twice, in both senses, in adjacent rows of the same table.

### D6 — Geometry is derived from the spacing unit; no height is asserted

Every dimension resolves through `--ds-spacing-unit` (`4px`), so none of them is an arbitrary value
and none needs a waiver:

| Dimension | Utility | Resolves to |
|---|---|---|
| segment thickness | `h-1.5` | `calc(var(--ds-spacing-unit) * 1.5)` |
| gap between segments | `gap-2` | `calc(var(--ds-spacing-unit) * 2)` |
| gap between the text row and the indicator | `gap-2` | `calc(var(--ds-spacing-unit) * 2)` |

**The two gaps are set independently and happen to agree.** They answer different questions — the
horizontal one has to keep six segments reading as six discrete bars at a narrow width; the vertical
one separates a line of type from a rule beneath it. A later change to either must not be applied
to the other. (Argument credited to the source specification, which reaches the same conclusion for
the same reason; it is about maintenance, so it travels.)

**There is no fixed overall height, and that is the divergence.** The source specification pins the
root at 44px and bottom-aligns the content so the leftover space absorbs a type-size change. That mechanism
exists to serve a `textSize` prop this spec does not have (D7) and a number this repository's owner
never chose. Here the height is the sum of three fixed things — one clipped line of type, one gap,
one track — so it is **constant by construction** rather than by promise, which is what CR-017 asks
for. At the specified type (D8) that is `20px + 8px + 6px`; a reader should take the derivation as
normative and the arithmetic as illustrative.

Three consequences worth stating because each removes something the source specification needed:

- **No target-size disclaimer is owed.** 44px coincides with governance §10's minimum target size,
  which forced the source specification to spend an a11y item explaining that its height was not a
  target-size claim. Nothing here coincides with anything.
- **No trailing whitespace, for free.** With no slack in the box, the track's bottom edge *is* the
  component's bottom edge, so a stepper placed directly above a filled panel meets it flush.
- **Spacing below the component belongs to the consumer.** The component owns its own box and
  nothing outside it. This is the one thing a reader might expect it to do and it deliberately does
  not.

### D7 — Three props, not five

`current`, `total`, `label`. There is no `textSize` and no `textInset`.

Both of the absent props come from the source specification, both are owner decisions dated 2026-08-31,
and **no requirement in the brief asks for either.** `textInset` in particular exists to align text
to the content column of a specific full-bleed reference screen — a screen the brief's audit
verified does not exist here, in a repository with no product application at all. A consumer that
needs the text inset pads its own container.

Adding an axis no requirement asks for is not neutral: it is the "silent reinvention" that
`component-spec-writer` §4 makes a freeze blocker, and each axis would have dragged its own costs in
with it — `textSize` alone would have required the fixed-height mechanism of D6, a target-size
disclaimer, two more variant rows, and a height-invariance test facet measured from rendered boxes.

**None of the three props shadows a DOM or ARIA attribute** (RA-12), verified against the type
rather than recalled: `React.HTMLAttributes<T>` in `@types/react` declares `className` and does not
declare `current`, `total` or `label`. All three are destructured before the spread regardless.

### D8 — One type size, and it is `sm`

The count is `font-body-sm-moderate`; the label is `font-body-sm-default`. There is no size axis, so
one size had to be chosen, and CR-015 chooses it: the component reads as supporting chrome, never as
the primary object on the screen. `sm` is 14px/20px against `md`'s 16px/22px.

**A trap that is specific to this repository's type scale, and that reads backwards:** `default` is
the *lighter* weight and `moderate` the heavier one — `--ds-font-body-sm-default` resolves to weight
`300` and `--ds-font-body-sm-moderate` to weight `400`. So the count is the heavier of the pair even
though the label uses the token whose name says "default". Getting this the wrong way round inverts
the subordination CR-015 asks for while looking correct in a diff.

Both halves of the line sit on the same type **size**, so they share a baseline and read as one
sentence; what separates them is weight and colour, both of which make the label quieter. Making the
label physically smaller was available and rejected: it would read as a caption rather than as the
other half of a sentence.

The choice of `sm` over `md` is the one decision in this spec that a reader cannot check from a
document. The brief's audit says so directly — CR-015 is a *relative* judgement and this repository
has zero shipped components to judge against, so `a11y.measure_contrast_relative_to_shipped: true`
has no baseline to operate on. **The visual draft at stage #4.5 is the first surface able to test
it**, and it is where the owner confirms or overturns this choice.

### D9 — The component composes its own English copy, without the precedent that justified it there

`Step {current} of {total}` is built by the component. The consumer supplies the two numbers and,
optionally, the label text (CR-013).

The source specification justified this by pointing at a `ProgressBar` that formats its own value label. **No
such precedent exists here** — the brief's audit flags its absence as a real loss — so the decision
is made on CR-013's own terms instead: CR-013 states the rendered sentence as a *requirement*. A
requirement about a sentence can only be guaranteed by whoever composes the sentence. Pass it in and
CR-013 becomes advice.

**The cost, stated rather than discovered:** the component has no localisation channel, and its copy
is English-only. Governance §5 already requires API and UI strings in English, so this does not
violate a rule; it does mean that adding an i18n channel later is an additive revision to this
contract, not an implementation detail. Recorded as a non-goal, not as an open question, because the
spec makes the decision rather than deferring it.

### D10 — No motion, and the reason is not taste

**OD-003 is resolved here: the change between step states is not animated.** Nothing in the
component transitions.

The brief's audit established that this repository defines ten `--ds-motion-*` custom properties in
`generated/tokens.css` and publishes **zero** of them into `generated/tailwind-theme.css`. That was
re-verified, and then something worse was found by compiling Tailwind rather than reading the theme
file:

| Class | Compiles? | If it compiles, from where |
|---|---|---|
| `duration-normal` | **no** | — |
| `ease-out` | **yes** | Tailwind's own `--ease-out` default, not `--ds-motion-easing-ease-out` |
| `duration-150` | **yes** | Tailwind's numeric duration scale — a literal `150ms` |

`src/styles.css` deletes Tailwind's built-in colour palette with `--color-*: initial`, which is why
`bg-red-500` does not exist. **The `--ease-*` and duration namespaces were never given the same
treatment**, so Tailwind's motion defaults are live and reachable. And the coincidence is exactly
wrong: Tailwind's `--ease-out` is `cubic-bezier(0, 0, 0.2, 1)`, byte-identical to
`--ds-motion-easing-ease-out`, and `duration-150` is `150ms`, byte-identical to
`--ds-motion-duration-normal`. An implementer writing `transition-all duration-150 ease-out` would
produce **exactly the right rendering through entirely the wrong channel**, and nothing in this
repository would notice.

So specifying motion here would either bind a token with no utility behind it (impossible) or
sanction a design value that bypasses the token layer (forbidden, governance §14.6 in substance).
Neither is available, and the third option — asking the token build to publish `--ds-motion-*` into
`@theme` — is a change to the token layer, which this skill may never make.

Two escalations follow, both non-blocking, both to `ds-governance` (#2):

- **needs-new-rule:** the Tailwind reset in `src/styles.css` neutralises the colour namespace only.
  The motion namespaces are an open door of the same shape, and `src/tailwind-surface.test.ts` —
  which exists precisely because "the theme file said everything was fine" — asserts nothing about
  them.

  **And the door is propped open by this file.** Tailwind 4 auto-detects its sources and scans
  tracked Markdown, so the paragraph above — the one warning an implementer *not* to write
  `transition-all duration-150 ease-out` — puts exactly those three class names in front of the
  scanner and **materialises all three utilities into the compiled stylesheet.** Verified by
  compiling with this spec file as the only source: `.transition-all`, `.duration-150` and
  `.ease-out` are all emitted, alongside `.bg-surface-accent-grey-boldest` from the Tokens table.

  Nothing renders wrong — the classes apply to no element. The consequence is for the *guard*, not
  for the page: a future check that greps the compiled CSS for motion utilities would be defeated by
  the document that forbids them, and would report a violation no component committed. Whoever
  writes that guard must scan **component source**, not build output. Recorded here because it is
  the kind of fact that is discovered twice — once by the person who writes the guard, and once by
  the person who cannot work out why it is red.
- **needs-new-token (emission, not value):** the ten motion properties exist and are unreachable. If
  motion is ever wanted in a component, publishing them is the prerequisite.

If the owner wants an animated transition, the answer is the first escalation, not a class.

### D11 — No machine-readable `contract:` block

`component-spec-writer` §8d is explicit: a contract block "needs a normative schema document, and
this kit does not ship one … read it before writing a contract block: do not infer the schema from
an existing spec." Copying the source system's contract block would be exactly that inference, over a schema written
for a different drift test that does not exist in this repository.

`badge.md`, the only frozen spec here, carries no contract block either. So this spec carries none,
and every fact in it is enforced by human review, by the required test facets below, and — for the
token bindings — by the compile probe recorded under **Tokens**.

The consequence for the pipeline is nil: `tools/classify-pr-diff.sh` reads paths, not YAML, so PR-1
classifies `SPEC_ONLY` with or without a block.

### D12 — The separator is `fg-subtle`, because `fg-subtlest` fails AA on the page surface

The source specification puts its separator on `fg.subtlest`. Re-measured against this repository's built
tokens:

| Pair | Ratio | AA (4.5:1) |
|---|---:|---|
| `fg-subtlest` `#6d7384` on `surface-default` `#ffffff` | 4.73:1 | pass |
| `fg-subtlest` `#6d7384` on `surface-page` `#f7f9fc` | **4.49:1** | **fail** |

A component whose placement is the consumer's choice (CR-009) cannot bind a foreground that passes
on one of the two page surfaces this palette ships and fails on the other. The separator therefore
binds `fg-subtle` (`#51586b`), which measures 7.10:1 and 6.73:1 on the same two surfaces.

Two further notes, because the easy readings of this are both wrong:

- **`aria-hidden` does not excuse it.** The separator *is* `aria-hidden` (A11Y-002), and that
  changes nothing: SC 1.4.3 is about text a sighted reader sees, not about what is announced.
- **This is a palette finding as well as a component decision.** `src/tokens.test.ts` lists the
  pairs a component may use (`PAIRS`) and the pairs that look right and are not (`KNOWN_BELOW_AA`).
  `fg-subtlest` on `surface-page` appears in **neither** list. It is escalated to `ds-governance`
  (#2), non-blocking, as a pair that should be recorded in `KNOWN_BELOW_AA` so that "fixing" it
  later is a deliberate act rather than an assumed oversight.

### D13 — The consumer owns the background; two surfaces are in contract

The component paints no background of its own, so every ratio in this spec is measured against the
surface the consumer places it on. **`surface-default` (`#ffffff`) and `surface-page` (`#f7f9fc`)
are the two supported placements**, and both are measured under **Contrast**. A consumer placing
this component on a dark or a saturated surface is out of contract: the tone ramp of D5 inverts
against a dark background and the upcoming segment becomes the most prominent one.

Recorded as a boundary rather than defended in code, because a component cannot see what it is
sitting on and a prop that asked would be a placement API this spec does not want (CR-009).

### D14 — What happens below the width the text needs

**All three of the following were found by rendering the visual draft, not by reasoning about it.**
The spec said "the count is what survives every squeeze" and "the text row clips", and the draft
showed that the first held only above a width the spec never named and the second was not implemented
by anything. Both are specified here.

**A separator never outlives its label.** Measured at a container width of about 80px: the label
shrank to a rendered width of 0px and the row read `Step 2 of 4 ·` — a trailing middot with nothing
after it. The cause is a category error in the original anatomy, not a layout bug: the separator was
rendered on whether the `label` **prop** was present, while the label's **visibility** is a layout
outcome. Those are different facts and the spec conflated them.

The rule, stated as an invariant rather than as a width: **the separator is a property of the
rendered label, not of the prop.** Structurally, the separator and the label text occupy one clipping
box with the separator first (Anatomy), so there is no width at which the box can show the separator
and not the label — they shrink, truncate and disappear as a unit. `Step 2 of 4 ·` with nothing after
it is out of contract at **every** width, and a test facet asserts it at the width that produced it.

This also fixes a case the Edge cases table did have — `label=""` — for a reason it did not state.
The table covered "no label supplied" and "empty label"; it did not cover **"label supplied,
non-empty, and squeezed to zero"**, which is a third case and the only one that renders wrongly.

**The count never shrinks, and the component's minimum width is its own content.** Measured at a
container width of 64px: the count overflowed the root by 7.44px — the root kept the container's
width and the text escaped its own box, silently. Three options were available: accept that overflow,
clip the count mid-word, or state a floor.

**A floor, and the floor is `min-content`.** The count is the normative carrier of the whole
component — CR-001 and CR-004 put the position in text, and every argument in D4 about the indicator
being decorative rests on the count being readable. A scheme that clips the count mid-word defeats
the requirement everything else leans on, so option 2 is not available on the merits. Between the
other two, an unstated overflow is the worse failure because it is invisible in review: the
component looks fine and its text sits outside it.

So the root carries `min-w-min` — CSS `min-width: min-content` — and the count carries `shrink-0`.
Below its own intrinsic width the component **does not shrink**; the consumer's container is what
overflows, which is a visible, attributable layout error owned by the party that chose the width.
Stated as a contract term: **a consumer must not place this component in a container narrower than
its min-content width.** No px value is authored, because the intrinsic width depends on the digit
count and the font and a fixed number would be a guess that goes stale.

Recorded as a specified floor rather than as a fourth open decision, deliberately: the choice follows
from CR-001 and CR-004 rather than from taste, and the owner already has two blockers that genuinely
need them.

### D15 — The text row's internal spacing is a bound token, not a space character

The text row is a flex row, because truncation requires one. Flex collapses the ordinary whitespace
that would otherwise sit either side of the middot, so a gap has to be chosen or the count, the
separator and the label render jammed together. The original Tokens table bound two gaps —
segment-to-segment and text-row-to-indicator — and was silent about this third one, which meant the
value would have been settled by whoever implemented it first.

It binds `gap-1`, resolving to `var(--ds-spacing-unit)` — 4px, half the other two gaps. Added as the
thirteenth row of the Tokens table so that it is specified rather than inherited from a draft.

Deliberately **not** the same token as the other two gaps, and by the same argument D6 makes about
those: these are three separate questions that happen to have related answers. This one separates
words on one line; the other two separate a rule from a rule, and a line of type from a rule. A later
change to any of them must not be applied to the others.

---

## Anatomy

```
root                      data-slot="horizontal-stepper"
                          flex column, gap-2, min-w-min, height derived (D6)
├── text row              data-slot="horizontal-stepper-text"
│   │                     flex row, gap-1, single line, never wraps
│   ├── count             "Step 3 of 4"      font-body-sm-moderate, fg-default   REQUIRED
│   │                     shrink-0 — never shrinks, never truncates
│   └── label group       data-slot="horizontal-stepper-label"
│       │                 min-w-0, truncates as ONE box (D14)
│       ├── separator     "·"                fg-subtle, aria-hidden
│       └── label text    "Project Budget"   font-body-sm-default, fg-subtle
└── indicator             data-slot="horizontal-stepper-indicator"
                          aria-hidden, flex row, gap-2
    └── segment × total   equal width (flex-1), h-1.5, rounded-xs,
                          one solid tone per step state (D4, D5)
```

- **Root** — a `<div>` with no role. Carries the type and the resting foreground, so the count needs
  no colour of its own: it *is* the root style.
- **Text row** — one line. A flex row, never wrapping and never growing. This is the whole of
  CR-017's mechanism. Being a flex row is not incidental: truncation requires it, and flex collapses
  the ordinary whitespace a middot would otherwise sit in, which is why the row's internal spacing is
  a bound token rather than a space character (D15).
- **Count** — `Step {current} of {total}`, composed by the component (D9). `shrink-0`: it never
  shrinks, never wraps and never truncates, at any container width (D14).
- **Label group** — the separator and the label text in **one** clipping box, in that order. The
  group is the only element that gives up space (CR-012), and it gives up the separator and the
  label together. See D14 — a separator that outlives its label is out of contract at every width.
- **Separator** — a middot. `aria-hidden`, so the announced reading is "Step 3 of 4 Project Budget"
  rather than a punctuation mark read aloud. Rendered as part of the label group, never as a sibling
  of it.
- **Label text** — the current step's name only. Truncates with an ellipsis.
- **Indicator** — `aria-hidden` in its entirety, including every segment. Decorative: it restates
  what the count already says.
- **Segment** — internal, and deliberately not exported. A consumer never composes segments; the
  component derives them from `current` and `total`. Exporting one would invite the misuse D3 spends
  its length forbidding.

The component renders no numbered circles, no connector rules between steps, no per-step container,
and no row of every step's label (CR-016).

---

## Public API

| Prop | Type | Default | Required | Notes |
|---|---|---|---|---|
| `current` | `number` | — | yes | 1-based index of the step the user is on. Clamped — see Behaviour. |
| `total` | `number` | — | yes | Number of steps in the flow. Clamped — see Behaviour. |
| `label` | `string` | — | no | The name of the **current** step only. Empty or whitespace-only is treated as absent. |
| `className` | `string` | — | no | Merged through `cn()`, so a caller's utility wins over the component's own for the same property. |
| `...rest` | `React.HTMLAttributes<HTMLDivElement>` | — | no | Spread **first**, before the component's own attributes — governance §6.1. |

`ref` is forwarded to the root element. React here is 19.2, where `ref` is an ordinary prop;
`React.forwardRef` is not required and should not be added for its own sake.

**There is no boolean to switch the label on.** Supplying `label` renders it; omitting it does not.
The label-less form is the default and the recommended one (CR-005).

**`asChild` is not applicable, recorded rather than omitted.** Governance §6 requires it "where the
component should be polymorphic over its rendered element"; this component is not, and it renders a
`<div>` because that is what a strip of chrome is. Adopting the Radix `Slot` semantics would also
require a new runtime dependency — this repository's runtime dependencies are exactly
`class-variance-authority`, `clsx` and `tailwind-merge` — which governance §15 makes a
Requires-Review item. Neither is wanted.

### Controlled / uncontrolled

**Not applicable — the component holds no state.** Recorded explicitly rather than omitted: an
empty section reads as an oversight, and the next author adds a `defaultCurrent` to be safe.

The component is a pure projection of its props. The same `current`, `total` and `label` always
render the same output. There is no `defaultCurrent`, no `onCurrentChange`, and no internal
`useState`. The flow that owns the step owns the state — the same boundary D3 draws for navigation,
seen from the state side.

---

## Variants and sizes

**None.** There is no variant axis and no size axis (D7, D8). Recorded as a completed section with
nothing in it, rather than as a missing one.

---

## States

Three **step** states, decided per segment against `current`. They are properties of a segment, not
props of the component, and they differ only in tone (D4, D5).

| State | Which segments | Tone |
|---|---|---|
| completed | index < `current` | `surface-accent-grey-bold` |
| current | index === `current` | `surface-accent-grey-boldest` |
| upcoming | index > `current` | `surface-neutral-boldest` |

**No segment is ever partly filled** (CR-007). This was the one place the two input documents
contradicted each other; the Governance Owner settled it on 2026-09-01 in favour of CR-007 as
written (FB-2). No prop, no input and no internal state may make a segment's fill anything other
than whole or absent.

**The component itself has no states.** No hover, focus, active, pressed, selected, disabled,
loading or error. A hover style would promise an affordance the component does not have — the same
sentence `badge.md` writes for the same reason.

---

## Behaviour

A segment changes tone only because the flow moved the user. The component holds no state and
initiates no change. Nothing animates (D10).

### Input handling

Invalid input is corrected, never thrown. A strip of page chrome must not be able to take a page
down:

| Input | Behaviour |
|---|---|
| `total` < 1, non-integer, or non-finite | treated as `1` |
| `current` < 1, non-integer, or non-finite | treated as `1` |
| `current` > `total` | treated as `total` |

`total` above the designed range of two to six is **not** a warning and **not** an error. No maximum
is enforced: the component keeps rendering with narrower segments (CR-011).

### Development warnings

Two families, both `NODE_ENV !== 'production'` gated, both once per mount, both with a
regex-stable message naming the prop and the value received (RA-5):

1. **A corrected input** — one warning per corrected prop, naming both the received and the used
   value.
2. **Inert misuse** — a caller passing `tabIndex`, `role`, `onClick`, `onKeyDown`, `onKeyUp` or
   `onPointerDown`. Required by governance §6.2's second safeguard.

**Test posture:** assertions use a plain `render()`, not `StrictMode`, so the expectation is exactly
one call. Stated here so that a double-invoked effect in a future test setup is recognised as a
harness change rather than a regression.

---

## Tokens

Every binding below was verified by **compiling Tailwind against this repository's real stylesheet**
and checking that the class exists in the output — not by reading `generated/tailwind-theme.css`.
The distinction is the reason `src/tailwind-surface.test.ts` exists: the theme file is exactly what
said everything was fine while `bg-red-500` was still a working class.

| Element | Utility | Resolves to |
|---|---|---|
| root / count typography | `font-body-sm-moderate` | `--ds-font-body-sm-moderate` |
| root / count foreground | `text-fg-default` | `--ds-fg-default` |
| separator foreground | `text-fg-subtle` | `--ds-fg-subtle` |
| label typography | `font-body-sm-default` | `--ds-font-body-sm-default` |
| label foreground | `text-fg-subtle` | `--ds-fg-subtle` |
| segment, completed | `bg-surface-accent-grey-bold` | `--ds-surface-accent-grey-bold` |
| segment, current | `bg-surface-accent-grey-boldest` | `--ds-surface-accent-grey-boldest` |
| segment, upcoming | `bg-surface-neutral-boldest` | `--ds-surface-neutral-boldest` |
| segment corners | `rounded-xs` | `--ds-radius-xs` |
| segment thickness | `h-1.5` | `calc(var(--ds-spacing-unit) * 1.5)` |
| gap, segment to segment | `gap-2` | `calc(var(--ds-spacing-unit) * 2)` |
| gap, text row to indicator | `gap-2` | `calc(var(--ds-spacing-unit) * 2)` |
| gap, within the text row (count / separator / label) | `gap-1` | `var(--ds-spacing-unit)` — D15 |

Two layout utilities the component also carries are **not** token bindings and are listed separately
so they are not mistaken for one: `min-w-min` on the root and `shrink-0` on the count (D14). Both
resolve to CSS keywords — `min-width: min-content`, `flex-shrink: 0` — and carry no design value, so
there is no token for them to bypass.

Every one resolves through a semantic role to a primitive. **No primitive is bound**: primitives are
deliberately withheld from `@theme`, so `bg-brand-500` is not a class that renders wrong — it is a
class that does not exist, and the compile probe confirms it still does not.

**There is no `tokens/horizontal-stepper.json` and none is proposed.** Nothing here needs a value
the semantic layer does not already carry, and governance §15 makes a component token for a single
component a Requires-Review item that this spec has no reason to spend.

**Tokens are referenced, never defined.** A token that does not exist is a gap to escalate, not one
to invent. Two such gaps were found and escalated rather than worked around — the unpublished motion
namespace (D10) and the missing mid step in the resting grey ramp (D4).

---

## Accessibility contract

The position is carried by **text**, always. Everything else follows from that.

| ID | Requirement |
|---|---|
| A11Y-001 | The root is not focusable and carries no `tabindex`. |
| A11Y-002 | The indicator and every segment are `aria-hidden`; so is the separator. They are decorative — they restate visually what the text already says, and announcing them would read out a row of empty elements and a punctuation mark. |
| A11Y-003 | The component exposes **no role**. It is not a `progressbar`, not a `group`, not a `list`, not a `status` and not a `tablist`. It is text plus a decorative graphic. A role announcing a magnitude is the one thing that would make it wrong (CR: the brief's accessibility intent, verbatim — "a user of assistive technology must not be told that a magnitude is 75 per cent"). |
| A11Y-004 | Nothing inside the component enters the tab order, at any step count, with or without a label. |
| A11Y-005 | `aria-current` is deliberately absent. It marks the current item within a set of **links or navigational elements**, and there are none here (D3). |
| A11Y-006 | There is no live region. Announcing every step change would make page chrome interrupt the user; the flow's own controls already move focus into the new step's content. |
| A11Y-007 | The three step states remain identifiable when colour cannot be discriminated: the three tones differ in **lightness** (relative luminance `0.033`, `0.172`, `0.578`), so the ordering survives protanopia, deuteranopia, tritanopia and greyscale rendering — and the count states the position in words regardless (CR-003, CR-004). |
| A11Y-008 | The component carries no accessible name of its own and needs none. The count is ordinary text in the accessibility tree. |
| A11Y-009 | An automated accessibility scan passes on every Storybook scenario. **The mechanism is not yet decided and must not be assumed:** this repository has `@storybook/addon-a11y` and `axe-core` (transitively), and has **no** `jest-axe` and no `vitest-axe`. A spec naming `jest-axe` would name a package that is not installed. Choosing between a direct `axe-core` harness and the addon is #5's and #7's, and adding a dev dependency for it is a decision to record in PR-2. |

**Governance §10's minimum target size (44×44 px) has no case to apply to.** Nothing in this
component is a target. Unlike the source specification, no dimension here coincides with that number, so the
claim needs scoping rather than defending (D6).

**What "inert" does not promise** (governance §6.2): the rest type stays the wide
`React.HTMLAttributes<HTMLDivElement>`. The component provides no interactive behaviour and exposes
no prop to enable it; it does not prevent a consumer wrapping it in a `<button>` or attaching a
listener by `ref`. Neither is reachable from inside it, so claiming otherwise would describe a
default as a guarantee. The §6.2 safeguards it *does* implement are in D3.

### Contrast — measured, not asserted

Computed with the WCAG 2.x relative-luminance formula from the values in `generated/tokens.css`, on
this branch, at spec time. Not copied from a palette document and not inherited from the source
specification — five of these ratios appear there too, and they reproduce here because the two systems share
a palette and differ in the prefix. Reproducing them converted assertions into measurements.

**Text, on both supported surfaces (D13):**

| Element | Pair | on `surface-default` | on `surface-page` | AA (4.5:1) |
|---|---|---:|---:|---|
| count | `fg-default` `#0d1119` | 18.90:1 | 17.92:1 | pass |
| separator, label | `fg-subtle` `#51586b` | 7.10:1 | 6.73:1 | pass |
| *rejected* — separator on `fg-subtlest` `#6d7384` | | 4.73:1 | **4.49:1** | **fail on page** |

Worst shipped text pair 6.73:1 against a 4.5:1 floor. The rejected row is kept in the table rather
than deleted: a value that fails is more useful to the next author than its absence (D12).

**Segments, against each other and against both surfaces:**

| Pair | Ratio | Note |
|---|---:|---|
| current `#2d3342` vs completed `#6d7384` | **2.67:1** | the weakest link in the scheme — D4 |
| completed `#6d7384` vs upcoming `#c5c8d1` | 2.83:1 | below 3:1 — D4 |
| current vs upcoming | 7.55:1 | |
| current vs `surface-default` / `surface-page` | 12.62:1 / 11.97:1 | |
| completed vs `surface-default` / `surface-page` | 4.73:1 / 4.49:1 | |
| upcoming vs `surface-default` / `surface-page` | 1.67:1 / 1.59:1 | faint by design — it is the "not yet" tone |

**The two sub-3:1 pairs are declared, not buried.** SC 1.4.11 governs graphical objects *required*
to understand the content; these are not, because CR-001 and CR-004 put the position in text and
A11Y-002 marks the indicator decorative. The palette cannot do better — see D4 for the luminance
gap, the rejected alternatives, and the escalation. `a11y.measure_contrast_relative_to_shipped:
true` in `ds-kit.config.yml` would normally soften a finding like this against a shipped baseline;
**there is no baseline** — zero components are built — so every number above lands absolutely, with
nothing to be graded on a curve against.

**What PR-2 owes.** `src/tokens.test.ts` recomputes the pairs a component is allowed to use, and
adding a component means adding its pairs. `['fg-default', 'surface-page']` and `['fg-subtle',
'surface-page']` belong in `PAIRS`; `['fg-subtlest', 'surface-page']` belongs in
`KNOWN_BELOW_AA`. None of the three is there today. Doing it here would put source in PR-1, which
the pipeline forbids — it is listed under required test facets instead.

---

## Content guidelines

`Step {current} of {total}`. With a label, that sentence followed by a middot and the label
(CR-013).

A label **names** the current stage — a noun phrase or a short action phrase. It is never an
instruction (CR-014).

| | |
|---|---|
| Correct | `Project Information` · `Trade Partners` · `Project Budget` · `Review` |
| Wrong | `Here you need to enter the total budget for your project` |

**Labels for the other steps are never displayed, and the component has no way to accept them**
(CR-006). This is a property of the API, not a rendering choice.

---

## Edge cases

| Category | Covered / not applicable | Behaviour |
|---|---|---|
| empty | not applicable | There is no empty state. `total < 1` is corrected to `1`, so the component always renders at least one segment. |
| loading | not applicable | No async surface. A container awaiting the step count renders a skeleton in the component's place; that is the container's decision. |
| error | not applicable | No input to be invalid in the user's sense. Malformed props are corrected, not surfaced (Behaviour). |
| disabled | not applicable | Nothing to disable — D3. |
| read_only | not applicable | The whole component is read-only. |
| long_content | covered | The label truncates with an ellipsis on one line. The indicator, the count and the height are untouched (CR-012, CR-017). |
| large_dataset | not applicable | The designed range is two to six steps and no maximum is enforced; segments narrow, they do not paginate (CR-011). |
| mobile | covered | Narrow-container behaviour is specified below and has three Storybook scenarios. |

Case by case:

| Case | Behaviour |
|---|---|
| First step | The first segment is the current tone; every other is the upcoming tone. No segment is completed. |
| Final step | Every earlier segment is the completed tone; the last is the current tone. A state in which *every* segment reads as completed does not exist in this component. |
| Two steps | Same logic, same proportions. |
| Six steps | Same, with narrower segments. No segment collapses to zero width. |
| Above six steps | Keeps rendering. No warning, no ceiling (CR-011). |
| Long label | The label truncates. The indicator, the count and the height are unaffected (CR-017). |
| Narrow container, no label | The count and the full indicator both remain (CR-012). |
| Narrow container, long label | The label gives up space first; the count never truncates and the indicator never breaks. |
| `label=""` or whitespace only | Treated as absent — no separator is rendered. Inherited from `badge.md`, which renders nothing at all for whitespace-only `children`. |
| **Label present and squeezed to zero width** | The separator goes with it. The label group is one clipping box, so no width renders a trailing `·` with nothing after it. Found in the visual draft at ~80px, where the row read `Step 2 of 4 ·` — D14. |
| **Container narrower than the component's min-content width** | The component does not shrink and does not clip the count; the **container** overflows. `min-w-min` on the root, `shrink-0` on the count. Found in the visual draft at 64px, where the count escaped the root by 7.44px — D14. |

**The count is what survives every squeeze** — and D14 is what makes that true rather than
aspirational. It held only above a width the spec had never named, which is exactly the kind of
sentence a rendering falsifies and a document cannot.

---

## Placement

Top and bottom are equally supported and the behaviour is identical in both (CR-009). There is no
placement prop and no placement-conditional styling.

**Spacing below the component belongs to the consumer** (D6). The component ends at its indicator,
which is what lets a bottom-placed stepper meet a filled action panel flush.

**Flow controls are outside the component** (CR-010). Back, Next, Continue, Finish and Cancel are
composed beside it, in either placement.

---

## Dependencies

**None on another DS component, and no new runtime dependency.** `cn()` from `src/lib/utils.ts` is
the class-composition channel, as governance §14.5 requires.

Verified against the barrel rather than assumed (RA-9): `src/index.ts` is `export {}` and exports
nothing, so there is no existing primitive to reuse and none is claimed. This component's own export
is added to that barrel in PR-2, in the same pull request as the component.

This repository's runtime dependencies are exactly `class-variance-authority ^0.7.1`, `clsx ^2.1.1`
and `tailwind-merge ^3.5.0`. Nothing in this spec implies a fourth. Every requirement is satisfied by
rendering text and rectangles, and D3 removes the only reason a component of this kind normally
reaches for a behavioural primitive.

---

## Required test facets

| Facet | Assertion |
|---|---|
| segment count | Renders exactly `total` segments, checked at 2, 4 and 6. |
| tone distribution | At `current = 3` of `4`: two completed, one current, one upcoming — asserted by the bound token classes. |
| no partial fill | No segment carries a width other than the shared equal width; nothing renders a nested fill element. This is CR-007 made mechanical. FB-2 settled it in favour of CR-007 on 2026-09-01, so this facet is now a permanent assertion rather than a provisional one. |
| first / final | Correct distribution at both ends; no rendering in which every segment is completed. |
| token bindings | Each of the thirteen bindings under **Tokens** appears on the element the anatomy places it on. |
| contrast pairs | `src/tokens.test.ts` gains `['fg-default', 'surface-page']` and `['fg-subtle', 'surface-page']` in `PAIRS`, and `['fg-subtlest', 'surface-page']` in `KNOWN_BELOW_AA`. |
| label absent | No separator element and no label group are rendered. |
| label present | Count, separator and label render, in that order. |
| empty label | `""` and whitespace-only are treated as absent. |
| no dangling separator | At a container width of 80px with a label supplied, the separator is not the last visible glyph. Asserted on the **rendered** boxes at that width, not on the presence of the `label` prop — the prop is present in the failing case, which is the whole point (D14). |
| count never shrinks | At a container width of 64px the count's rendered width equals its width at 640px, and its text is uncut. |
| min-content floor | The root's rendered width is never less than its min-content width; where the container is narrower, the overflow is the container's and the count still sits inside the root's box (D14). |
| text-row gap | The count, separator and label are separated by the `gap-1` binding, not by whitespace in the markup — a text node between them would collapse under flex. |
| height invariance | The rendered height is equal with no label, with a label, and with a long label. Measured from the rendered box, not asserted from a class name (CR-017). |
| no trailing whitespace | The indicator's bottom edge equals the root's bottom edge. Measured from the rendered boxes — a class-name assertion would not catch a stray margin. |
| no tab stop | No element inside the component has a `tabindex`, and the container holds no focusable element. |
| indicator hidden | The indicator carries `aria-hidden`; so does the separator. |
| no role | The root carries no `role` attribute. |
| clamping | Each row of the Behaviour table, asserted on the rendered count text. |
| dev warnings, input | One warning per corrected prop, once per mount, silent in production, message matches a stable regex. Plain `render()`, so `toHaveBeenCalledTimes(1)`. |
| dev warnings, inert misuse | A caller passing `tabIndex`, `role` or an activation handler produces exactly one warning naming the prop. Governance §6.2. |
| spread ordering | `...rest` is spread before the component's own attributes, so a caller passing `data-slot` cannot take it over. `badge.md` AC7 precedent. |
| `className` | A caller's utility overrides the component's own for the same property, through `cn()`. |
| accessibility scan | An automated scan is clean, with and without a label. Mechanism per A11Y-009 — not `jest-axe`, which is not installed. |

---

## Storybook scenarios

Owned by `storybook-stories-generator` (#6); listed here because the spec is the source of *which
scenarios exist*.

`FirstStep` · `MiddleStep` · `FinalStep` · `WithLabel` · `LongLabel` · `TwoSteps` · `FourSteps` ·
`SixSteps` · `EightSteps` (above the designed range, no ceiling) · `NarrowContainer` (no label,
label, long label) · `SqueezedLabel` (~80px, the dangling-separator case — D14) · `BelowMinContent`
(64px, the overflow case — D14) · `OnPageSurface` (the second supported background, D13) ·
`TopPlacement` · `BottomPlacement` · `AboveActionPanel` (the flush seam of D6).

`SqueezedLabel` and `BelowMinContent` exist because both defects were invisible in every scenario
above them: each renders correctly at every width the other stories use. A scenario list that only
shows a component working is a list that cannot fail.

`TopPlacement`, `BottomPlacement` and `AboveActionPanel` compose the component into a page and
**must show the flow controls outside it** — that is the point of those scenarios, and a reader must
not be able to infer from the stories that Back and Next belong to the stepper.

---

## Acceptance criteria

The first ten mirror the brief's own list, in its order. The rest are this spec's.

| # | Criterion | Covers |
|---|---|---|
| AC1 | A user identifies the current step and the total without reading any other part of the page | CR-001 |
| AC2 | Segment count equals step count, at two, four and six | CR-002 |
| AC3 | Completed, current and upcoming are tellable apart at a glance | CR-003 |
| AC4 | Correct and complete with no label supplied — and that is the default | CR-005 |
| AC5 | Correct and complete with a label supplied | CR-005, CR-013 |
| AC6 | Renders correctly above and below page content, with no behavioural difference | CR-009 |
| AC7 | Nothing can be clicked, and tabbing through the page never stops on it | CR-008, CR-018 |
| AC8 | No labels other than the current step's, and no API accepts them | CR-006 |
| AC9 | A long label leaves the indicator, the count and the component height untouched | CR-012, CR-017 |
| AC10 | Nothing about it presumes a vertical arrangement | non-goal |
| AC11 | No segment is ever drawn partly filled, and no prop or input can make one so | CR-007 |
| AC12 | The three step states differ in lightness, so the ordering survives greyscale | CR-003, CR-004 |
| AC13 | Every text pair the component binds is at least 4.5:1 on **both** `surface-default` and `surface-page` | D12, D13 |
| AC14 | The root renders a `<div>` with no role, no `tabindex` and no event handlers of its own | A11Y-001, A11Y-003 |
| AC15 | `...rest` is spread before the component's own attributes, so `data-slot` cannot be taken over | governance §6.1 |
| AC16 | A caller passing `tabIndex`, `role` or an activation handler gets exactly one development warning | governance §6.2 |
| AC17 | Nothing in the component transitions or animates | D10 |
| AC18 | Placed directly above a filled panel, the indicator meets it flush — no band of the wrong background between them | D6 |
| AC19 | No container width renders a separator with no label after it | D14, CR-012 |
| AC20 | The count is never shrunk, wrapped or clipped at any container width; below the component's min-content width the container overflows, not the count | D14, CR-001 |

**The brief's eleventh criterion — "it reads as chrome, not as the subject of the page" (CR-015) —
is deliberately absent from this list**, for the reason the brief gives: it is a relative judgement
and this repository has nothing shipped to judge it against. CR-015 is a requirement and it is
specified (D8, and the token bindings); it is the *criterion* that has no instrument until the
visual draft at stage #4.5.

---

## CR traceability

| Requirement | Spec section | Contract |
|---|---|---|
| CR-001 | Purpose and boundary; Anatomy; D14 | — |
| CR-002 | Anatomy; States | — |
| CR-003 | States; D4; D5 | — |
| CR-004 | Accessibility contract (A11Y-007) | — |
| CR-005 | Public API | — |
| CR-006 | Content guidelines; Public API | — |
| **CR-007** | **States; D4 — stands as written; the contest recorded at FB-2 was decided in its favour, 2026-09-01** | — |
| CR-008 | D3; Accessibility contract | — |
| CR-009 | Placement; D13 | — |
| CR-010 | Placement; Purpose and boundary | — |
| CR-011 | Behaviour; Edge cases | — |
| CR-012 | Edge cases; Anatomy; D14 | — |
| CR-013 | Content guidelines; D9; D15 | — |
| CR-014 | Content guidelines | — |
| CR-015 | D8; Tokens; Acceptance criteria (excluded, with reason) | — |
| CR-016 | Anatomy; D4 | — |
| CR-017 | Anatomy; D6; Edge cases | — |
| CR-018 | D3; Accessibility contract (A11Y-004) | — |

The `Contract` column is empty for every row because this spec carries no machine-readable contract
block (D11). Every row is verified by the required test facets and by human review. Recorded as
empty rather than removed: a column that vanishes reads as a claim that was never made, and the
whole point of the map is that nothing goes missing quietly.

CR-007 appears with its dispute rather than being dropped. **OD identifiers deliberately do not
appear in this map** (`component-spec-writer` §8c): an open decision is not traceable to a spec
section — it is a question the owner still owes.

---

## Consumers

**None — verified zero, at spec time, on this branch.** Recorded as a verified zero rather than left
blank: a blank Consumers section is indistinguishable from an unchecked one, and an unchecked one is
how a "sole consumer" claim turns out to be six.

Verified by:

- `grep -ril stepper` over `*.ts`, `*.tsx`, `*.css`, `*.json` excluding `node_modules/` and `.git/`
  → no source match.
- `src/index.ts` → `export {}`. Checked against the barrel, not merely the filesystem (RA-9).
- `src/components/ui/` → contains only `.gitkeep`.

This repository holds a design system and no product application, so no consumer *could* import a
stepper today. The three consumers the source specification names — all of them screens in that
system's own product — **do not exist here**; there is no `apps/` directory. Their entire consumer
table is dropped rather than adapted.

This spec is additive. Nothing that ships today changes when it merges.

---

## Non-goals

- **A Vertical Stepper**, or any anatomy shaped to accommodate one later — no orientation prop, no
  axis abstraction, no layout indirection.
- **The classic labelled stepper** — numbered circles, connectors, every step named (CR-016).
- **Navigation from a segment**, in any form. Should a flow need it, that is a distinct behavioural
  requirement to be brought, argued and specified on its own — never a default that arrives with
  every instance, and not an escape hatch left open here.
- **Back / Next / Continue / Finish / Cancel controls** (CR-010).
- **Reporting progress *within* a step** (CR-007). A future request to drive a fill from real
  progress is a different component, not a prop.
- **Localisation.** The component owns its English copy (D9); it has no i18n channel, and adding one
  is an additive revision to this contract rather than an implementation detail.
- **Owning or validating the content of a step.**
- **A size or inset axis** (D7).
- **Motion** (D10), until the motion tokens are published to the Tailwind theme.
- **Migrating an existing implementation.** There is none to migrate.

---

## Freeze gates — all must be true before `freeze_candidate`

- [x] anatomy complete
- [x] API complete
- [x] variants complete (recorded as none, with the reason)
- [x] states complete
- [x] controlled/uncontrolled contract complete (recorded as not applicable, with the reason)
- [x] accessibility complete
- [x] token references complete
- [x] edge cases complete
- [x] boundary contract complete (drawn without local precedent — see Purpose and boundary)
- [x] acceptance criteria complete
- [x] **freeze blockers empty** — all three resolved on 2026-09-01, recorded below

Every gate passes, so the spec stands at `freeze_candidate`. It is not `frozen` and this document
cannot make it so: a spec is frozen by being present on `origin/main`, and the merge of PR-1 is the
act. `freeze_candidate` is the ceiling `component-spec-writer` §3 permits any author, human or
agent, to write.

### Decisions taken at the freeze

All three blockers that held this spec at `draft` are resolved. **The options each decision chose
between are kept in full**, along with the arguments that framed them: a resolved decision that
deletes its alternatives cannot be reviewed later, only re-litigated. What changed is the verdict
line, not the reasoning above it.

**FB-1 — OD-001: the governance §15 Requires-Review approval.**
Two grounds applied: "new component" (decision tree §7) and "new component boundary overlap" (§12).
The source documents record both being granted — by **that system's** governance owner, on
2026-08-31. **That approval did not transfer**, and it is important that this stays on the record:
the objection was never that no approval existed, only that it belonged to someone else. The
boundary question was also harder here than it was there — governance §12 contains no stepper pair,
and of the components a boundary would be drawn against, only Badge exists. The options the brief
set out:

1. approve the new component and record its boundary in the abstract, to be filled in when a
   neighbour ships — **this spec was written for this option**, and its boundary contract says so;
2. approve it and add the stepper pair to governance §12 first;
3. decline, on the grounds that a component with zero in-tree consumers has not yet demonstrated
   the "reusable pattern with a stable API" that decision-tree step 4 requires.

> **RESOLVED — GRANTED, option 1.** Decided 2026-09-01 by this repository's Governance Owner (§17,
> *Design System Maintainer*). Both grounds approved together: new component, and new component
> boundary overlap. The boundary stands **recorded in the abstract** — three of its four rows are
> drawn against components that do not exist here, and they are to be filled in when a neighbour
> ships. The spec's boundary contract needs no change, because it was written for this option and
> says so. Option 2 was not taken, so governance §12 still contains no stepper pair; that remains
> true of this repository until someone adds one.

**FB-2 — OD-002: whether a segment may be drawn partly filled.**
The two input documents contradicted each other. The brief's CR-007 forbids a partly-filled segment.
The source specification fills the current segment exactly half way and records **its** owner
overriding **its** CR-007 on 2026-08-31, reasoning that a constant half is a marker of position
rather than a report of progress. That override belonged to someone else.

**What this spec did in the interim:** CR-007 stood as written. D4 and D5 specify a three-tone
scheme with no partial fill, and the required test facets assert it. The spec was authored on that
basis so the owner chose between two *specified* components rather than between a specification and
a sketch.

> **RESOLVED — DECLINED. CR-007 stands as written; option A.** Decided 2026-09-01 by this
> repository's Governance Owner. Three solid tones; the source system's override is **not** adopted
> here. No segment is ever drawn partly filled, and no prop, input or internal state may make one so.
>
> **The cost the owner accepted, stated as accepted and not re-argued.** The state distinction now
> rests on **adjacent tones at 2.67:1** rather than on **extent at 7.55:1**, and it degrades as
> segments narrow: at roughly 25px segments — 256px across eight steps — the current segment has to
> be hunted for, which the visual draft measured. Neither adjacent tone pair clears SC 1.4.11's 3:1,
> and this palette cannot supply one that does (D4). **This is an accepted trade, not an oversight
> and not a defect to be re-opened at review.** The three non-blocking escalations that describe the
> underlying palette gap stand unchanged, and they are the route by which this improves — not a
> second attempt at the decision.
>
> What made the trade acceptable is on the record too: the position is carried by text at all times
> (CR-001, CR-004), the indicator is `aria-hidden` decoration, the three tones differ in *lightness*
> so the ordering survives colour-vision deficiency and greyscale, and option B would have turned the
> whole strip into a percentage — `[full, full, full, half]` reading as 87.5 % full — which is what
> CR-007 exists to prevent.

**FB-3 — the brief's promotion. Resolved by fact, not by decision.**
`component-spec-writer` §7 requires a brief in `ready-for-spec-authoring`, and §8c holds that a
brief carrying a blocking open decision is not consumable at all. The brief read `status: draft`
and carried two blocking decisions while this spec was authored.

> **RESOLVED.** Verified on the brief's own branch rather than taken on report: it now reads
> `status: ready-for-spec-authoring`, and its `OD-001` and `OD-002` are both marked *(Resolved.)*,
> dated 2026-09-01. This blocker needed no decision of its own — it cleared when FB-1 and FB-2 were
> answered, exactly as it said it would.

**What the choice costs, measured — this is new, and it is why the blocker is worth the wait:**

Option A is CR-007 as written and is what this spec specifies. Option B is the source system's
override. Neither column is a recommendation; the right-hand one is specified to the same depth as
the left so that the owner compares two components rather than a component and a sketch.

| | **A** — CR-007 as written (this spec) | **B** — the source system's override |
|---|---|---|
| Mechanism | three tones, one per state | one fill colour at two extents plus a constant half |
| State distinction | **2.67:1** at its weakest adjacent pair | **7.55:1**, fill against track — with this spec's faint tone as the track. Under B the track token is a fresh choice and could be lighter still |
| Survives colour-blindness | yes — the tones differ in lightness | yes — extent is not a colour distinction at all |
| **Degrades as segments narrow** | **badly** — the distinction is width-independent as a ratio and not as a percept | **well** — extent is a shape cue, and shape survives narrowing better than tone |
| Requires a palette the repository does not have | yes, to clear 3:1 (D4) | no |
| Risk it introduces | none | the whole strip reads as a percentage — see below |

**Two things the ratio table cannot show, from the visual draft.** Both were found by rendering,
both bear on this decision, and neither is derivable from a contrast measurement.

- **2.67:1 is width-independent; being able to *see* it is not.** At 640px across four steps the
  current-versus-completed distinction is comfortably legible. At 256px across eight steps —
  segments of about 25px — the current segment has to be hunted for. The ratio is identical in both
  renderings, because a contrast ratio is a property of two colours and not of the area carrying
  them. **This is the strongest argument against option A**, and it exists nowhere in D4's numbers.
  Option B is the mirror image: as segments narrow, a half-filled bar stays a half-filled bar.
- **Option B's risk is broader than "a half-filled segment reads as 50 % of a step".** That is the
  per-segment misreading CR-007 names, and it is the smaller half of the problem. Rendered, the
  damage is at whole-strip level: `[half, empty, empty, empty]` reads as a bar **12.5 % full**, and
  `[full, full, full, half]` as one **87.5 % full**. Option B does not merely risk a misreading of
  one segment — it turns the component into a percentage, which is the thing the boundary contract
  spends four rows separating it from. That sharpens CR-007's case rather than weakening it, and it
  is recorded on the option this spec does *not* specify, so the owner is not choosing from a
  one-sided brief.

Option 3 from the brief — drop CR-007 and let the spec choose — is not recommended here either, for
the brief's reason: an unstated rule is how "half full" later becomes "42 per cent". The whole-strip
reading above is that sentence with a number attached.

**Not a blocker: OD-003 (motion).** Resolved in D10 — the repository's token layer cannot express it,
so the component does not animate. Two non-blocking escalations were raised instead of a decision
being deferred.

---

## Spec status

```yaml
spec_status:
  schema_version: 1
  generated_at: 2026-09-01T00:00:00Z
  generator: component-spec-writer
  component: HorizontalStepper
  spec_version: v1
  spec_schema_version: 1
  lifecycle: freeze_candidate # the ceiling any author may write; `frozen` is what merging makes true
  change_type: new_component
  archetype: status-like
  archetype_secondary: navigation-like
  precedent:
    nearest_frozen_spec: badge.md@v1
    precedent_pool_note: >
      One spec is present on origin/main (docs/component-specs/badge.md). The
      component-spec-writer §7a exclusion was run against it and it is NOT excluded —
      its lifecycle blob declares neither deprecated nor retired. Pool size after
      exclusion: 1.
    inherited_from:
      - "section shape: Purpose and boundary / Anatomy / API / States / Tokens / Accessibility / Edge cases / Consumers / Non-goals / Freeze gates — badge.md"
      - "'contrast measured, not asserted' as a required section with a ratio table — badge.md"
      - "the neighbour table that states a boundary against every confusable component, not one pair — badge.md"
      - "'verified zero' consumers with the search that verified it — badge.md"
      - "empty or whitespace-only text content treated as absent — badge.md"
      - "the inert contract and the §6.2 'what inert does not promise' paragraph — badge.md"
      - "no contract: block — badge.md, and component-spec-writer §8d (no schema document in this repository)"
      - "spread-first ordering asserted as an acceptance criterion — badge.md AC7"
    divergences:
      - "the label truncates, where badge.md's label deliberately does not — CR-012 requires the label to yield space first; badge's rule follows from its Tag boundary, which does not apply here"
      - "three props (current, total, label), where the source specification has five — textSize and textInset are that owner's decisions and no CR asks for them (D7)"
      - "height derived from type + gap + track, where the source specification pins 44px on the root and bottom-aligns to absorb a textSize change (D6)"
      - "three solid tones, where the source specification uses one fill colour at three extents — CR-007 stands as written here; confirmed by the Governance Owner on 2026-09-01 (D4, and FB-2)"
      - "the current segment is the strongest tone, where the source specification makes 'done' the strongest — rejected on the first-step rendering (D5)"
      - "separator binds fg-subtle, where the source specification binds fg.subtlest — 4.49:1 on surface-page here (D12)"
      - "type is sm and there is no size axis, where the source specification defaults to md with a textSize prop — CR-015, and no axis to hang md on (D8)"
      - "no motion, where the source specification binds motion.duration-normal — no duration utility exists in this repository's Tailwind theme (D10)"
      - "a development-only warning on inert misuse (tabIndex / role / activation handler), which the source specification does not carry — required by THIS repository's governance §6.2"
      - "boundary drawn against Badge, a progress indicator, Tabs and Breadcrumbs, where the source specification draws against ProgressBar, StatusDistributionBar, SegmentedControl and Pagination — three of this repository's four do not exist, and governance §12 has no stepper pair"
  rule_set_reference:
    generator: ds-governance
    schema_version: 1

freeze_requirements:
  anatomy_complete: true
  api_complete: true
  variants_complete: true                            # none; recorded with the reason
  states_complete: true
  controlled_uncontrolled_contract_complete: true    # stateless by construction; the section states why
  accessibility_complete: true
  token_references_complete: true
  edge_cases_complete: true
  boundary_contract_complete: true
  acceptance_criteria_complete: true

edge_case_categories:
  empty: not-applicable        # total < 1 is corrected to 1; at least one segment always renders
  loading: not-applicable      # renders from props it already has
  error: not-applicable        # D3 — no error state; malformed props are corrected
  disabled: not-applicable     # D3 — nothing to disable
  read_only: not-applicable    # the whole component is read-only
  long_content: covered
  large_dataset: not-applicable
  mobile: covered

contradictions:
  - id: c1
    description: >
      CR-003 requires three distinguishable step states, while CR-016 forbids added ornament and
      CR-015 wants the lightest possible visual weight.
    resolution: >
      The distinction is carried by three solid tones on identical segments (D4, D5). No second
      hue, no shape change, no iconography, no size difference between segments, no ring or
      outline. The measured weakness of the tone ramp is declared under Contrast rather than
      resolved by adding ornament.
    status: resolved
  - id: c2
    description: >
      The source specification overrides CR-007 to permit a half-filled current segment, filled to
      a constant half as a marker of position; the brief carries CR-007 as written. The two input
      documents contradict each other.
    resolution: >
      Decided 2026-09-01 by this repository's Governance Owner: DECLINED — CR-007 stands as
      written, three solid tones, the source system's override not adopted. Not resolved by this
      skill, deliberately, because it was never this skill's to resolve; it was carried as a
      freeze blocker with both options specified and costed until the owner answered. The accepted
      cost is recorded verbatim under FB-2: the state distinction rests on adjacent tones at
      2.67:1 rather than extent at 7.55:1, and degrades at roughly 25px segments. An accepted
      trade, not an oversight.
    status: resolved
  - id: c3
    description: >
      CR-004 requires the position to survive poor colour discrimination, while the three-tone
      scheme of D4 distinguishes segment states by colour alone.
    resolution: >
      The three tones differ in relative luminance (0.033 / 0.172 / 0.578), so the ordering is a
      lightness distinction rather than a hue one and survives every common colour-vision
      deficiency and greyscale rendering (A11Y-007). Independently, the count and the total are
      always present as text, which is what CR-004 actually requires.
    status: resolved
  - id: c4
    description: >
      CR-017 requires the component height to be unaffected by label length, while the label is
      free-form consumer text of any length.
    resolution: >
      The text row is a single clipped line that never wraps, and the label truncates. The height
      is the sum of three fixed things and is constant by construction, not by promise (D6). A
      rendered-box measurement is a required test facet, because a class-name assertion would not
      catch it.
    status: resolved
  - id: c5
    description: >
      The source specification binds motion.duration-normal for its fill transition; this
      repository defines ten --ds-motion-* properties and publishes none of them to Tailwind.
    resolution: >
      The component does not animate (D10). A compile probe confirmed that duration-normal does
      not exist, and — the part that is not in either input document — that Tailwind's own
      duration-150 and ease-out DO compile and coincidentally match the token values, so the
      wrong channel would have produced the right rendering. Two non-blocking escalations raised.
    status: resolved
  - id: c6
    description: >
      badge.md establishes that a label neither wraps nor truncates; CR-012 requires this
      component's label to give up space before anything else.
    resolution: >
      Recorded as a deliberate cross-spec divergence rather than reconciled. badge.md's rule
      follows from its boundary against Tag — a Badge long enough to need truncation is being
      misused. This component's label is arbitrary consumer prose in a fixed-height strip, where
      truncation is the requirement rather than a symptom.
    status: resolved
  - id: c7
    description: >
      Anatomy rendered the separator on the presence of the `label` PROP, while CR-012 makes the
      label's visibility a layout outcome. At ~80px the label shrank to 0px and the row rendered
      `Step 2 of 4 ·` — a separator outliving the label it separates. Found in the visual draft;
      not derivable from the document, which was self-consistent and wrong.
    resolution: >
      The separator and the label text now occupy one clipping box, separator first (D14). No
      width can show one without the other. A required test facet asserts it on the rendered boxes
      at the width that produced the defect, not on the prop.
    status: resolved
  - id: c8
    description: >
      "The count is what survives every squeeze" (Edge cases) and "the text row clips" (Anatomy)
      were both false below the count's intrinsic width: measured at 64px the count overflowed the
      root by 7.44px, and nothing in the spec clipped it or set a floor.
    resolution: >
      D14 states the floor: min-w-min on the root, shrink-0 on the count. The component never
      shrinks below its min-content width and never clips the count; a narrower container overflows
      instead, which is a visible error owned by whoever chose the width. Clipping the count was
      rejected on the merits — CR-001 and CR-004 make it the normative carrier.
    status: resolved
  - id: c9
    description: >
      The Tokens table bound two gaps and was silent on the spacing between count, separator and
      label. The text row must be a flex row for truncation, and flex collapses the whitespace a
      middot would sit in, so the value could not be left unstated without #5 choosing it.
    resolution: >
      A thirteenth token binding, gap-1 -> var(--ds-spacing-unit) (D15), set independently of the
      other two gaps for the reason D6 gives about those two.
    status: resolved

cross_spec_consistency:
  - convention: "inert component keeps the wide React.HTMLAttributes rest type"
    checked_against: badge.md, governance §6.2
    status: consistent
  - convention: "rest props spread first, component's own attributes after"
    checked_against: badge.md, governance §6.1
    status: consistent
  - convention: "className merged through cn() from src/lib/utils.ts"
    checked_against: badge.md, governance §14.5
    status: consistent
  - convention: "contrast measured from built tokens and tabled in the spec"
    checked_against: badge.md
    status: consistent
  - convention: "empty or whitespace-only text content is treated as absent"
    checked_against: badge.md
    status: consistent
  - convention: "no machine-readable contract: block"
    checked_against: badge.md, component-spec-writer §8d
    status: consistent
  - convention: "text content neither wraps nor truncates"
    checked_against: badge.md
    status: divergent
    resolution: >
      This component's label truncates. CR-012 requires the label to yield space before the count
      or the indicator. badge.md's non-truncation rule follows from its Tag boundary and does not
      transfer to a fixed-height chrome strip carrying arbitrary consumer prose. See c6.
  - convention: "sm/md as variant value names for a size axis"
    checked_against: badge.md
    status: divergent
    resolution: >
      This component has no size axis at all (D7, D8), so there are no value names to be
      consistent about. Recorded rather than omitted, because 'no axis' and 'an axis named
      differently' are different findings and only one of them is a naming divergence.
  - convention: "a status-like component exposes no role and no accessible name"
    checked_against: badge.md
    status: consistent

open_questions: []
  # OD-003 (motion) was carried here from the brief as a non-blocking open decision and is
  # RESOLVED in D10 rather than left open: the repository's token layer cannot express an
  # animation, so the answer is forced. The two escalations below replace it.

freeze_blockers: []
  # All three resolved 2026-09-01. Kept in prose under "Decisions taken at the freeze" with the
  # options each chose between, rather than deleted:
  #   FB-1 / OD-001 — governance §15 Requires-Review, both grounds (new component; new component
  #     boundary overlap). GRANTED, option 1, by this repository's Governance Owner. The boundary
  #     stands recorded in the abstract, to be filled in when a neighbour ships. The source
  #     system's 2026-08-31 approval remains non-transferable — that objection was about whose
  #     approval it was, never about whether one existed.
  #   FB-2 / OD-002 — partial fill. DECLINED; CR-007 stands as written, option A, three solid
  #     tones. Accepted cost, recorded and not softened: the state distinction rests on adjacent
  #     tones at 2.67:1 rather than extent at 7.55:1, and degrades at roughly 25px segments.
  #   FB-3 — the brief's promotion. Resolved by fact: verified on its own branch to read
  #     status: ready-for-spec-authoring with OD-001 and OD-002 both marked Resolved, 2026-09-01.

  # No `decision_log:` key is added here, and the omission is deliberate. `component-spec-writer`
  # §9 fixes this block's structure; a new sibling key is an invented field with no schema behind
  # it and no consumer, which is the same objection D11 makes to writing a `contract:` block this
  # repository has no schema document for. The decisions live in prose, where a reviewer reads
  # them, and in the comment above, where a grep finds them.

escalations:
  - target: ds-governance
    reason: needs-new-rule
    blocking: false
    detail: >
      src/styles.css neutralises Tailwind's built-in colour palette with `--color-*: initial`, but
      not its motion namespaces. `duration-150` and `ease-out` compile and resolve to values
      byte-identical to --ds-motion-duration-normal and --ds-motion-easing-ease-out, so a design
      value can bypass the token layer and still render correctly. src/tailwind-surface.test.ts
      asserts nothing about it. Additionally: Tailwind 4 scans tracked Markdown, so THIS SPEC FILE
      emits .transition-all, .duration-150 and .ease-out into the compiled stylesheet purely by
      naming them in the paragraph that forbids them — verified by compiling with the spec as the
      only source. Nothing renders wrong, but a guard that greps build output for motion utilities
      would be defeated by the document forbidding them. Such a guard must scan component source.
  - target: ds-governance
    reason: needs-new-token
    blocking: false
    detail: >
      The ten --ds-motion-* properties in generated/tokens.css are not emitted into
      generated/tailwind-theme.css, so no component can bind motion through a token. This is an
      emission gap, not a missing value; it blocks OD-003 being answered 'yes' by any component.
  - target: ds-governance
    reason: needs-new-token
    blocking: false
    detail: >
      The resting grey surface ramp has no step between relative luminance 0.172
      (surface-accent-grey-bold) and 0.578 (surface-neutral-boldest), so a three-tone indicator
      cannot clear 3:1 on both adjacent pairs. Measured: 2.67:1 and 2.83:1. Only -hovered and
      -pressed tokens fall in the gap and their leaf names describe the wrong role.
  - target: ds-governance
    reason: rule-conflict
    blocking: false
    detail: >
      fg-subtlest on surface-page measures 4.49:1, below the AA floor, and appears in neither
      PAIRS nor KNOWN_BELOW_AA in src/tokens.test.ts. It should be recorded in KNOWN_BELOW_AA so
      that raising it later is a deliberate change rather than an assumed oversight.
  - target: ds-governance
    reason: rule-conflict
    blocking: false
    detail: >
      ds-kit.config.yml sets a11y.measure_contrast_relative_to_shipped: true, whose premise is a
      shipped baseline. Zero components are built, so every contrast finding in this spec lands
      absolutely with nothing to be graded against. The flag is unusable until something ships.
```
