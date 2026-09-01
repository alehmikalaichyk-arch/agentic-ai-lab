#!/usr/bin/env bash
# =============================================================================
# check-claude-dir-in-sync.sh
# =============================================================================
# The pipeline exists twice in this repository, on purpose, and this keeps the two
# copies identical.
#
#   ds-pipeline-kit/    the portable kit, as it would be handed to anyone else
#   .claude/            the same skills and agent, where THIS repository's agent
#                       session actually reads them
#
# Why not one copy. The kit is designed to install as a plugin, and a plugin has to
# be installed: `claude plugin marketplace add` + `install`, per machine, per person.
# A `.claude/settings.json` pointing at the vendored directory does not resolve —
# measured, in all three path forms. So a fresh clone would have the pipeline on
# disk and none of it in effect, which is the worst of both: it reads as deployed
# and behaves as absent. Copying makes it work on clone with no setup step.
#
# Why not a symlink. Untested against the harness, and a demonstration is the wrong
# place to find out. Two real files and this check is the boring option.
#
# The failure this prevents: editing one copy. The skills are the process, so two
# processes that disagree is worse than one that is merely out of date.
# =============================================================================
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

KIT_SKILLS="ds-pipeline-kit/plugin/skills"
KIT_AGENT="ds-pipeline-kit/plugin/agents/ds-pipeline-orchestrator.md"
LIVE_SKILLS=".claude/skills"
LIVE_AGENT=".claude/agents/ds-pipeline-orchestrator.md"

fail=0

for path in "$KIT_SKILLS" "$LIVE_SKILLS" "$KIT_AGENT" "$LIVE_AGENT"; do
  if [ ! -e "$path" ]; then
    echo "::error::$path is missing — the two copies of the pipeline cannot be compared."
    exit 1
  fi
done

# Compare the skill trees in full, not just the SKILL.md files: a skill's
# references/ directory is part of it, and a missing reference file is exactly the
# kind of difference that only shows up when the skill is invoked.
if ! diff -r "$KIT_SKILLS" "$LIVE_SKILLS" > /tmp/claude-sync-skills.diff 2>&1; then
  echo "::error::.claude/skills has drifted from $KIT_SKILLS. Both copies must be identical — edit the kit, then re-copy:"
  echo "           cp -r $KIT_SKILLS/. $LIVE_SKILLS/"
  sed -n '1,20p' /tmp/claude-sync-skills.diff | sed 's/^/           /'
  fail=1
fi

if ! diff "$KIT_AGENT" "$LIVE_AGENT" > /tmp/claude-sync-agent.diff 2>&1; then
  echo "::error::.claude/agents/ds-pipeline-orchestrator.md has drifted from the kit's copy:"
  sed -n '1,20p' /tmp/claude-sync-agent.diff | sed 's/^/           /'
  fail=1
fi

# The count is checked separately from the diff: `diff -r` reports an added
# directory, but a skill added to the kit and never copied across is the case worth
# naming explicitly, because it reads as "the pipeline has ten skills" either way.
kit_count=$(find "$KIT_SKILLS" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
live_count=$(find "$LIVE_SKILLS" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
if [ "$kit_count" != "$live_count" ]; then
  echo "::error::the kit ships $kit_count skills and .claude/skills has $live_count."
  fail=1
fi

if [ "$fail" -eq 0 ]; then
  echo "In sync: $kit_count skills and the orchestrator are identical in both copies."
fi
exit "$fail"
