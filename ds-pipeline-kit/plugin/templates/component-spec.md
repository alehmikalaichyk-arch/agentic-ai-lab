---
component: <Component>
spec_version: v1
spec_schema_version: 1
lifecycle: draft        # draft -> freeze_candidate. NEVER `frozen`: see below.
change_type: new_component        # | additive_revision | breaking_revision
archetype: <input-like | selection-like | overlay-like | navigation-like | data-display-like | status-like>
---

# <Component> Specification

> **`frozen` is a fact, not a field.** No agent and no person writes `lifecycle: frozen`. A spec
> is frozen by being merged to the main branch. `freeze_candidate` is a ceiling the spec must
> *earn* by passing every gate below — not a value assigned to satisfy an instruction.

## Purpose and boundary
<What this component owns, and — specifically — what neighbouring components own instead. A
boundary stated as a pair ("Chip vs Badge") is usually wrong; state it against every neighbour
it could be confused with.>

## Anatomy
<The parts, and which are optional.>

## Public API
| Prop | Type | Default | Required | Notes |
|---|---|---|---|---|

### Controlled / uncontrolled
<Which props are controllable, what the uncontrolled default is, and what happens when a
controlled value changes underneath. Under-specified here, this is invented at implementation
time and becomes a breaking change later.>

## Variants and sizes
| Variant | When to use |
|---|---|

## States
| State | Appearance | Behaviour |
|---|---|---|

## Tokens
| Element | Token | Role |
|---|---|---|

Reference tokens; never define them. A token that does not exist is a gap to escalate, not one
to invent.

## Accessibility contract
- Role / accessible name:
- Keyboard:
- Focus ownership:
- Announcements:

## Edge cases
| Category | Covered / not applicable | Behaviour |
|---|---|---|
| empty | | |
| loading | | |
| overflow | | |
| error | | |

## Acceptance criteria
| # | Criterion | Covers requirement |
|---|---|---|
| AC1 | | R1 |

## Consumers
<Every existing call site, each with verified status. Establish this by searching the repository
at spec time — including re-export barrels and applications that consume the package indirectly.
A "sole consumer" claim taken on trust is a recurring source of breaking changes: in the system
this kit came from, one spec claimed a single consumer and there were six.>

## Non-goals

---

## Freeze gates — all must be true before `freeze_candidate`

- [ ] anatomy complete
- [ ] API complete
- [ ] variants complete
- [ ] states complete
- [ ] controlled/uncontrolled contract complete
- [ ] accessibility complete
- [ ] token references complete
- [ ] edge cases complete
- [ ] boundary contract complete
- [ ] acceptance criteria complete

If any is false, the spec stays `draft` and PR-1 does not open. Advancing anyway turns the gate
into a formality — which is exactly what the field is read as evidence against.
