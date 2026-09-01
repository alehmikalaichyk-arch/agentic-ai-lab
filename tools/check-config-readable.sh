#!/usr/bin/env bash
# =============================================================================
# check-config-readable.sh
# =============================================================================
# Every key the shell tools read must actually parse.
#
# They share one tiny reader:
#
#   sed -n "s/^[[:space:]]*KEY:[[:space:]]*\"\{0,1\}\([^\"#]*\)\"\{0,1\}[[:space:]]*$/\1/p"
#
# which requires the value to run to END OF LINE. A trailing comment — the most
# natural thing to write in a YAML file — makes the pattern miss, the reader returns
# empty, and the caller silently falls back to its built-in default.
#
# Nothing reports it. The tool runs, uses the wrong value, and succeeds. Found the
# hard way: `require_review_to_merge: false   # one contributor` read as `true`, and
# the branch-protection plan confidently described the opposite of what was
# configured.
#
# This checks the symptom rather than the cause: for each key, does the reader return
# the value that is actually on the line? A key that parses is fine however it is
# written; a key that does not is named, with the line, before it can mislead anyone.
# =============================================================================
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

CFG="ds-kit.config.yml"
fail=0

read_key() {
  sed -n "s/^[[:space:]]*$1:[[:space:]]*\"\{0,1\}\([^\"#]*\)\"\{0,1\}[[:space:]]*$/\1/p" \
    "$CFG" 2>/dev/null | head -1 | sed 's/[[:space:]]*$//'
}

# Every key some tool in this repository resolves by name.
KEYS="components_ui components_composite specs retrofits requirements drafts pipeline_reports
      tokens generated main_branch implementer gate spec_pr_separation one_component_per_pr
      document_on_base review_approved require_review_to_merge"

for key in $KEYS; do
  # Present in the file at all?
  line=$(grep -nE "^[[:space:]]*${key}:" "$CFG" | head -1 || true)
  [ -n "$line" ] || continue          # absent keys are the caller's business, not this check's

  value=$(read_key "$key")
  if [ -z "$value" ]; then
    echo "::error::'$key' is present in $CFG and reads as EMPTY, so every tool will use its built-in default instead."
    echo "           ${line}"
    echo "           Most likely a trailing comment: the reader requires the value to end the line."
    fail=1
  fi
done

if [ "$fail" -eq 0 ]; then
  echo "Every configured key parses; no tool is silently falling back to a default."
fi
exit "$fail"
