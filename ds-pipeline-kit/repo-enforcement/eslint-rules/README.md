# Linter rules — EXAMPLES, not a supported part of the kit

**Replace these with your own linter's equivalents.** They are here to show what the mechanical
floor looks like, and to save you the work of deriving the edge cases. They are not a component
of the pipeline, nothing else in the kit depends on them, and every level works without them.

They target one stack: ESLint 8, TypeScript, Tailwind utility classes, and a token pipeline that
emits CSS custom properties. If any of that differs for you — Stylelint, a different linter,
CSS-in-JS, no utility classes — the rules do not transfer and should not be forced to.

## What they check

| Rule | Bans | Because |
|---|---|---|
| `ban-raw-hex-values` | Hex colour literals in component source, including inside JSX props and class-composition helpers | A palette change has to reach every component. A hex literal is the one place it cannot. |
| `ban-arbitrary-typography-values` | Arbitrary pixel typography (`text-[13px]`) where a token exists | Same reason, one axis over. An arbitrary value is a silent fork of the type scale. |
| `ban-primitive-typography-classes` | Primitive typography utilities in consumer code, forcing composite tokens | Size, weight and line-height decided independently drift apart; the composite token keeps them together. |

## Why a linter rule is worth having even though the token skill exists

They answer different questions and both are needed.

| | Linter rule | The token-guardian skill (#3) |
|---|---|---|
| Runs | In CI, on every pull request, without an agent | In an agent session |
| Catches | Mechanical, unambiguous patterns | Semantic misuse — a *valid* token used for the wrong role |
| Misses | A semantically wrong but syntactically clean token | Nothing, if it runs — but it only runs when invoked |

A component can pass the linter and still fail the skill: `text-fg-danger` for an amber
highlight is a real token, correctly formed, and wrong. The reverse also happens.

## The trap in writing these yourself

The rules here look simple and are not. The two that cost the most to get right:

- **A hex literal inside a class-composition helper** (`cn('text-[#04639A]', …)`) is not a
  string the naive AST visitor sees as a class name. It has to be matched inside call
  arguments and template literals too.
- **Legitimate arbitrary values exist.** Where a design scale has a step the utility framework
  has no class for, the arbitrary value is *correct*. The rules therefore need an escape —
  here a `no-token:` comment carrying a reason — or authors will disable the rule file-wide,
  and you will have traded a narrow gap for a total one.

If you write your own, port those two behaviours before anything else.

## Escape hatch

Both value rules accept an inline justification:

```tsx
className="fill-[#F28E2A]"  /* no-token: chart categorical 5; no semantic equivalent */
```

The comment is required, and the reason must name what is missing. An unexplained escape is
how the pattern comes back.
