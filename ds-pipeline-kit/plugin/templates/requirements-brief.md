---
component: <Component>
status: <draft | audited | accepted>
source: <where the ask came from — a message, an issue, a design file, a screenshot>
---

# <Component> — Requirements Brief

Behaviour in plain language. **No implementation.** No prop names, no token names, no component
names from the library. If a sentence could not be checked by someone watching the screen, it
belongs in the spec, not here.

Every requirement is numbered. The spec, the stories and the tests reference the number rather
than restating the requirement — that is what makes "is every requirement covered?" answerable.

## Problem and purpose
<What problem this solves. One paragraph.>

## Where it will be used
<Which surfaces, and by whom.>

## Strategy
<One of: new component · evolution of an existing component · composition of existing ones ·
solve inside a single feature and do not add a component.>

## Behavioural requirements
| # | Requirement | Priority |
|---|---|---|
| R1 | <observable behaviour> | must / should |

## States and transitions
<Resting, hover, focus, pressed, disabled, loading, error, empty — and the transitions between
them. Name only the ones this component has.>

## Interaction model
<Mouse, keyboard, touch, focus ownership.>

## Content
<Text, icons, attachments, wrapping, truncation.>

## Accessibility intent
<What the component IS to a screen reader, how it behaves from the keyboard, what is announced.
Decided here, not discovered during implementation — an accessibility decision that surfaces at
the end forces the spec to be re-approved.>

## Edge cases
<Very long text, no data, conflicting settings, waiting for a response.>

## Boundary with the feature
<What belongs to the component and what stays in the feature using it.>

## Acceptance criteria
| # | Criterion | Covers |
|---|---|---|
| AC1 | <checkable statement> | R1 |

## Non-goals
<What this deliberately does not do.>

## Feasibility audit
Filled in after checking the brief against the repository. Every mismatch is returned to the
owner **before** spec authoring starts, not after.

| # | Assumption in the ask | What the repository shows | Resolution |
|---|---|---|---|
| 1 | | | |
