#!/usr/bin/env bash
# =============================================================================
# check-agents-exist.sh
# =============================================================================
# ds-kit.config.yml names the agents the orchestrator delegates each stage to.
# This checks that those agents exist.
#
# The failure it prevents is the one the kit itself warns about: a rule that names
# an enforcer which does not exist is enforced by nothing, and reads as governed.
# The orchestrator would delegate stage #5 to `frontend-engineer`, the harness would
# have no such agent, and the run fails somewhere downstream of the actual cause —
# or worse, falls back to a general agent that never read the skill.
#
# It was true here: the repository shipped the orchestrator alone, delegating to two
# agents that were not in it.
# =============================================================================
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

CFG="ds-kit.config.yml"
AGENT_DIR=".claude/agents"
fail=0

read_agent() {
  sed -n "s/^[[:space:]]*$1:[[:space:]]*\"\{0,1\}\([^\"#]*\)\"\{0,1\}[[:space:]]*$/\1/p" \
    "$CFG" 2>/dev/null | head -1 | sed 's/[[:space:]]*$//'
}

for key in implementer gate; do
  name=$(read_agent "$key")
  if [ -z "$name" ]; then
    echo "::error::$CFG declares no agents.$key — the orchestrator has nobody to delegate to."
    fail=1
    continue
  fi
  # Match on the agent's declared `name:`, not on the filename. The harness resolves
  # an agent by the frontmatter name, so a file called frontend-engineer.md that
  # declares `name: something-else` is a working file and a broken reference.
  found=""
  for f in "$AGENT_DIR"/*.md; do
    [ -e "$f" ] || continue
    declared=$(awk '/^name:/{print $2; exit}' "$f")
    if [ "$declared" = "$name" ]; then found="$f"; break; fi
  done
  if [ -z "$found" ]; then
    echo "::error::$CFG sets agents.$key = '$name', and no file in $AGENT_DIR declares that name."
    echo "           Available: $(for f in "$AGENT_DIR"/*.md; do awk '/^name:/{printf "%s ", $2; exit}' "$f"; done)"
    fail=1
    continue
  fi

  # Existing is not the same as being able to do the job. Both delegates run pipeline
  # STAGES, and a stage is a skill invocation — so an agent without the `Skill` tool
  # is present, resolvable, and unable to run a single stage. That failure surfaces
  # only when the orchestrator has already delegated, mid-run, as a question about
  # how to proceed rather than as a broken configuration.
  #
  # Found exactly that way: both agents shipped without it, and the run stopped at
  # stage #1.
  tools_line=$(grep -m1 '^tools:' "$found" || true)
  case "$tools_line" in
    *Skill*) echo "agents.$key = '$name' -> $found (can run skills)" ;;
    *)
      echo "::error::agents.$key = '$name' ($found) has no 'Skill' tool, so it cannot run a pipeline stage."
      echo "           Its tools line is: ${tools_line:-<absent>}"
      echo "           Every stage is a skill invocation. Add Skill to that line."
      fail=1
      ;;
  esac
done

exit "$fail"
