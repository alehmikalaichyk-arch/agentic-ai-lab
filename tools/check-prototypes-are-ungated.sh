#!/usr/bin/env bash
# =============================================================================
# check-prototypes-are-ungated.sh
# =============================================================================
# prototypes/ is documented as being outside every path the PR gates classify.
# That is a claim about configuration, and configuration drifts: point
# `components_composite` at `src/` one day, or add `prototypes/` to a path key, and
# the zone silently acquires gates. The first symptom would be a prototype PR
# demanding a frozen spec.
#
# Checked structurally rather than by running the classifier, so it needs no PR
# context and runs anywhere.
# =============================================================================
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

CFG="ds-kit.config.yml"
ZONE="prototypes/"
fail=0

read_key() {
  sed -n "s/^[[:space:]]*$1:[[:space:]]*\"\{0,1\}\([^\"#]*\)\"\{0,1\}[[:space:]]*$/\1/p" \
    "$CFG" 2>/dev/null | head -1 | sed 's/[[:space:]]*$//'
}

for key in components_ui components_composite specs retrofits requirements drafts; do
  value=$(read_key "$key")
  [ -n "$value" ] || continue
  # The zone is gated if a classified path IS the zone, or contains it, or the zone
  # contains the classified path.
  case "$ZONE" in
    "$value"*) echo "::error::paths.$key = '$value' — $ZONE falls inside a classified path, so the gates DO apply to prototypes."; fail=1 ;;
  esac
  case "$value" in
    "$ZONE"*) echo "::error::paths.$key = '$value' lives inside $ZONE — a classified path must not sit in the ungated zone."; fail=1 ;;
  esac
done

if [ "$fail" -eq 0 ]; then
  echo "prototypes/ is outside every classified path — the zone is ungated, as documented."
fi
exit "$fail"
