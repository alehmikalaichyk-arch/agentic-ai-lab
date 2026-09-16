/** Fixtures, ported verbatim from reference.html. Hardcoded on purpose: a prototype
 *  that fetches is a prototype that can fail for reasons unrelated to its question. */

export type Status = 'transit' | 'delivered' | 'delayed' | 'held' | 'pending';

export type Shipment = {
  id: string;
  customer: string;
  from: string;
  to: string;
  via: string[];
  status: Status;
  eta: string;
  etaLate: boolean;
  driver: string;
  carrier: string;
  weight: string;
  pallets: number;
  ref: string;
  notes: string;
};

export type ShipmentEvent = { t: string; kind: '' | 'ok' | 'warn'; text: string };

export const TODAY_LABEL = 'Wednesday, 16 September';

export const CITIES = ['Rotterdam', 'Duisburg', 'Prague', 'Berlin', 'Hamburg', 'Vienna', 'Antwerp', 'Warsaw', 'Lyon', 'Milan'];

export const SHIPMENTS: Shipment[] = [
  { id: 'WP-24081', customer: 'Nordvik Components', from: 'Rotterdam', to: 'Prague', via: ['Duisburg'], status: 'delayed', eta: 'Today 14:30', etaLate: true, driver: 'M. Kowalski', carrier: 'TransEuro', weight: '1,240 kg', pallets: 6, ref: 'PO-88213', notes: 'Customs check at Duisburg took 3h longer than planned.' },
  { id: 'WP-24079', customer: 'Baltic Fresh', from: 'Hamburg', to: 'Berlin', via: [], status: 'transit', eta: 'Today 11:15', etaLate: false, driver: 'J. Berg', carrier: 'Northline', weight: '860 kg', pallets: 4, ref: 'PO-88190', notes: '' },
  { id: 'WP-24077', customer: 'Orion Textiles', from: 'Antwerp', to: 'Lyon', via: ['Paris'], status: 'held', eta: '—', etaLate: false, driver: '—', carrier: 'TransEuro', weight: '2,100 kg', pallets: 10, ref: 'PO-88171', notes: 'Missing CMR document. Awaiting customer.' },
  { id: 'WP-24075', customer: 'Helix Labs', from: 'Vienna', to: 'Prague', via: [], status: 'delivered', eta: 'Today 08:42', etaLate: false, driver: 'P. Novák', carrier: 'CZ Express', weight: '310 kg', pallets: 2, ref: 'PO-88160', notes: '' },
  { id: 'WP-24074', customer: 'Kessler & Sohn', from: 'Duisburg', to: 'Warsaw', via: ['Berlin'], status: 'delayed', eta: 'Today 16:00', etaLate: true, driver: 'A. Schmidt', carrier: 'Northline', weight: '1,900 kg', pallets: 8, ref: 'PO-88152', notes: 'Vehicle breakdown near Berlin, replacement dispatched.' },
  { id: 'WP-24072', customer: 'Meridian Foods', from: 'Rotterdam', to: 'Hamburg', via: [], status: 'transit', eta: 'Today 12:40', etaLate: false, driver: 'L. de Vries', carrier: 'TransEuro', weight: '3,400 kg', pallets: 14, ref: 'PO-88140', notes: 'Temperature-controlled.' },
  { id: 'WP-24070', customer: 'Tallgrass Furniture', from: 'Milan', to: 'Vienna', via: [], status: 'transit', eta: 'Tomorrow 09:00', etaLate: false, driver: 'G. Ricci', carrier: 'AlpTrans', weight: '2,750 kg', pallets: 9, ref: 'PO-88133', notes: '' },
  { id: 'WP-24068', customer: 'Aurora Optics', from: 'Prague', to: 'Berlin', via: [], status: 'pending', eta: 'Tomorrow 15:30', etaLate: false, driver: '—', carrier: 'CZ Express', weight: '120 kg', pallets: 1, ref: 'PO-88120', notes: 'Fragile. Pickup not yet confirmed.' },
  { id: 'WP-24066', customer: 'Nordvik Components', from: 'Rotterdam', to: 'Duisburg', via: [], status: 'delivered', eta: 'Yesterday 17:05', etaLate: false, driver: 'M. Kowalski', carrier: 'TransEuro', weight: '980 kg', pallets: 5, ref: 'PO-88102', notes: '' },
  { id: 'WP-24064', customer: 'Baltic Fresh', from: 'Hamburg', to: 'Warsaw', via: ['Berlin'], status: 'held', eta: '—', etaLate: false, driver: '—', carrier: 'Northline', weight: '1,500 kg', pallets: 7, ref: 'PO-88097', notes: 'Address on the waybill does not match the order.' },
  { id: 'WP-24061', customer: 'Orion Textiles', from: 'Lyon', to: 'Milan', via: [], status: 'delivered', eta: 'Yesterday 13:20', etaLate: false, driver: 'C. Moreau', carrier: 'AlpTrans', weight: '640 kg', pallets: 3, ref: 'PO-88080', notes: '' },
  { id: 'WP-24059', customer: 'Helix Labs', from: 'Berlin', to: 'Vienna', via: ['Prague'], status: 'transit', eta: 'Today 18:10', etaLate: false, driver: 'K. Weber', carrier: 'CZ Express', weight: '430 kg', pallets: 2, ref: 'PO-88071', notes: '' },
];

const EVENTS: Record<string, ShipmentEvent[]> = {
  'WP-24081': [
    { t: 'Today 13:05', kind: 'warn', text: 'ETA revised to 14:30 — delay reported by carrier' },
    { t: 'Today 09:40', kind: 'warn', text: 'Held at customs, Duisburg. Inspection in progress' },
    { t: 'Today 06:15', kind: '', text: 'Arrived at Duisburg hub' },
    { t: 'Yesterday 21:30', kind: '', text: 'Departed Rotterdam terminal' },
    { t: 'Yesterday 18:00', kind: 'ok', text: 'Loaded, 6 pallets. Seal 0043-A' },
    { t: 'Yesterday 10:12', kind: '', text: 'Shipment created from PO-88213' },
  ],
  'WP-24074': [
    { t: 'Today 12:20', kind: 'warn', text: 'Replacement vehicle dispatched from Berlin depot' },
    { t: 'Today 11:02', kind: 'warn', text: 'Driver reported breakdown, A2 near Michendorf' },
    { t: 'Today 05:50', kind: '', text: 'Departed Duisburg' },
    { t: 'Yesterday 16:40', kind: 'ok', text: 'Loaded, 8 pallets' },
  ],
};

/** Same derivation as the reference's eventsFor(). */
export function eventsFor(s: Shipment): ShipmentEvent[] {
  if (EVENTS[s.id]) return EVENTS[s.id];
  const base: ShipmentEvent[] = [
    { t: 'Yesterday 09:00', kind: '', text: `Shipment created from ${s.ref}` },
    { t: 'Yesterday 15:30', kind: 'ok', text: `Loaded, ${s.pallets} pallet${s.pallets > 1 ? 's' : ''}` },
  ];
  if (s.status === 'pending') return base.slice(0, 1);
  if (s.status === 'held') return [{ t: 'Today 08:10', kind: 'warn', text: `Put on hold: ${s.notes}` }, ...base.reverse()];
  base.push({ t: 'Yesterday 19:00', kind: '', text: `Departed ${s.from}` });
  if (s.status === 'delivered') base.push({ t: s.eta, kind: 'ok', text: `Delivered in ${s.to}. Signed by consignee` });
  return base.reverse();
}

export const STATUS_LABEL: Record<Status, string> = {
  transit: 'In transit',
  delivered: 'Delivered',
  delayed: 'Delayed',
  held: 'On hold',
  pending: 'Pending pickup',
};

/** Status -> token pair. Same rule prototypes/status-board recorded: on a soft accent
 *  surface only the `-boldest` foreground clears AA, so that is the one used. The
 *  reference's hex pairs are NOT carried over — they answer nothing about this palette. */
export const STATUS_TOKENS: Record<Status, { surface: string; fg: string; dot: string }> = {
  transit:   { surface: 'bg-surface-accent-blue-subtlest',  fg: 'text-fg-accent-blue-boldest',  dot: 'bg-surface-accent-blue-bold' },
  delivered: { surface: 'bg-surface-accent-green-subtlest', fg: 'text-fg-accent-green-boldest', dot: 'bg-surface-accent-green-bold' },
  delayed:   { surface: 'bg-surface-accent-red-subtlest',   fg: 'text-fg-accent-red-boldest',   dot: 'bg-surface-accent-red-bold' },
  held:      { surface: 'bg-surface-accent-amber-subtlest', fg: 'text-fg-accent-amber-boldest', dot: 'bg-surface-accent-amber-bold' },
  pending:   { surface: 'bg-surface-accent-grey-subtlest',  fg: 'text-fg-accent-grey-boldest',  dot: 'bg-surface-accent-grey-bold' },
};

export type DemoState = 'populated' | 'loading' | 'error' | 'empty' | 'empty-filtered';
export type Route =
  | { screen: 'today' }
  | { screen: 'shipments'; status?: Status; city?: string; q?: string }
  | { screen: 'details'; id: string }
  | { screen: 'problems' }
  | { screen: 'messages' }
  | { screen: 'new' };
