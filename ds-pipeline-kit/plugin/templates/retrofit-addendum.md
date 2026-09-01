---
component: <component>
type: retrofit-migration-addendum
---

# <Component> — Retrofit Migration Addendum

The decision document for a **mechanical, visual-system change to a component that already
exists and has no spec**. It is not a spec and never becomes one; it is narrower on purpose.

**Do not use this if the change touches props, variants, defaults, interaction, keyboard
behaviour, the accessibility contract, structure, or what the appearance communicates.** Any of
those is a contract change and needs a real spec. If you discover one mid-retrofit, stop and
write the spec — do not widen this document to cover it.

All ten sections are required.

## 1. Component and purpose
## 2. Current value and how it is set
<The value on the base branch today, and the mechanism — a utility class, a variant, an inline
style, a token reference.>
## 3. Target token or utility
<Exactly as it appears in the generated token output.>
## 4. Before and after
```
- <old source fragment>
+ <new source fragment>
```
## 5. Does the rendered value change?
<Yes or no, explicitly. A swap that resolves to identical pixels is a different review from one
that shifts the rendering.>
## 6. Affected variants and states
<Every one the change reaches — including states not visible in the default story.>
## 7. Public API, behaviour and accessibility are unchanged
<An explicit declaration, not an omission.>
## 8. Visual acceptance criteria
## 9. Stories used for verification
<By name.>
## 10. Non-goals
