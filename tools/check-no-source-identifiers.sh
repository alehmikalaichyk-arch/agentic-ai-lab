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
  echo "SKIP: no $PATTERNS_FILE — this check verifies NOTHING until you create one."
  echo "      Copy .identifiers.example and fill it in."
  exit 0
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
