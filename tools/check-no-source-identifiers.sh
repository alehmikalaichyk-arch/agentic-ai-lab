#!/usr/bin/env bash
# =============================================================================
# check-no-source-identifiers.sh
# =============================================================================
# This repository is PUBLIC and on a personal account. Nothing in it may name the
# organisation its tokens were adapted from, that organisation's people, its ticket
# ids, its internal product names, or a path on anyone's laptop.
#
# It failed that on the first check. Token $description fields were copied verbatim
# along with the values, and carried internal decisions, pull-request numbers, dates
# and — in three places — a person's full name. Nothing noticed, because the leak was
# inside prose that reads like ordinary documentation.
#
# Patterns live in .identifiers so this script can ship without naming what it
# forbids: a check for a brand that publishes that brand is the failure it exists
# to prevent. Missing file = the checks are SKIPPED, loudly.
# =============================================================================
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

PATTERNS_FILE="${IDENTIFIERS_FILE:-.identifiers}"
fail=0

if [ ! -f "$PATTERNS_FILE" ]; then
  # Locally a missing file is a setup step. In CI it is a lie: the step goes green
  # having read nothing, and a green step is indistinguishable from a clean
  # repository. This shipped that way for one commit — the pull request that
  # introduced it claimed the check "fails CI on any of it", and it could not have.
  if [ -n "${CI:-}" ]; then
    echo "::error::$PATTERNS_FILE is absent, so this check would verify NOTHING."
    echo "           In CI the file is written from the SOURCE_IDENTIFIERS secret."
    echo "           Set it:  gh secret set SOURCE_IDENTIFIERS < .identifiers"
    echo "           Failing rather than passing: a green step that read no patterns"
    echo "           is worse than no step, because it is mistaken for evidence."
    exit 1
  fi
  echo "SKIP: no $PATTERNS_FILE — this check verifies NOTHING until you create one."
  echo "      Copy .identifiers.example and fill it in. (Local run; in CI this fails.)"
  exit 0
fi

# A file that exists but holds no usable pattern is the same failure wearing a
# different hat.
if ! grep -qE '^[^#[:space:]].*\|' "$PATTERNS_FILE"; then
  echo "::error::$PATTERNS_FILE contains no '<label>|<regex>' lines — nothing would be checked."
  exit 1
fi

while IFS= read -r line; do
  case "$line" in ''|'#'*) continue ;; esac
  label="${line%%|*}"; pattern="${line#*|}"

  # Search tracked files only: node_modules and build output are not ours to police,
  # and .identifiers itself must be excluded or the check always fails on itself.
  # python3, not grep -E: the path pattern needs a negative lookahead to tell a real
  # account name from the `/home/user/` written in a comment as an example, and
  # grep -E has none. Same engine the patterns are written against.
  hits=$(git ls-files | python3 -c '
import re, sys
pattern = re.compile(sys.argv[1], re.IGNORECASE)
for path in sys.stdin.read().split("\n"):
    if not path or path == sys.argv[2]:
        continue
    try:
        text = open(path, encoding="utf-8", errors="ignore").read()
    except OSError:
        continue
    if pattern.search(text):
        print(path)
' "$pattern" "$PATTERNS_FILE")

  if [ -n "$hits" ]; then
    echo "::error::$label — found in:"
    printf '%s\n' "$hits" | sed 's/^/           /'
    fail=1
  fi
done < "$PATTERNS_FILE"

[ "$fail" -eq 0 ] && echo "No source-organisation identifiers in tracked files."
exit "$fail"
