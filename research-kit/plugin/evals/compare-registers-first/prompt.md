---
name: compare-registers-first
description: Checks the behaviour the skill exists for — criteria and predictions frozen before evidence, and losses kept in the table.
tags: [compare]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
expected_outcome: The plan registers criteria and predictions before gathering evidence, and keeps rows where the favoured option loses.
---

I already think Postgres full-text search beats OpenSearch for our product catalogue and I want a comparison doc to show the team. Outline the doc you would write and the steps, before doing any research. Under 300 words.
