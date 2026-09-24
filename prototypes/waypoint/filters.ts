import { SHIPMENTS, type Shipment, type Status, STATUS_LABEL } from './data';

/*
 * Faceted filtering for the Shipments list — the model layer.
 *
 * Built from the faceted-list-filtering specification supplied on 2026-09-24. Section
 * references below point at that document, which is not versioned in this repository. This file is step 1 of its §11 implementation order: every
 * predicate, the composition, parsing and deduplication, with no interface at all.
 *
 * WHAT A PROTOTYPE CAN AND CANNOT HONOUR
 * --------------------------------------
 * The spec's query layer (§8) assumes a data store. This screen filters an array in
 * one process, so three of its rules have no counterpart here and are NOT silently
 * "implemented":
 *
 *   §8.2 predicate placement — there is no retrieval to be after, and no pagination or
 *        count computed elsewhere to desynchronise from.
 *   §8.3 binding vs interpolation — there is no query text, so nothing can be injected.
 *   §7   pagination — this list has 12 rows and no pager.
 *
 * What DOES carry over is the part people assume is SQL-specific and is not:
 *
 *   §8.1 bracketing — JavaScript's `&&` binds tighter than `||` exactly as SQL's does,
 *        so a flattened composition widens the result set here in the same way. See
 *        matchesFilters and the test that deletes the grouping.
 *   §8.4 deduplication — cheap, and it keeps a hand-written deep link from repeating.
 *   §8.5 refusal — predicateFor throws on an unknown value rather than returning false,
 *        because a dropped condition widens silently (failure #12).
 *   §3   the facet kinds, which are where the real defects live.
 */

/* ------------------------------------------------------------------ canonical rules */

/*
 * THE derivation behind the `attention` facet (§3.B).
 *
 * It was already written twice in waypoint.tsx — once for the sidebar's badge count and
 * once for the Today screen's "Needs attention" table. Two copies of one rule is exactly
 * the drift §3.B warns about, so this is now the single definition and both call it.
 *
 * The spec says a derived facet is FORCED to duplicate its rule, because the predicate
 * must run in the data store and cannot call the canonical function (§3.B, §8.2). That
 * constraint does not exist here: there is no query boundary, so the facet calls this
 * function directly and there is no second copy to drift. `derivedFacetIsPinned` in the
 * tests still pins every input combination against it — the pin is what would survive
 * someone later inlining the rule into the predicate.
 */
export const needsAttention = (s: Shipment): boolean =>
  s.status === 'delayed' || s.status === 'held';

/*
 * The discriminant of the `schedule` facet (§3.C). It decides WHICH sub-vocabulary
 * applies to a record: a delivered shipment's date is a delivery date, everything else
 * has an expected date.
 */
export type Lifecycle = 'expected' | 'delivered';
export const lifecycleOf = (s: Shipment): Lifecycle =>
  s.status === 'delivered' ? 'delivered' : 'expected';

/*
 * The sub-value: which day bucket the eta falls in. 'none' is the ABSENT case — held
 * shipments carry '—', which the table renders as a dash and the Schedule facet calls
 * "Unscheduled". §3.C's third bullet: because the product displays the missing value as
 * that default, filtering by that default must match the missing case too.
 */
export type EtaBucket = 'today' | 'tomorrow' | 'yesterday' | 'none';
export const etaBucketOf = (s: Shipment): EtaBucket => {
  const head = s.eta.split(' ')[0].toLowerCase();
  if (head === 'today') return 'today';
  if (head === 'tomorrow') return 'tomorrow';
  if (head === 'yesterday') return 'yesterday';
  return 'none';
};

/** The id form used for open-facet values, which must survive a deep link. */
export const customerId = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ----------------------------------------------------------------------- the facets */

export type FacetId = 'status' | 'attention' | 'schedule' | 'carrier' | 'city' | 'customer' | 'driver';

export type FacetKind =
  | 'enumerated' // §3.A
  | 'derived' // §3.B
  | 'discriminated' // §3.C
  | 'open' // §3.D
  | 'with-sentinel'; // §3.E — enumerated, plus a value meaning "absent"

export type FacetValue = {
  id: string;
  label: string;
  /** §3.C only. A presentation grouping; it never reaches a chip (§5). */
  group?: string;
};

export type Facet = {
  id: FacetId;
  label: string;
  kind: FacetKind;
  /** Absent for an open facet (§3.D): its vocabulary is too large to enumerate. */
  values?: FacetValue[];
  /** §3.C — the groups, in display order. */
  groups?: Array<{ id: Lifecycle; label: string }>;
  predicate: (valueId: string, s: Shipment) => boolean;
};

const CARRIERS = ['TransEuro', 'Northline', 'CZ Express', 'AlpTrans'];
const DRIVERS = [...new Set(SHIPMENTS.map((s) => s.driver))].filter((d) => d !== '—').sort();
export const ROUTE_CITIES = [...new Set(SHIPMENTS.flatMap((s) => [s.from, ...s.via, s.to]))].sort();

/** §3.E — the value meaning "this attribute is absent". */
export const UNASSIGNED = 'unassigned';

export const FACETS: Facet[] = [
  {
    id: 'status',
    label: 'Status',
    kind: 'enumerated',
    values: (Object.keys(STATUS_LABEL) as Status[]).map((k) => ({ id: k, label: STATUS_LABEL[k] })),
    predicate: (v, s) => s.status === v,
  },
  {
    id: 'attention',
    label: 'Attention',
    kind: 'derived',
    values: [
      { id: 'needs-attention', label: 'Needs attention' },
      { id: 'on-track', label: 'On track' },
    ],
    // Calls the canonical rule rather than restating it — see needsAttention above.
    predicate: (v, s) => (v === 'needs-attention' ? needsAttention(s) : !needsAttention(s)),
  },
  {
    id: 'schedule',
    label: 'Schedule',
    kind: 'discriminated',
    groups: [
      { id: 'expected', label: 'Expected' },
      { id: 'delivered', label: 'Delivered' },
    ],
    values: [
      { id: 'expected:today', label: 'Today', group: 'expected' },
      { id: 'expected:tomorrow', label: 'Tomorrow', group: 'expected' },
      { id: 'expected:none', label: 'Unscheduled', group: 'expected' },
      { id: 'delivered:today', label: 'Today', group: 'delivered' },
      { id: 'delivered:yesterday', label: 'Yesterday', group: 'delivered' },
    ],
    /*
     * Two things here, and both are a defect when skipped (§3.C):
     *
     * 1. THE DISCRIMINANT GATE. Every sub-predicate checks the lifecycle first. Without
     *    it, "Delivered · Today" also returns the in-transit shipment due today — a
     *    record of the wrong class under a class-labelled value (failure #3). The two
     *    groups genuinely share the label "Today", which is what makes the gate
     *    load-bearing rather than decorative.
     *
     * 2. THE CANONICAL FALLBACK. 'expected:none' matches a shipment with no eta at all,
     *    because the list already displays that as a dash and the facet calls it
     *    Unscheduled. It is added to THAT value only — applying it across the group
     *    would sweep unrelated records in (failure #4).
     *
     * The union across groups is NOT built here. It falls out of matchesFilters, where
     * the selected values of one facet are OR-ed (§2). Implementing the groups as two
     * separate conditions is what makes a cross-group selection return nothing at all
     * (failure #2) — so they are one facet with one vocabulary, deliberately.
     */
    predicate: (v, s) => {
      const [group, bucket] = v.split(':');
      if (lifecycleOf(s) !== group) return false;
      return etaBucketOf(s) === bucket;
    },
  },
  {
    id: 'carrier',
    label: 'Carrier',
    kind: 'enumerated',
    values: CARRIERS.map((c) => ({ id: c, label: c })),
    predicate: (v, s) => s.carrier === v,
  },
  {
    id: 'city',
    label: 'Route city',
    kind: 'enumerated',
    values: ROUTE_CITIES.map((c) => ({ id: c, label: c })),
    // Origin, destination or any stop — the same reading the old single-select had.
    predicate: (v, s) => s.from === v || s.to === v || s.via.includes(v),
  },
  {
    id: 'customer',
    label: 'Customer',
    kind: 'open',
    // No `values`: the vocabulary comes from searchCustomers (§3.D).
    predicate: (v, s) => customerId(s.customer) === v,
  },
  {
    id: 'driver',
    label: 'Driver',
    kind: 'with-sentinel',
    values: [
      ...DRIVERS.map((d) => ({ id: d, label: d })),
      { id: UNASSIGNED, label: 'Unassigned' },
    ],
    // §3.E — a value of this facet, OR-ed with the rest by the normal rule.
    predicate: (v, s) => (v === UNASSIGNED ? s.driver === '—' : s.driver === v),
  },
];

export const facetById = (id: FacetId): Facet => {
  const f = FACETS.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown facet: ${id}`);
  return f;
};

/* ------------------------------------------------------------------- filter state */

export type Selection = Partial<Record<FacetId, string[]>>;

export const selectedValues = (sel: Selection, id: FacetId): string[] => sel[id] ?? [];

/** §4.9 — the trigger counts FACETS with a selection, never values, never the query. */
export const activeFacetCount = (sel: Selection): number =>
  FACETS.filter((f) => selectedValues(sel, f.id).length > 0).length;

export const hasAnySelection = (sel: Selection): boolean => activeFacetCount(sel) > 0;

/**
 * Toggle one value. §4.4: a facet has at most one rule, so this edits the existing
 * selection. §4.5: emptying a facet removes its entry entirely, which is what makes the
 * chip disappear rather than linger with a count of zero.
 */
export function toggleValue(sel: Selection, id: FacetId, valueId: string): Selection {
  const current = selectedValues(sel, id);
  const next = current.includes(valueId)
    ? current.filter((v) => v !== valueId)
    : [...current, valueId];
  const out: Selection = { ...sel };
  if (next.length === 0) delete out[id];
  else out[id] = next;
  return out;
}

export function clearFacet(sel: Selection, id: FacetId): Selection {
  const out: Selection = { ...sel };
  delete out[id];
  return out;
}

/* ------------------------------------------------------------------- composition */

const matchesText = (query: string, s: Shipment): boolean => {
  const n = query.trim().toLowerCase();
  if (!n) return true;
  // §9.6 — the fields this matched before facets existed. Do not narrow to the mock.
  return (
    s.id.toLowerCase().includes(n) ||
    s.customer.toLowerCase().includes(n) ||
    s.ref.toLowerCase().includes(n)
  );
};

/**
 * §2 — values inside one facet OR; facets AND with each other and with the query.
 *
 * §8.1 IS LOAD-BEARING IN JAVASCRIPT TOO. `&&` binds tighter than `||` here exactly as
 * it does in SQL, so writing the per-facet condition flattened —
 *
 *     selected.length === 0 || selected.some(...) && ...
 *
 * — lets a facet escape the conjunction and WIDENS the result: records the reader
 * filtered out come back, with no error and a plausible-looking list. The grouping below
 * is what prevents it, and `filters.test.ts` deletes it to prove the tests can see it.
 *
 * An empty selection is the ABSENCE of a constraint, never a constraint matching nothing
 * (§2, failure #6).
 */
export function matchesFilters(s: Shipment, sel: Selection, query = ''): boolean {
  if (!matchesText(query, s)) return false;
  return FACETS.every((facet) => {
    const values = selectedValues(sel, facet.id);
    if (values.length === 0) return true;
    return values.some((v) => facet.predicate(v, s));
  });
}

export const applyFilters = (rows: Shipment[], sel: Selection, query = ''): Shipment[] =>
  rows.filter((s) => matchesFilters(s, sel, query));

/* --------------------------------------------------------------- parsing and caps */

/**
 * §6 — the cap. Uncapped repeatable state turns a large deep link into a large amount of
 * work; stated here, which is where it is enforced.
 */
export const MAX_VALUES_PER_FACET = 20;

/**
 * §6 / §8.5 — the UI-facing layer DROPS what it does not recognise, so a hand-edited
 * deep link cannot break the list. The data-facing layer REFUSES (see predicateFor).
 * Different layers, different correct answers.
 *
 * §8.4 — deduplicate. Both OR and set membership are idempotent, so this changes no
 * result; it exists so a repeated value cannot multiply the work.
 */
export function parseSelection(raw: Partial<Record<string, string[]>>): Selection {
  const out: Selection = {};
  for (const facet of FACETS) {
    const incoming = raw[facet.id];
    if (!Array.isArray(incoming)) continue;
    const allowed = incoming.filter((v) => isKnownValue(facet, v));
    const deduped = [...new Set(allowed)].slice(0, MAX_VALUES_PER_FACET);
    if (deduped.length > 0) out[facet.id] = deduped;
  }
  return out;
}

function isKnownValue(facet: Facet, valueId: string): boolean {
  // An open facet has no enumerable vocabulary; an id is valid if it resolves to a name.
  if (facet.kind === 'open') return customerLabel(valueId) !== undefined;
  return (facet.values ?? []).some((v) => v.id === valueId);
}

/**
 * §8.5 — refusal at the data layer. Returning false for an unknown value would drop the
 * condition and widen the result set with nothing on screen saying so (failure #12).
 * Correct even though the interface cannot produce such a value: a deep link is an input.
 */
export function predicateFor(facetId: FacetId, valueId: string): (s: Shipment) => boolean {
  const facet = facetById(facetId);
  if (!isKnownValue(facet, valueId)) {
    throw new Error(`Unknown value for facet "${facetId}": ${valueId}`);
  }
  return (s) => facet.predicate(valueId, s);
}

/* ------------------------------------------------- open facet: the option source */

/*
 * §3.D. The directory is deliberately larger than the shipment fixture, so the reader can
 * search for customers that have no shipment in view — the point of an open facet is that
 * its options do NOT come from the loaded page (failure #8).
 */
const EXTRA_CUSTOMERS = [
  'Adriatic Marine', 'Alpine Dairy', 'Amber Road Logistics', 'Arcadia Paper', 'Basalt Mining',
  'Blue Harbor Seafood', 'Carpathian Timber', 'Cobalt Instruments', 'Danube Chemicals',
  'Delta Ceramics', 'Eastwind Apparel', 'Elbe Packaging', 'Fjord Electronics', 'Granite Tools',
  'Hansa Beverages', 'Ionia Glassworks', 'Juniper Cosmetics', 'Kiel Shipyards', 'Lusatia Textiles',
  'Maritime Spares', 'Nordic Batteries', 'Oder Steelworks', 'Pannonia Foods', 'Quartz Optics',
  'Rhine Valley Wines', 'Saxon Motors', 'Thames Publishing', 'Umbria Olive Oil', 'Vistula Grain',
  'Wallonia Plastics', 'Yseult Perfumes', 'Zagreb Furniture',
];

export const CUSTOMER_DIRECTORY: Array<{ id: string; label: string }> = [
  ...new Set([...SHIPMENTS.map((s) => s.customer), ...EXTRA_CUSTOMERS]),
]
  .sort()
  .map((name) => ({ id: customerId(name), label: name }));

/**
 * §3.D — "labels for identifiers that no search result contains". A deep link carries
 * ids; a chip must show names. This is the resolution, and it is deliberately NOT the
 * search endpoint: the search can return nothing for an id the reader has selected.
 */
export const customerLabel = (id: string): string | undefined =>
  CUSTOMER_DIRECTORY.find((c) => c.id === id)?.label;

export class CustomerSearchError extends Error {}

/**
 * Stands in for a request to the source of truth. Deliberately asynchronous and
 * deliberately fallible: §3.D requires a loading state, a RETRYABLE error state and a
 * no-results state, and all three need something that can produce them.
 *
 * Typing "fail" is the prototype's way of producing the error state on demand — a demo
 * affordance, recorded in NOTES.md, not a behaviour a product would have.
 */
export function searchCustomers(
  query: string,
  { delay = 220 }: { delay?: number } = {},
): Promise<Array<{ id: string; label: string }>> {
  const n = query.trim().toLowerCase();
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (n.includes('fail')) {
        reject(new CustomerSearchError('The customer directory did not respond.'));
        return;
      }
      resolve(
        n
          ? CUSTOMER_DIRECTORY.filter((c) => c.label.toLowerCase().includes(n)).slice(0, 25)
          : CUSTOMER_DIRECTORY.slice(0, 25),
      );
    }, delay);
  });
}

/* --------------------------------------------------------------- chip presentation */

/** §5 — "is" for one value, "is any of" for two or more. It reflects the COUNT. */
export const operatorFor = (count: number): string => (count === 1 ? 'is' : 'is any of');

/**
 * §5 — the first selected value's label plus a +N badge. For a discriminated facet the
 * count spans all groups indistinguishably, and the group name never appears: a chip
 * says the FACET's name, or the reader believes there are more facets than there are
 * (failure #14).
 */
export function ruleSummary(
  facet: Facet,
  values: string[],
): { operator: string; first: string; extra: number } {
  const first = values[0];
  return {
    operator: operatorFor(values.length),
    first: valueLabel(facet, first),
    extra: values.length - 1,
  };
}

export function valueLabel(facet: Facet, valueId: string): string {
  if (facet.kind === 'open') return customerLabel(valueId) ?? valueId;
  return (facet.values ?? []).find((v) => v.id === valueId)?.label ?? valueId;
}

/** Every selected value's label, for the chip's title attribute (§5, long selections). */
export const allValueLabels = (facet: Facet, values: string[]): string =>
  values.map((v) => valueLabel(facet, v)).join(', ');
