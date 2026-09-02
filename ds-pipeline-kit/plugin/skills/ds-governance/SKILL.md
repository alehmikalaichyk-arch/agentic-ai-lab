---
name: ds-governance
description: >
  Governance rules for the design system: token architecture (strict
  primitive → semantic → component chain), naming conventions, contribution
  flow, component API conventions, boundaries, accessibility floor, API
  stability and deprecation rules, and a severity-classified list of
  forbidden patterns. Produces a normalized Governance Rule Set consumed by
  every downstream DS skill. Hard preflight: read ds-context (#1)
  first. Read-only.
tools: Read, Glob, Grep
---

# DS — Governance

The **rules layer** of the design system. Where `ds-context` (#1)
describes what exists, this skill defines what is allowed and how the DS
should grow. It produces a single normalized output — the **Governance Rule
Set** — that downstream skills (#3–#10) consume as their source of governance
decisions.

This skill is read-only. It never modifies the repo, never checks or enforces
rules (that is the job of `token-guardian` #3 and `production-quality-gate`
#8), never invents a rule not stated here or extracted from the repo.

---

## 1. Read context first — hard gate

Before applying any rule in this skill, the Context Snapshot from
`ds-context` (#1) must have been produced in the current session. If it
has not, stop and run #1 first. Governance rules assume the current state of
the repository is known.

---

## 2. Governance philosophy

Governance rules are derived from current repository practice **where the
practice is consistent and healthy**. When current practice conflicts with
the intended token architecture or component model, document the current
state as tech debt and define the target rule clearly. Do not blindly codify
bad patterns just because they exist.

---

## 3. Token architecture — strict chain

Direction: `primitive → semantic → component`.

**Reference rule:** a token may only reference tokens to its left.

- Semantic tokens may reference **primitive tokens only**.
- Component tokens may reference **semantic tokens only**.
- Component → primitive (skipping semantic) is forbidden.
- Semantic → semantic is forbidden.

Layer roles:

- **Primitive** — raw value (HEX, px, ms). Lives in `tokens/color/primitives.json`, `tokens/spacing/`, `tokens/typography/`, etc. Added rarely; extending the palette or scale is an explicit governance decision.
- **Semantic** — role-bound value (e.g. `fg.default`, `surface.brand-bold`, `outline.input-focused`). References primitive only via DTCG `{primitive-name}` syntax. Name describes *where used*, not *how it looks*.
- **Component** — component-bound value (e.g. `chip.max-width.md`). References semantic only. Defines part of a component's stable public API.

**Current state (tech debt to resolve):**

- The component-token layer currently exists only in `tokens/chip.json` and uses raw dimension values rather than semantic references. New component tokens must reference semantic tokens; the chip case is documented technical debt and is expected to be refactored, not used as precedent.

---

## 4. Token naming conventions

Conventions extracted from `tokens/color/primitives.json`, `tokens/color/semantic.json`, and `sd.config.mjs`.

**Format**

- DTCG. Every token has `$value` and `$type`. Semantic tokens require `$description`.
- File format: JSON files under `tokens/<category>/`. Recommended split: `primitives.json` and `semantic.json` per category.

**Primitive naming**

- Pattern: `<family>-<step>`, lowercase, dash separator.
- Step scale: `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`.
- Color families currently in use: `white`, `black`, `brand`, `neutral`, plus the city-coded accent palettes `oslo`, `dragon`, `osaka`, `norway`, `paris`, `tokio`, `dubai`. Adding a new family is a Requires-Review decision (§15).

**Semantic naming**

- Structure: nested in JSON by **group**, with the leaf name describing the role.
- Top-level groups for color: `fg` (text and icon), `surface` (backgrounds), `outline` (borders, rings, dividers). Other categories (`typography`, `spacing`, etc.) define their own groups.
- Within a group, the leaf name uses dash-separated suffixes for modifiers and states. Suffix vocabulary (extracted from current usage):
  - **Strength/tint:** `-subtle`, `-subtlest`, `-bold`
  - **Inversion:** `-inverse`
  - **Interaction state:** `-hovered`, `-pressed`, `-focused`, `-disabled`
  - **Categorical accents:** `accent-red`, `accent-orange`, `accent-amber`, `accent-green`, `accent-teal`, `accent-blue`, `accent-indigo`, `accent-purple`, `accent-grey`
  - **Status:** `status-danger`, `status-success`, `status-warning`, `status-info` — combinable with strength and interaction suffixes (e.g. `status-danger-bold-hovered`).
- Composition order, when multiple modifiers apply: `role-strength-interaction` (e.g. `surface.brand-bold-hovered`, not `surface.brand-hovered-bold`).
- Lowercase throughout.
- The leaf name describes the role, not the look. `fg.subtle` (correct) vs `fg.grey` (forbidden — describes appearance).

**Reference syntax**

- DTCG curly braces: `{token-name}`. The reference uses the **primitive** name (e.g. `{brand-700}`).
- Direct cross-group references inside semantic (e.g. `fg.brand` → `surface.brand`) are forbidden.

**Generated output namespaces**

- CSS variables: `--ds-<path-joined-by-dashes>` (e.g. `--ds-fg-default`, `--ds-surface-brand-bold`). Produced by Style Dictionary in `generated/tokens.css`.
- Tailwind `@theme` exposure: `--color-<path>` for `fg`, `surface`, `outline` groups only. Produced in `generated/tailwind-theme.css`. Other semantic groups are consumed via the TypeScript export `generated/tokens.ts`, not via Tailwind utilities.
- TypeScript export key: dot-joined path (e.g. `"fg.default"`, `"surface.brand-bold"`).

---

## 5. Component naming and location

- **File names**: kebab-case (`button.tsx`, `multiselect.tsx`, `segmented-control.tsx`, `accordion-card.tsx`).
- **Location**:
  - `src/components/ui/` — shadcn-level atoms.
  - `src/components/<name>/` — composite components (e.g. `breadcrumbs/`, `drawer/`).
  - Top-level shell components live directly in `src/components/` (`global-header.tsx`, `page-shell.tsx`).
- **Colocation**:
  - Tests: `<name>.test.tsx` next to the component.
  - Snapshots: `__snapshots__/` directory next to the test file.
- **Exports**: PascalCase component name corresponding to the file (e.g. `button.tsx` → `Button`).

---

## 6. Component API conventions

- **Controlled/uncontrolled**: mandatory for all stateful components. Components must support both `value` (controlled) and `defaultValue` (uncontrolled) patterns, mirroring the Radix convention.
- **Ref forwarding**: mandatory for components that map to a DOM element or wrap a Radix primitive. Use `React.forwardRef`.
- **`asChild` pattern**: required where the component should be polymorphic over its rendered element. Follows the Radix `asChild` semantics.
- **`className` prop**: always accepted; merged via the `cn()` helper in `src/lib/utils.ts`.
- **No custom CSS files**: styling is Tailwind utilities composed via `cn()`. See §14 for the full prohibition.
- **Rest-prop spread ordering**: a component that spreads `...rest` onto its rendered element spreads it **first**, and writes its own attributes after. See §6.1.
- **Inert components keep the wide DOM-attribute type**: inertness is a property of what the component *provides*, not a prohibition on the consumer. See §6.2.

---

## 6.1 Rest-prop spread ordering — owned attributes win

A component that forwards rest props spreads them **before** the attributes it sets itself:

```tsx
<div {...props} ref={ref} data-slot="…" className={cn(variants({ … }), className)} />
```

A spread placed **last** lets a caller overwrite what the component owns, and the damage is not
cosmetic: an identity attribute such as `data-slot` is how a contract harness, a spec-drift check
and every `[data-slot=…]` query find the element, and a mirrored `data-*` is how such a harness
observes a variant axis. A caller passing either takes it over silently.

TypeScript refuses some of it, and **a type is not a runtime barrier** — plain JS, a cast, an
`any`-typed prop bag, or a wrapper re-spreading DOM props all reach the same place. Ordering is
the barrier.

`className` is exempt by construction: it is destructured out and merged through `cn()`, which
is what makes it a styling hook rather than a replacement.

Found by an automated reviewer on one component and re-found on the next. Where a component's
header documents the consequences in a table, keep that table with the component — this section
carries the rule, not the worked example.

---

## 6.2 Inert components — what inertness does and does not promise

Some components are specified as inert: nothing focusable, nothing clickable, no interactive
state, and no prop that enables interaction later. Dividers, progress bars, badges, status
indicators and steppers are the usual members of that set.

**They keep the wide `React.HTMLAttributes<T>` rest type.** They do not `Omit` `tabIndex`,
`role`, or event handlers, and they do not strip them at the output layer.

The contract is stated precisely, because the two readings differ:

| The contract says | The contract does not say |
|---|---|
| the component provides no interactive behaviour | that a consumer cannot attach DOM behaviour to it |
| the component exposes no API for enabling interaction | that the rendered element can never be made interactive |

Inertness is a property of **what the component provides**, not a prohibition on the consumer.
A guarantee is not available at any price: a consumer can wrap the component in a `<button>` or
attach a listener by `ref`, and neither is reachable from inside it. A guard that closed the
typed path while leaving those two open would describe as a guarantee what is really a default —
which is worse than the default stated plainly.

Two safeguards are considered sufficient, and no third is required:

1. the §6.1 spread ordering, so the component's own attributes cannot be taken over;
2. a development-only warning when a caller passes `tabIndex`, `role`, or an activation handler
   — `NODE_ENV`-gated, once per mount, naming the prop and the value received. Precedent: a
   progress bar that already warns about incorrect *use* (a missing accessible name), not only
   about invalid input.

The accessibility contract items an inert component's spec declares — "not focusable", "carries
no `tabindex`", "exposes no role" — are assertions about **what the component renders**, checked
by the contract harness at `when: {}`. They are not claims about what a consumer can add.

The rejected alternative was narrowing the rest type across every inert component at once: that
is a breaking change to several public types under §8, it buys a partial guarantee, and it
contradicts the precedent of resolving the adjacent problem with ordering alone (§6.1). Record
the decision, its date and its owner where your governance decisions live.

---

## 7. Component Creation Decision Tree

Before creating a new component, walk through these steps in order:

1. Does an **existing component** already cover the use case?
2. Can the use case be handled by an **existing variant or prop**?
3. Can the solution be a **composition of existing primitives**?
4. Does the use case introduce a **reusable pattern with a stable API**?
5. Only if step 4 is yes — create a new component.

Do not create a new component for a screen-specific layout or a one-off
visual treatment. A new component is a Requires-Review item (§15).

---

## 8. API stability

Public component props are part of the DS contract.

- Prefer additive changes over breaking changes.
- Do not rename, remove, or change the behavior of existing public props without a documented migration note.
- Breaking changes require explicit approval from the Governance Owner (§17), recorded in the PR.

**Breaking changes include:**

- Removing public props.
- Renaming public props.
- Changing the default behavior of an existing prop.
- Removing exported symbols (components, types, helpers).
- Changing emitted events or callback signatures.
- Changing the shape of a public type or interface.

---

## 9. Deprecation rule

When replacing a component, prop, variant, or token:

- Keep the old API temporarily when possible.
- Mark it deprecated with a clear marker (`@deprecated` JSDoc, deprecated token alias).
- Document the replacement.
- Do not introduce silent behavior changes.
- Remove only after migration is complete.

---

## 10. Accessibility as part of the contract

Interactive DS components must define, **at spec time**:

- Keyboard behavior (focus order, shortcuts).
- Focus behavior (visible focus ring; focus traps where applicable).
- Disabled and read-only behavior.
- ARIA roles and required attributes.
- Minimum target size: ≥ 24×24 px (WCAG 2.5.8, level AA).

These fields are required before code is written. Detailed audit is
`a11y-interaction-review` (#7); governance enforces only that the fields
exist in the spec — and supplies the **severity** #7 looks up for a failing
requirement, which is §15.2. The WCAG floor is level **AA**.

---

## 11. Contribution flow

**Token contribution**

1. Token added to the correct layer (`tokens/<category>/primitives.json` or `semantic.json`).
2. Style Dictionary regenerated: `npm run build:tokens` produces updated `generated/tokens.css`, `generated/tokens.ts`, `generated/tailwind-theme.css`.
3. If a semantic token changed, the `generated/figma-*.json` artifacts are regenerated (see §13).
4. Smoke build passes locally.

**Component contribution**

1. Spec via `component-spec-writer` (#4).
2. Code via `component-implementation` (#5).
3. Stories via `storybook-stories-generator` (#6).
4. Tests colocated (`*.test.tsx`).
5. Accessibility review via `a11y-interaction-review` (#7).
6. Production quality gate via `production-quality-gate` (#8).

**Current CI gating** (from `.github/workflows/ci.yml`)

The CI runs on every `pull_request` and on `push` to `main`:

- `npm ci`
- `npm test` (Vitest unit tests)
- `npm run typecheck`
- `npm run test:e2e` (Playwright, parallel job)

**Target CI gating** (gaps to close — Requires-Review additions):

- Lint check.
- Storybook build verification.
- Token regeneration check (no-diff if the PR doesn't touch tokens; expected-diff if it does).
- Accessibility check integration.

Until these gates exist in CI, they are enforced by `production-quality-gate`
(#8) at the agent level.

---

## 12. Component boundaries

Each pair below is an **API contract**, not a UX guideline. Two components in
a pair must not do each other's work.

- **Select vs Multiselect** — single value vs multi value. A Select with a checkbox per row is wrong; it should be a Multiselect.
- **Select vs SegmentedControl** — overflow-tolerant (popover, long lists) vs always-visible (≤ 5 options, fixed-width).
- **Modal vs Drawer** — short confirmation or focused decision vs long multi-step flow.
- **Tabs vs SegmentedControl** — navigation (switches page-level content) vs filter (changes a query inside the same view).
- **Status vs Badge** — workflow state (`Active`, `Pending`, `Rejected`), rendered with the **accent** token family (`surface.accent-*`, `fg.accent-*`, `outline.accent-*`), vs categorical label, rendered with the **status** / brand / neutral **bold** families (`surface.status-*-bold`, `surface.brand-bold`, `surface.neutral-bold`). The token families are counter-intuitive relative to the component names — verify against `status.tsx` and `badge.tsx`, not against the names.
- **Chip vs Status vs Badge** — a three-way boundary, not a pair. `Chip` owns **interactive** compact labels: `choice` (toggle, `aria-pressed`), `filter`, `input` (removable value), and `link`, plus `selected`, `removable`, `count`, and `avatar`. `Status` and `Badge` remain the owners of their existing non-interactive use cases and are not deprecated. `Chip` additionally carries `display` and `status` roles for **new** work, so the overlap with `Badge` and `Status` is deliberate and is **not** a migration trigger: existing consumers stay on `Status` / `Badge`. Whether the overlap ever collapses is a separate Governance Owner decision .

**Boundary escalation rule.** If a requested feature makes a component
behave like another component in its pair, do not implement it directly.
Escalate to the Governance Owner (§17): does the feature belong in another
component, in a shared primitive, or in a new component?

For full UX-level "when to pick which on a screen", refer to the
`ux-designer` skill — that is product-layer guidance, not DS-layer.

---

## 13. Figma sync rules

- A change to a **semantic-layer** token must regenerate the `generated/figma-*.json` artifacts.
- **Component-token-only changes do not trigger** mandatory `figma-*.json` regeneration unless the generated outputs actually change.
- Primitive changes regenerate downstream as part of normal Style Dictionary builds; whether they emit Figma artifacts depends on whether any semantic token resolves through the changed primitive.

**Nothing in this kit enforces the above.** No skill here reads the design tool, so
these rules are stated and checked by humans in review only. Treat them as convention,
not as a gate, until you build an enforcer. This
skill only states the rules exist.

---

## 14. Forbidden patterns

Absolute don'ts. Severity classification in §15; canonical `rule_id`s in §15.1.

1. **Raw hex in component code.** All colors come from tokens (Tailwind utilities or CSS variables). — `forbidden.raw-hex`
2. **Inline styles for design values** (color, spacing, typography, radius, shadow, layout sizing). Inline `style={...}` is allowed only for **runtime-computed values that originate outside the component itself** — measured popover dimensions, ref-derived coordinates, animation runtime values, Radix-provided CSS variables. Wrapping a hex in a CSS variable inside the component does not count as runtime-computed. — `forbidden.inline-style-design-value`
3. **Semantic-token → semantic-token references.** Semantic must reference primitive directly. — `arch.semantic-to-semantic-ref`
4. **Component-token → primitive references.** Component must go through semantic. — `arch.component-to-primitive-ref`
5. **Bypassing the `cn()` helper.** All class composition goes through `cn()` from `src/lib/utils.ts`. — `forbidden.cn-bypass`
6. **Tailwind arbitrary values for design-system values** (`w-[247px]`, `bg-[#fff]`, `text-[14px]`, `border-[#e0e0e0]`). If a value needs a class, it needs a token. — `forbidden.tailwind-arbitrary-design-value`
7. **CSS-in-JS, styled-components, `<style>` blocks** inside the DS package. Tailwind 4 via `cn()` is the only styling channel. — `forbidden.css-in-js`
8. **Hardcoded breakpoints in component code.** No raw `@media` queries; no arbitrary breakpoint values. Use Tailwind 4 responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`). — `forbidden.hardcoded-breakpoint`

Items 3 and 4 are the token-architecture chain of §3 seen from the forbidden-pattern
side, which is why their ids carry the `arch.` prefix rather than `forbidden.`. Their
code-side twin — a component reading a primitive through `var(--ds-…)` — is
`code.layer-bypass-via-css-var` (§15.1), a rule of §3 rather than an item in this list.

---

## 15. Violation severity

Three tiers — agents must know what blocks merge immediately versus what
needs escalation.

**Blocker** — must be fixed before merge.
- All forbidden patterns from §14 (items 1–8).
- *Caught by:* `token-guardian` (#3) and `production-quality-gate` (#8).

**Requires Review** — allowed only with explicit justification recorded in the PR.
- New runtime UI dependency (component lib, icon set, animation lib).
- New primitive token scale (e.g. adding a new color family).
- New semantic token with only one known call site.
- New component boundary overlap (per §12 escalation rule).
- New component (per Decision Tree §7).
- Component token introduced for a single component or variant — PR must explain why the value belongs to the component-token layer rather than using an existing semantic token directly.
- *Reviewed by:* the Governance Owner (§17, `governance_owner` field in the Rule Set).

**Warning** — should be corrected unless there is a documented reason.
- Minor naming drift from the conventions in §4–§5.
- Missing docs for a new boundary.
- Incomplete contribution checklist.
- *Surfaced to:* the PR author.

Note: severity tiers here apply to **rule violations**. Severity tiers in
`ds-context` (#1) §9 apply to **repository health**. Different axes;
do not conflate.

---

## 15.1 Canonical rule identifiers

Every rule Governance defines carries a stable `rule_id`. Governance owns the id;
`token-guardian` (#3) references it and never declares one (#3 §2, §13).

**Why this section exists.** Guardian §3 reconciles its Detection Registry against the
Rule Set *by id*: a detection whose `rule_id` has no match in the Rule Set is **skipped**
and listed in `unchecked_rules` with `reason: missing-rule-id`. Before this section, the
Rule Set carried no ids at all, so every detection was strictly skippable while the report
still read as a clean pass — a green with less checked than it appeared. The ids below are
the ones already in use in #3 §7 and in issued Violation Reports; none is new, and nothing
is renamed.

**Severity travels with the id.** A rule listed without a severity is a data error in this
skill: #3 §10 suppresses the finding and records `reason: missing-severity-in-rule-set`.
Never publish an id without one.

| `rule_id` | Category | Defined in | Severity |
|---|---|---|---|
| `arch.semantic-to-semantic-ref` | tokens | §3 chain rule, §14.3 | blocker |
| `arch.component-to-primitive-ref` | tokens | §3 chain rule, §14.4 | blocker |
| `arch.invalid-ref-syntax` | tokens | §4 Reference syntax | blocker |
| `arch.ref-target-missing` | tokens | §4 Reference syntax — the target must exist | blocker |
| `naming.casing-violation` | tokens | §4 "lowercase throughout" | warning |
| `naming.separator-violation` | tokens | §4 dash separator | warning |
| `naming.unknown-color-family` | tokens | §4 color families | requires-review |
| `naming.invalid-step-scale` | tokens | §4 primitive step scale | warning |
| `naming.suffix-out-of-vocabulary` | tokens | §4 suffix vocabulary | warning |
| `naming.composition-order-violation` | tokens | §4 composition order | warning |
| `dtcg.missing-type` | tokens | §4 Format — every token has `$value` and `$type` | blocker |
| `dtcg.missing-description-semantic` | tokens | §4 Format — semantic tokens require `$description` | warning |
| `forbidden.raw-hex` | code | §14.1 | blocker |
| `forbidden.inline-style-design-value` | code | §14.2 | blocker |
| `forbidden.cn-bypass` | code | §14.5 | blocker |
| `forbidden.tailwind-arbitrary-design-value` | code | §14.6 | blocker |
| `forbidden.css-in-js` | code | §14.7 | blocker |
| `forbidden.hardcoded-breakpoint` | code | §14.8 | blocker |
| `code.layer-bypass-via-css-var` | code | §3 chain rule, code side | blocker |

**Where a severity is not simply "§15 blocker because §14 lists it", the grounding is:**

- `arch.invalid-ref-syntax`, `arch.ref-target-missing` — **blocker**: a reference that does
  not parse or does not resolve fails `npm run build:tokens`, so nothing downstream of the
  token build is trustworthy. It is a red build, not a matter of taste.
- `dtcg.missing-type` — **blocker**: §4 states the format unconditionally, and Style
  Dictionary selects its transform from `$type`. A token without one silently changes the
  generated output rather than failing.
- `dtcg.missing-description-semantic` — **warning**: it costs documentation, not generated
  output. §15's warning tier already covers missing docs.
- `naming.*` — **warning**, per §15's "minor naming drift from the conventions in §4–§5",
  except `naming.unknown-color-family`, which is **requires-review** because §4 states in
  terms that adding a colour family is a Requires-Review decision.
- `code.layer-bypass-via-css-var` — **blocker**: it is §3's chain rule violated from
  component source instead of from a token file, and §14.2 already refuses the
  CSS-variable wrapper as a way around the same rule. Same offence, same tier.

Guardian's own registry (#3 §7) carries `category`, `method` and `capability` for these
ids. Those columns are Guardian's; the id and the severity are this skill's.

---

## 15.2 Accessibility finding severity

`a11y-interaction-review` (#7) looks up severity per requirement and never assigns one
(#7 §7); with nothing to look up it suppresses the finding into
`uncheckable_requirements` with `reason: missing-severity-in-floor`. §15's three tiers are
scoped to **rule** violations, so they did not answer for an a11y finding. This section
does, and it does so with a derivation rule rather than a per-requirement opinion:

| Requirement's source | Severity | Grounding |
|---|---|---|
| A WCAG 2.2 success criterion at level **A or AA** | blocker | §10 makes WCAG AA the floor. Below the floor is not shippable. |
| Spec accessibility contract only — including APG pattern behaviour with no A/AA criterion behind it | requires-review | It contradicts the component's own contract, which the Governance Owner (§17) adjudicates against the spec rather than against an external standard. |
| A WCAG criterion at level **AAA** | warning | Above the declared floor; desirable, not owed. |

Applied to #7's audit registry as it stands, that yields:

- **blocker** — `aria.role-correct` and `aria.accessible-name-present` (4.1.2),
  `keyboard.tab-order` (2.1.1), `focus.visible-ring` (2.4.7), `contrast.text-aa` (1.4.3),
  `motion.reduced-motion-respected` (2.3.3), `target.size-44` (2.5.8).

**`target.size-44` enforces 24×24 px, not 44×44 — the id's suffix is historical.** Corrected
2026-09-02 under §18. The rule always cited **WCAG 2.5.8**, which is the AA criterion and specifies
**24×24 px**; the 44×44 figure §10 carried is **WCAG 2.5.5**, level **AAA** — stricter than the AA
floor §10 declares in the same section. The threshold in §10 is now 24×24 and the citation is
unchanged, because the citation was never the thing that was wrong.

The `rule_id` is deliberately **not** renamed. It is an opaque key that
`a11y-interaction-review` (#7) reconciles its registry against by exact string, and a rename is a
coordinated edit across two skills — a silently skipped check (`reason: missing-rule-id`) is the
failure it would risk, which is the same class of silent under-reporting §15.1 exists to prevent.
Read the suffix as a name, not as a number. If you do rename it, change #7's registry in the same
commit.

Found by the Input brief's feasibility audit: three of the four shared control heights (30, 34,
40 px) failed the old floor, including the default, which would have made the design system's own
height scale unusable by the components it was written for.
- **requires-review** — `aria.name-includes-counter`, `aria.state-reflects-ui`,
  `keyboard.arrow-roving`, `keyboard.activation-keys`, `keyboard.escape-dismiss`,
  `focus.trap-in-overlay`, `focus.return-on-close`, `live.busy-announced`,
  `live.status-role-by-severity`, `rtl.direction-correct`, `sr.flow-coherent`.

The list is the current instance; **the derivation rule is the rule**. #7 owns its
registry and may add a requirement without a governance change — a requirement not named
above takes the severity its source implies, and `requires-review` is the default where no
A/AA criterion backs it. No finding is ever suppressed for want of a severity again.

**A `manual-required` check is not exempt.** Its capability governs *who* verifies it, not
what a failure costs; a confirmed failure carries the severity above.

**Deliberately NOT settled here: the WCAG applicability matrix keyed by archetype**
(#7 §3, #7 §15). That is a policy decision per archetype — six archetypes across the
registry — and #7 already fails safe without it: a missing applicability entry is treated
as `required` with the gap noted, so the cost is false findings a human dismisses, not
findings that vanish. The severity gap had the opposite shape, which is why it is closed
here and the matrix is not. Route the matrix through §18 with the Governance Owner.

---

## 16. Governance Rule Set Contract

The skill produces a single output — the Rule Set — with the following fixed
structure. Downstream skills consume it; if a section is missing, the rule
set is incomplete and must be re-collected. Downstream skills must not
invent additional fields.

```yaml
rule_set:
  schema_version: 1
  generated_at: <ISO 8601 timestamp>
  generator: ds-governance

governance_owner:
  role: Design System Maintainer

token_architecture:
  direction: primitive → semantic → component
  reference_rule: a token may only reference tokens to its left
  layer_roles:
    primitive: raw value, lives in tokens/<category>/primitives.json
    semantic: role-bound, references primitive only via DTCG syntax
    component: component-bound, references semantic only
  current_state_tech_debt:
    - tokens/chip.json uses raw dimension values instead of semantic refs

token_naming_conventions:
  format: DTCG ($value, $type, $description)
  primitive_pattern: <family>-<step>, lowercase, dash separator
  primitive_step_scale: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
  color_families: [white, black, brand, neutral, oslo, dragon, osaka, norway, paris, tokio, dubai]
  semantic_structure: nested by group; leaf describes role, not look
  semantic_groups_color: [fg, surface, outline]
  modifier_suffixes: [subtle, subtlest, bold, inverse, hovered, pressed, focused, disabled]
  composition_order: role-strength-interaction
  reference_syntax: DTCG curly braces, primitive name only
  css_namespace: --ds-<path>
  tailwind_namespace: --color-<path> (fg, surface, outline only)
  ts_export_key: dot-joined path

component_naming_conventions:
  file: kebab-case
  export: PascalCase
  test: <name>.test.tsx colocated
  snapshots: __snapshots__/ subdirectory

component_location_rules:
  ui_atoms: src/components/ui/
  composite: src/components/<name>/
  shell: src/components/

component_api_conventions:
  controlled_uncontrolled: mandatory_for_stateful
  ref_forwarding: mandatory_for_dom_likes
  as_child: where_applicable
  className: always_accepted_via_cn
  rest_spread_ordering: rest_first_owned_attributes_after   # §6.1
  inert_components:                                          # §6.2
    rest_type: wide_html_attributes          # no Omit of tabIndex / role / handlers
    promise: no_interactive_behaviour_provided
    not_a_promise: consumer_cannot_attach_dom_behaviour
    safeguards: [spread_ordering, dev_only_warning]

component_creation_decision_tree: 5-step (see §7)

api_stability:
  preferred: additive
  breaking_changes:
    approval_required_from: governance_owner
    categories:
      - remove_public_prop
      - rename_public_prop
      - change_default_behavior
      - remove_exported_symbol
      - change_emitted_event
      - change_public_type_shape

deprecation_rule: 5-step (see §9)

accessibility_floor:
  required_fields_at_spec_time: [keyboard, focus, disabled, aria, target_size]
  detailed_audit_owner: a11y-interaction-review (#7)
  wcag_level: AA                                   # §10
  finding_severity:                                # §15.2 — #7 looks these up, never assigns
    derivation:
      wcag_a_or_aa: blocker
      spec_contract_only: requires-review          # includes APG behaviour with no A/AA criterion
      wcag_aaa: warning
    default_when_unlisted: requires-review         # no requirement is ever suppressed for want of a severity
    by_requirement:                                # current instance of the derivation; #7 owns the registry
      aria.role-correct: blocker
      aria.accessible-name-present: blocker
      keyboard.tab-order: blocker
      focus.visible-ring: blocker
      contrast.text-aa: blocker
      motion.reduced-motion-respected: blocker
      target.size-44: blocker
      aria.name-includes-counter: requires-review
      aria.state-reflects-ui: requires-review
      keyboard.arrow-roving: requires-review
      keyboard.activation-keys: requires-review
      keyboard.escape-dismiss: requires-review
      focus.trap-in-overlay: requires-review
      focus.return-on-close: requires-review
      live.busy-announced: requires-review
      live.status-role-by-severity: requires-review
      rtl.direction-correct: requires-review
      sr.flow-coherent: requires-review
  wcag_applicability_matrix: not_defined           # §15.2 — open governance decision, NOT an omission to fill in silently

contribution_flow:
  tokens:
    - add_to_correct_layer
    - regenerate_style_dictionary
    - regenerate_figma_artifacts_if_semantic
    - smoke_build_passes
  components:
    - spec (#4)
    - code (#5)
    - stories (#6)
    - tests
    - a11y_review (#7)
    - quality_gate (#8)
  ci_current: [npm-ci, vitest, typecheck, playwright]
  ci_target_gaps: [lint, storybook-build, token-regen-check, a11y-integration]

component_boundary_rules:
  pairs:
    - select_vs_multiselect
    - select_vs_segmented_control
    - modal_vs_drawer
    - tabs_vs_segmented_control
    - status_vs_badge
    - chip_vs_status_vs_badge
  escalation_owner: governance_owner

figma_sync_rules:
  semantic_token_change: triggers_regeneration
  component_token_only_change: no_regeneration_unless_output_changes
  primitive_change: depends_on_downstream_semantic_resolution
  enforcement_owner: none  # no skill in this kit enforces this rule

forbidden_patterns:                      # §14, in order; rule_id in rules[] below
  - raw_hex_in_components                # forbidden.raw-hex
  - inline_style_for_design_values       # forbidden.inline-style-design-value
  - semantic_to_semantic_reference       # arch.semantic-to-semantic-ref
  - component_to_primitive_reference     # arch.component-to-primitive-ref
  - bypassing_cn_helper                  # forbidden.cn-bypass
  - tailwind_arbitrary_design_values     # forbidden.tailwind-arbitrary-design-value
  - css_in_js_inside_ds                  # forbidden.css-in-js
  - hardcoded_breakpoints                # forbidden.hardcoded-breakpoint

# The canonical rule index (§15.1). This is the block token-guardian (#3 §3) reconciles
# its Detection Registry against, by rule_id, and the block #3 §10 reads severity from.
# A rule absent here is skipped by #3 with reason: missing-rule-id; a rule present with
# no severity is suppressed with reason: missing-severity-in-rule-set. Both are silent
# under-checking that still reports as a pass, so neither is ever acceptable.
rules:
  - { rule_id: arch.semantic-to-semantic-ref,           category: tokens, severity: blocker,          defined_in: "§3, §14.3" }
  - { rule_id: arch.component-to-primitive-ref,         category: tokens, severity: blocker,          defined_in: "§3, §14.4" }
  - { rule_id: arch.invalid-ref-syntax,                 category: tokens, severity: blocker,          defined_in: "§4" }
  - { rule_id: arch.ref-target-missing,                 category: tokens, severity: blocker,          defined_in: "§4" }
  - { rule_id: naming.casing-violation,                 category: tokens, severity: warning,          defined_in: "§4" }
  - { rule_id: naming.separator-violation,              category: tokens, severity: warning,          defined_in: "§4" }
  - { rule_id: naming.unknown-color-family,             category: tokens, severity: requires-review,  defined_in: "§4, §15" }
  - { rule_id: naming.invalid-step-scale,               category: tokens, severity: warning,          defined_in: "§4" }
  - { rule_id: naming.suffix-out-of-vocabulary,         category: tokens, severity: warning,          defined_in: "§4" }
  - { rule_id: naming.composition-order-violation,      category: tokens, severity: warning,          defined_in: "§4" }
  - { rule_id: dtcg.missing-type,                       category: tokens, severity: blocker,          defined_in: "§4" }
  - { rule_id: dtcg.missing-description-semantic,       category: tokens, severity: warning,          defined_in: "§4" }
  - { rule_id: forbidden.raw-hex,                       category: code,   severity: blocker,          defined_in: "§14.1" }
  - { rule_id: forbidden.inline-style-design-value,     category: code,   severity: blocker,          defined_in: "§14.2" }
  - { rule_id: forbidden.cn-bypass,                     category: code,   severity: blocker,          defined_in: "§14.5" }
  - { rule_id: forbidden.tailwind-arbitrary-design-value, category: code, severity: blocker,          defined_in: "§14.6" }
  - { rule_id: forbidden.css-in-js,                     category: code,   severity: blocker,          defined_in: "§14.7" }
  - { rule_id: forbidden.hardcoded-breakpoint,          category: code,   severity: blocker,          defined_in: "§14.8" }
  - { rule_id: code.layer-bypass-via-css-var,           category: code,   severity: blocker,          defined_in: "§3" }

violation_severity:
  blocker:
    items: [all_forbidden_patterns]
    caught_by: [token-guardian, production-quality-gate]
  requires_review:
    items:
      - new_runtime_ui_dependency
      - new_primitive_token_scale
      - new_semantic_token_one_call_site
      - new_boundary_overlap
      - new_component
      - one_off_component_token
    reviewed_by: governance_owner
  warning:
    items: [naming_drift, missing_boundary_docs, incomplete_checklist]
    surfaced_to: pr_author

enforcement_ownership:
  rule_definition: ds-governance (this skill)
  rule_enforcement: [token-guardian (#3), production-quality-gate (#8)]
  escalation_authority: governance_owner
```

---

## 17. Governance Owner

A single role, named in the Rule Set's `governance_owner` field, holds:

- Final approval for breaking changes (§8).
- Review authority for Requires-Review-tier items (§15).
- Escalation authority for component boundary conflicts (§12).
- Authority to update this skill's rules (§18).

```yaml
governance_owner:
  role: Design System Maintainer
```

Use a **role** (not a personal name). Roles survive organizational changes.
Update this field if the team formalizes a different ownership structure.

---

## 18. Governance change procedure

Changes to the rules in this skill follow a fixed procedure to prevent
informal drift:

1. **Proposal** — describe the change, the rule being modified, and the motivation.
2. **Governance review** — by the Governance Owner (§17).
3. **Rule update** — edit this `SKILL.md`.
4. **Skill version bump** — increment `schema_version` in §16 if the Rule Set contract changes shape (additive field changes do not require a bump; structural or breaking changes do).
5. **Notification** — document the change in the PR description for downstream skill maintainers.

---

## 19. Never

- Never modify any repository file.
- Never check or enforce rules — that is `token-guardian` (#3) and `production-quality-gate` (#8).
- Never invent a rule not stated in this skill or extracted from the repo.
- Never reuse a rule set from a previous session — always re-collect.
- Never override the Context Snapshot from #1; if state and rules conflict, surface the conflict, do not pick a side.
- Never use a personal name in `governance_owner`; always a role.

---

## 20. What this skill does NOT cover

- Repository inventory and current state — see `ds-context` (#1).
- Token-rule violation detection — see `token-guardian` (#3).
- Component specifications — see `component-spec-writer` (#4).
- Implementation code — see `component-implementation` (#5).
- Stories — see `storybook-stories-generator` (#6).
- Accessibility detailed audit — see `a11y-interaction-review` (#7).
- Build, lint, test gates — see `production-quality-gate` (#8).
- Design-tool component creation and code↔design drift detection — not shipped in this kit,
  and not enforced by anything in it.
- UX-layer guidance ("when to pick Table vs Cards") — see `ux-designer` skill.
