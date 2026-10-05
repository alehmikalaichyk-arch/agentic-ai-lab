---
type: regex
pattern: '[^\n]{8,}\n[^\n]{8,}\n[^\n]{8,}'
target: last_message
arm: both
---

Positive check so a run that never started cannot pass the no-skill grader alone (an early in-session run scored 1.0 on an auth_failed run with zero turns): the reply has three consecutive non-trivial lines, i.e. a haiku. An earlier version matched the word "light" and failed a correct haiku that said "beam" instead; a word-match grader on a creative reply is not a control.
