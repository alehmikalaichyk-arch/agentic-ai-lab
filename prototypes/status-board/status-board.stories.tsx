import type { Meta, StoryObj } from '@storybook/react';
import { ROWS, STATUS_TOKENS, type Row } from './data';

/**
 * A prototype, not a component. Read prototypes/status-board/NOTES.md for the
 * question it exists to settle.
 *
 * Everything here is deliberately scrappy except the tokens: markup is inline and
 * repeated, spacing is whatever rendered fastest, and none of it is reusable. The
 * one discipline is that every colour comes from a semantic role — a prototype using
 * raw hex answers nothing about whether the palette works, which is half the point.
 */

function StatusPill({ status, dot = true }: { status: Row['status']; dot?: boolean }) {
  const { surface, fg, label } = STATUS_TOKENS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-weight-medium ${surface} ${fg}`}
    >
      {dot ? <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" /> : null}
      {label}
    </span>
  );
}

function Board({ dot }: { dot: boolean }) {
  return (
    <div className="min-h-screen bg-surface-page p-8 font-sans">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-1 text-xl text-fg-default">Invoices</h1>
        <p className="mb-6 text-sm text-fg-subtle">
          {ROWS.length} rows. The question: do five accent families stay distinguishable at pill
          size, in a dense list — or does the reader consult the legend on every row?
        </p>

        <div className="overflow-hidden rounded-md border border-outline-default bg-surface-default">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-outline-default text-fg-subtle">
                <th className="px-4 py-2 font-weight-medium">Invoice</th>
                <th className="px-4 py-2 font-weight-medium">Vendor</th>
                <th className="px-4 py-2 text-right font-weight-medium">Amount</th>
                <th className="px-4 py-2 font-weight-medium">Status</th>
                <th className="px-4 py-2 font-weight-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.id} className="border-b border-outline-subtle last:border-0">
                  <td className="px-4 py-2.5 text-fg-default">{row.id}</td>
                  <td className="px-4 py-2.5 text-fg-default">{row.vendor}</td>
                  <td className="px-4 py-2.5 text-right text-fg-default tabular-nums">{row.amount}</td>
                  <td className="px-4 py-2.5">
                    <StatusPill status={row.status} dot={dot} />
                  </td>
                  <td className="px-4 py-2.5 text-fg-subtle">{row.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-fg-subtlest">
          Prototype — no spec, no gates, disposable. A pill here does not become a component by
          being copied into src/; it enters the pipeline at stage #0 with a brief.
        </p>
      </div>
    </div>
  );
}

const meta = {
  title: 'Prototypes/Status board',
  component: Board,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Board>;

export default meta;

/** The version the question is actually about. */
export const WithDot: StoryObj<typeof meta> = { args: { dot: true } };

/**
 * The control. If these two read the same, the dot is decoration; if the list gets
 * harder to scan, the dot is carrying meaning — and a status component should render
 * it by default rather than behind a prop.
 */
export const ColourOnly: StoryObj<typeof meta> = { args: { dot: false } };
