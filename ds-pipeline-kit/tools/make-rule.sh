#!/usr/bin/env bash
# =============================================================================
# Generate the directory-triggered rule file from the pipeline skill.
# =============================================================================
#
# WHY THIS EXISTS
#
# The pipeline rule has to be available in two forms, and they must never be two
# documents:
#
#   1. As a SKILL — so Level 1 installs in one command. A skill is invoked by the
#      model when it judges the description relevant. That is probabilistic.
#
#   2. As a RULE with `applies-when:` globs — so the harness injects it whenever a
#      matching path is touched, whether or not the model thought to ask. That is
#      deterministic, and strictly stronger. The plugin format has no rules/
#      directory, so this form cannot be installed by a plugin; it is copied.
#
# Two hand-maintained copies of an 800-line document diverge. There is one source
# (the skill) and this script derives the other. Never edit the generated file.
#
# Usage:  ./tools/make-rule.sh [output-path]
#         defaults to build/ds-component-pipeline.rule.md
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="plugin/skills/ds-component-pipeline/SKILL.md"
OUT="${1:-build/ds-component-pipeline.rule.md}"
CFG="ds-kit.config.yml"

[ -f "$SRC" ] || { echo "source skill not found: $SRC" >&2; exit 1; }
mkdir -p "$(dirname "$OUT")"

# Read the trigger paths from the single configuration surface, so the generated
# rule fires on the paths this repository actually uses. Falling back to the
# documented defaults keeps the script usable before the config is edited.
read_path() {
  sed -n "s/^[[:space:]]*$1:[[:space:]]*\"\{0,1\}\([^\"#]*\)\"\{0,1\}[[:space:]]*$/\1/p" \
    "$CFG" 2>/dev/null | head -1 | sed 's/[[:space:]]*$//'
}
UI=$(read_path components_ui);        UI=${UI:-src/components/ui/}
CO=$(read_path components_composite); CO=${CO:-src/components/}
SP=$(read_path specs);                SP=${SP:-docs/component-specs/}
RE=$(read_path retrofits);            RE=${RE:-docs/component-retrofits/}
RQ=$(read_path requirements);         RQ=${RQ:-docs/component-requirements/}
DR=$(read_path drafts);               DR=${DR:-component-prototypes/}

{
  printf -- '---\n'
  printf '# GENERATED FILE — DO NOT EDIT.\n'
  printf '# Source: %s\n' "$SRC"
  printf '# Regenerate: ./tools/make-rule.sh\n'
  printf '# Trigger globs are read from %s.\n' "$CFG"
  printf 'applies-when:\n'
  for p in "$UI" "$CO" "$SP" "$RE" "$RQ" "$DR"; do
    printf -- '  - "%s**"\n' "${p%/}/"
  done
  printf -- '---\n\n'
  # Drop the skill's own frontmatter block, keep the body verbatim.
  awk 'BEGIN{n=0} /^---$/{n++; next} n>=2{print}' "$SRC"
} > "$OUT"

echo "wrote $OUT ($(wc -l < "$OUT" | tr -d ' ') lines)"
echo
echo "Install it with:"
echo "  cp $OUT <your-repo>/.claude/rules/ds-component-pipeline.md"
echo
echo "Level 1 works without this file — the skill covers the same content. This form"
echo "adds a deterministic directory trigger that a skill cannot provide."
