#!/usr/bin/env python3
"""Pattern scanner for verify.sh.

Usage:  scan.py <label> <python-regex> <path> [<path> ...]

Prints matching "path:line: text" to stdout and exits 1 if any match, 0 if none.

WHY THIS IS NOT `grep`. A bracket-expression range such as `[Ѐ-ӿ]` is resolved
by the *locale's collation order*, not by code point. Under a UTF-8 locale the
em dash `—` (U+2014) collates inside that range, so

    grep -rE '[Ѐ-ӿ]' .

reported 939 "Cyrillic" hits against a corpus that contains none — every one of
them an em dash. The same mechanism can hide a real match as easily as it can
invent a false one, and a release check that does either is worse than no check.

Python's `re` matches ranges by code point, in every locale.
"""
import re
import sys
from pathlib import Path

SKIP_DIRS = {".git", "node_modules", "__pycache__", ".DS_Store"}
SKIP_SUFFIXES = {".png", ".jpg", ".jpeg", ".gif", ".pdf", ".woff", ".woff2", ".zip"}


def files(paths):
    for raw in paths:
        p = Path(raw)
        if p.is_file():
            yield p
        elif p.is_dir():
            for f in sorted(p.rglob("*")):
                if f.is_file() \
                        and not any(part in SKIP_DIRS for part in f.parts) \
                        and f.suffix.lower() not in SKIP_SUFFIXES:
                    yield f


def main(argv):
    if len(argv) < 4:
        print(__doc__, file=sys.stderr)
        return 2
    _, label, pattern, *paths = argv
    rx = re.compile(pattern)
    hits = []
    for f in files(paths):
        try:
            text = f.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for i, line in enumerate(text.splitlines(), 1):
            if rx.search(line):
                hits.append("%s:%d: %s" % (f, i, line.strip()[:110]))
    for h in hits:
        print(h)
    return 1 if hits else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
