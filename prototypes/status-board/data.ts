/** Hardcoded on purpose. A prototype that fetches is a prototype that can fail for
 *  reasons unrelated to the question it was built to answer. */
export type Row = {
  id: string;
  vendor: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue' | 'draft' | 'review';
  updated: string;
};

export const ROWS: Row[] = [
  { id: 'INV-2041', vendor: 'Northwind Supply', amount: '$12,400.00', status: 'paid', updated: '2 hours ago' },
  { id: 'INV-2040', vendor: 'Harbor Logistics', amount: '$3,120.50', status: 'pending', updated: '5 hours ago' },
  { id: 'INV-2039', vendor: 'Delta Fabrication', amount: '$48,900.00', status: 'overdue', updated: 'yesterday' },
  { id: 'INV-2038', vendor: 'Ridge Materials', amount: '$780.00', status: 'draft', updated: 'yesterday' },
  { id: 'INV-2037', vendor: 'Coastal Rentals', amount: '$22,050.75', status: 'review', updated: '2 days ago' },
  { id: 'INV-2036', vendor: 'Northwind Supply', amount: '$1,999.99', status: 'paid', updated: '2 days ago' },
  { id: 'INV-2035', vendor: 'Ironworks Co', amount: '$67,300.00', status: 'overdue', updated: '3 days ago' },
  { id: 'INV-2034', vendor: 'Harbor Logistics', amount: '$450.00', status: 'pending', updated: '4 days ago' },
  { id: 'INV-2033', vendor: 'Delta Fabrication', amount: '$15,675.20', status: 'paid', updated: '5 days ago' },
  { id: 'INV-2032', vendor: 'Summit Concrete', amount: '$9,340.00', status: 'review', updated: '1 week ago' },
  { id: 'INV-2031', vendor: 'Ridge Materials', amount: '$2,110.00', status: 'draft', updated: '1 week ago' },
  { id: 'INV-2030', vendor: 'Coastal Rentals', amount: '$33,000.00', status: 'paid', updated: '2 weeks ago' },
];

/** Status -> the token PAIR it renders with.
 *
 *  On a soft accent surface only the `-boldest` foreground clears AA; the matching
 *  base foreground does not, and it is the one the names suggest. Recorded here
 *  rather than discovered per-row.
 */
export const STATUS_TOKENS: Record<Row['status'], { surface: string; fg: string; label: string }> = {
  paid:    { surface: 'bg-surface-accent-green-subtlest', fg: 'text-fg-accent-green-boldest', label: 'Paid' },
  pending: { surface: 'bg-surface-accent-amber-subtlest', fg: 'text-fg-accent-amber-boldest', label: 'Pending' },
  overdue: { surface: 'bg-surface-accent-red-subtlest',   fg: 'text-fg-accent-red-boldest',   label: 'Overdue' },
  draft:   { surface: 'bg-surface-accent-grey-subtlest',  fg: 'text-fg-accent-grey-boldest',  label: 'Draft' },
  review:  { surface: 'bg-surface-accent-blue-subtlest',  fg: 'text-fg-accent-blue-boldest',  label: 'In review' },
};
