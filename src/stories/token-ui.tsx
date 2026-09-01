import * as React from 'react';
import { contrast, type TokenEntry } from './token-data';

/** Shared presentation for the token pages. Deliberately plain: this is a reference view. */

export function Page({ title, lede, children }: { title: string; lede?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-page p-8 font-sans text-fg-default">
      <h1 className="mb-2 text-2xl">{title}</h1>
      {lede ? <div className="mb-8 max-w-3xl text-sm text-fg-subtle">{lede}</div> : null}
      {children}
    </div>
  );
}

export function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="mb-1 text-lg">{title}</h2>
      {note ? <div className="mb-4 max-w-3xl text-sm text-fg-subtle">{note}</div> : null}
      {children}
    </section>
  );
}

/** A colour chip with its name and value. `onDark` flips the label for dark swatches. */
export function Swatch({ token, compact = false }: { token: TokenEntry; compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="size-10 shrink-0 rounded-md border border-outline-default"
        style={{ background: token.value }}
      />
      <div className="min-w-0">
        <div className="truncate text-sm">{token.name}</div>
        {compact ? null : <div className="truncate text-xs text-fg-subtle">{token.value}</div>}
      </div>
    </div>
  );
}

/**
 * One colour step: a clean chip with its label BELOW it.
 *
 * The label sits outside the chip rather than on top of it. Inside, it has to be
 * legible against an arbitrary token value, which is a contrast problem with no
 * good answer at the dark end of a ramp — the darkest steps rendered a label
 * nobody could read, and the very darkest rendered one nobody could see at all.
 * Putting it underneath removes the problem instead of tuning around it, and it
 * also leaves the chip showing the colour and nothing else, which is what a
 * reviewer is trying to look at.
 */
export function Chip({
  token,
  label,
  width = 'w-20',
}: {
  token: TokenEntry;
  label: string;
  width?: string;
}) {
  return (
    <div className={`${width} shrink-0`}>
      <div
        className="h-16 rounded-sm border border-outline-subtle"
        style={{ background: token.value }}
        title={`${token.name} — ${token.value}`}
      />
      <div className="mt-1 break-words text-xs leading-tight text-fg-default">{label}</div>
      <div className="break-words text-xs leading-tight text-fg-subtle">{token.value}</div>
    </div>
  );
}

/** One primitive family as a row of steps — the shape a palette is actually read in. */
export function Ramp({ family, steps }: { family: string; steps: TokenEntry[] }) {
  return (
    <div className="mb-8">
      <div className="mb-2 text-sm text-fg-subtle">{family}</div>
      <div className="flex flex-wrap gap-2">
        {steps.map((step) => (
          <Chip key={step.name} token={step} label={step.name.replace(`${family}-`, '')} />
        ))}
      </div>
    </div>
  );
}

/** Contrast verdict for one pair, computed rather than stated. */
export function Ratio({ fg, bg, exempt }: { fg: TokenEntry; bg: TokenEntry; exempt?: string }) {
  const ratio = contrast(fg.value, bg.value);
  if (ratio === null) {
    return <span className="text-fg-subtle">not a plain colour</span>;
  }
  const passes = ratio >= 4.5;
  return (
    <span className="whitespace-nowrap">
      <span className="mr-2">{ratio.toFixed(2)}:1</span>
      {passes ? (
        <span className="text-fg-status-success">pass</span>
      ) : exempt ? (
        <span className="text-fg-subtle">{exempt}</span>
      ) : (
        <span className="text-fg-status-danger">below AA</span>
      )}
    </span>
  );
}

/** A swatch pair rendered as it would actually be used: the label ON the surface. */
export function PairPreview({ fg, bg, label }: { fg: TokenEntry; bg: TokenEntry; label: string }) {
  return (
    <div
      className="rounded-md border border-outline-subtle px-3 py-2 text-sm"
      style={{ background: bg.value, color: fg.value }}
    >
      {label}
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <table className="w-full max-w-4xl text-left text-sm">
      <thead>
        <tr className="border-b border-outline-default text-fg-subtle">
          {head.map((h) => (
            <th key={h} className="py-2 pr-4 font-weight-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
