# status-board

**The question this settles:** do five accent families stay distinguishable when they
appear as small status pills in a dense list, or does the reader have to consult the
legend on every row?

Worth asking because the palette page shows each family in isolation, at a size
nobody uses, on a background nobody uses. Distinguishability is a property of the
neighbourhood, not of a swatch.

**Answer so far:** yes at 12 rows, and the dot helps more than expected — the shape
is doing more work than the hue. Which suggests a status component should carry the
dot by default rather than behind a prop.

**What this prototype is NOT:** a design for a status list. Spacing, column widths and
type sizes here are whatever rendered fastest.

**Component this is pushing toward:** a status pill. Repeated 12 times, carries its
own colour-role pairing, and the dot decision above is a real API question. That is a
stage #0 brief, not a copy of this file.
