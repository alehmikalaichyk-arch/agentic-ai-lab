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

/** One primitive family as a row of steps — the shape a palette is actually read in. */
export function Ramp({ family, steps }: { family: string; steps: TokenEntry[] }) {
  return (
    <div className="mb-6">
      <div className="mb-2 text-sm text-fg-subtle">{family}</div>
      <div className="flex flex-wrap gap-1">
        {steps.map((step) => {
          const onDark = (contrast(step.value, '#ffffff') ?? 1) >= 3;
          return (
            <div
              key={step.name}
              className="flex h-16 w-20 flex-col justify-end rounded-sm border border-outline-subtle p-1"
              style={{ background: step.value }}
              title={`${step.name} — ${step.value}`}
            >
              <span
                className="text-xs"
                style={{ color: onDark ? '#ffffff' : '#0d1119' }}
              >
                {step.name.replace(`${family}-`, '')}
              </span>
            </div>
          );
        })}
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
