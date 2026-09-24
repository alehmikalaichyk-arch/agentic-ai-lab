import { SHIPMENTS, type Shipment, type Status } from './data';
import {
  FACETS,
  MAX_VALUES_PER_FACET,
  applyFilters,
  customerId,
  facetById,
  matchesFilters,
  needsAttention,
  parseSelection,
  predicateFor,
  ruleSummary,
  toggleValue,
  type Selection,
} from './filters';

/*
 * The test obligations of §9 of the faceted-filtering spec.
 *
 * Each one is here because its absence is invisible: the screen demos correctly and
 * every other test stays green. Where a §9 item does not apply to a prototype that has
 * no data store and no pagination, it is named and explained rather than quietly
 * dropped — see the final describe block.
 */

const ids = (rows: Shipment[]): string[] => rows.map((s) => s.id).sort();
const filtered = (sel: Selection, query = ''): string[] => ids(applyFilters(SHIPMENTS, sel, query));

describe('§2 combination semantics', () => {
  it('an empty selection is the absence of a constraint, not a constraint matching nothing', () => {
    // Failure #6: getting this backwards turns "I cleared that filter" into an empty list.
    expect(filtered({})).toHaveLength(SHIPMENTS.length);
    expect(filtered({ status: [] })).toHaveLength(SHIPMENTS.length);
  });

  it('values inside one facet OR', () => {
    expect(filtered({ status: ['delayed', 'held'] })).toEqual([
      'WP-24064',
      'WP-24074',
      'WP-24077',
      'WP-24081',
    ]);
  });

  it('facets AND with each other and with the query', () => {
    expect(filtered({ status: ['delayed'], carrier: ['Northline'] })).toEqual(['WP-24074']);
    expect(filtered({ status: ['delayed'] }, 'kessler')).toEqual(['WP-24074']);
  });

  it('an impossible combination is a legitimate empty result, never auto-corrected', () => {
    // 'delivered' shipments are never 'Unscheduled' — the reader is entitled to see that
    // nothing satisfies both, rather than have one selection silently rewrite the other.
    expect(filtered({ status: ['delivered'], schedule: ['expected:none'] })).toEqual([]);
  });
});

describe('§9.1 a derived facet is pinned against its canonical rule', () => {
  /*
   * The derivation's only input is `status`, so "every combination" is the five statuses.
   * Written DIRECTLY onto synthetic records rather than relying on the fixture, per §9.1:
   * the fixture is a product of the prototype's own authoring and may not reach every
   * combination — and a class that happens to be empty makes a broken predicate pass.
   */
  const STATUSES: Status[] = ['transit', 'delivered', 'delayed', 'held', 'pending'];
  const base = SHIPMENTS[0];
  const probes: Shipment[] = STATUSES.map((status, i) => ({
    ...base,
    id: `PROBE-${i}`,
    status,
  }));

  it.each(STATUSES)('status %s is classified the same way by the facet and by the rule', (status) => {
    const probe = probes.find((p) => p.status === status)!;
    const expected = needsAttention(probe);
    // Through the real path: applyFilters, not a second copy of the rule in the test.
    const viaFacet = applyFilters(probes, { attention: ['needs-attention'] }).some(
      (s) => s.id === probe.id,
    );
    expect(viaFacet).toBe(expected);
  });

  it('every class is non-empty in the fixture, or the assertion above proves nothing', () => {
    const attention = applyFilters(probes, { attention: ['needs-attention'] });
    const onTrack = applyFilters(probes, { attention: ['on-track'] });
    expect(attention.length).toBeGreaterThan(0);
    expect(onTrack.length).toBeGreaterThan(0);
    expect(attention.length + onTrack.length).toBe(probes.length);
  });

  it('the two values partition the real fixture exactly', () => {
    expect(filtered({ attention: ['needs-attention'] })).toEqual([
      'WP-24064',
      'WP-24074',
      'WP-24077',
      'WP-24081',
    ]);
    expect(filtered({ attention: ['on-track' ] })).toHaveLength(SHIPMENTS.length - 4);
  });
});

describe('§9.2 the grouping around an OR-ed facet is load-bearing', () => {
  /*
   * Only one shape exercises it: a genuinely multi-valued facet PLUS a second AND-ed
   * facet. One facet with several values makes the group the whole condition; two facets
   * with one value each makes every group a single element.
   */
  const sel: Selection = { status: ['delayed', 'held'], carrier: ['Northline'] };

  it('returns exactly the records that satisfy both facets', () => {
    // Exact equality, not containment: the failure mode is EXTRA records, and a
    // containment assertion cannot see an extra record (§9.2, §9.3).
    expect(filtered(sel)).toEqual(['WP-24064', 'WP-24074']);
  });

  it('a flattened composition widens the result, and this shape detects it', () => {
    /*
     * The mutation, written out: `&&` binds tighter than `||` in JavaScript exactly as it
     * does in SQL, so folding the per-facet condition into one flat chain lets the first
     * facet escape the conjunction. This test exists to prove the assertion above can
     * actually see that — a suite whose filter tests are all single-facet stays green.
     */
    const status = facetById('status');
    const carrier = facetById('carrier');
    const flattened = (s: Shipment): boolean =>
      // intended:  carrier AND (delayed OR held)
      // written:  (carrier AND  delayed) OR held   ← "held" escapes the conjunction
      (carrier.predicate('Northline', s) && status.predicate('delayed', s)) ||
      status.predicate('held', s);

    const widened = ids(SHIPMENTS.filter(flattened));
    expect(widened).toEqual(['WP-24064', 'WP-24074', 'WP-24077']);
    // WP-24077 is a TransEuro shipment: the reader filtered carriers down to Northline
    // and it came back anyway. No error, valid code, plausible-looking list.
    expect(widened).not.toEqual(filtered(sel));
    expect(widened.length).toBeGreaterThan(filtered(sel).length);
  });
});

describe('§9.4 the discriminated facet gates on its discriminant', () => {
  it('a record of the wrong class is not returned by a class-labelled value', () => {
    // Failure #3. WP-24079 is in transit with an eta of "Today 11:15"; without the gate
    // it satisfies the Delivered group's "Today" and appears under a delivered label.
    const deliveredToday = filtered({ schedule: ['delivered:today'] });
    expect(deliveredToday).toEqual(['WP-24075']);
    expect(deliveredToday).not.toContain('WP-24079');
  });

  it('the expected group keeps its own "Today" separate', () => {
    expect(filtered({ schedule: ['expected:today'] })).toEqual([
      'WP-24059',
      'WP-24072',
      'WP-24074',
      'WP-24079',
      'WP-24081',
    ]);
  });

  it('a record with no eta is returned by the value it canonically falls back to', () => {
    // Failure #4: the list displays a missing eta as a dash, and the facet calls that
    // "Unscheduled". If the predicate omits the absent case the filter hides exactly the
    // records the reader opened it to find.
    expect(filtered({ schedule: ['expected:none'] })).toEqual(['WP-24064', 'WP-24077']);
  });

  it('and is not returned by any other value of that sub-vocabulary', () => {
    for (const value of ['expected:today', 'expected:tomorrow']) {
      expect(filtered({ schedule: [value] })).not.toContain('WP-24077');
    }
  });

  it('a cross-group selection returns the UNION, not nothing', () => {
    // Failure #2, the one that appears when the two sub-vocabularies are implemented as
    // two AND-ed conditions: no record belongs to both classes, so the list empties.
    expect(filtered({ schedule: ['expected:tomorrow', 'delivered:yesterday'] })).toEqual([
      'WP-24061',
      'WP-24066',
      'WP-24068',
      'WP-24070',
    ]);
  });
});

describe('§3.E the sentinel value', () => {
  it('matches the records whose attribute is absent', () => {
    expect(filtered({ driver: ['unassigned'] })).toEqual(['WP-24064', 'WP-24068', 'WP-24077']);
  });

  it('composes with named values by OR, in one selection', () => {
    expect(filtered({ driver: ['unassigned', 'J. Berg'] })).toEqual([
      'WP-24064',
      'WP-24068',
      'WP-24077',
      'WP-24079',
    ]);
  });
});

describe('§9.3 negative assertions are discriminating', () => {
  it('every facet excludes something — a predicate that matched everything would fail here', () => {
    for (const facet of FACETS) {
      const value =
        facet.kind === 'open'
          ? customerId(SHIPMENTS[0].customer)
          : facet.values![0].id;
      const rows = applyFilters(SHIPMENTS, { [facet.id]: [value] } as Selection);
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.length).toBeLessThan(SHIPMENTS.length);
    }
  });
});

describe('§6 / §8.4 / §8.5 parsing, caps, deduplication and refusal', () => {
  it('drops unrecognised values at the UI-facing layer rather than erroring', () => {
    expect(parseSelection({ status: ['delayed', 'not-a-status'] })).toEqual({ status: ['delayed'] });
    expect(parseSelection({ 'not-a-facet': ['x'] })).toEqual({});
  });

  it('drops a facet that ends up with nothing, so no empty rule can exist', () => {
    expect(parseSelection({ status: ['nonsense'] })).toEqual({});
  });

  it('deduplicates repeated values', () => {
    // §8.4: idempotent, so it cannot change a result — it exists to stop amplification.
    expect(parseSelection({ carrier: ['Northline', 'Northline', 'Northline'] })).toEqual({
      carrier: ['Northline'],
    });
  });

  it('caps the number of values per facet', () => {
    const many = Array.from({ length: MAX_VALUES_PER_FACET + 10 }, (_, i) => `city-${i}`);
    const real = ['Berlin', 'Prague', 'Milan'];
    const parsed = parseSelection({ city: [...real, ...many] });
    expect(parsed.city!.length).toBeLessThanOrEqual(MAX_VALUES_PER_FACET);
    expect(parsed.city).toEqual(real);
  });

  it('resolves open-facet ids and rejects ones the directory does not know', () => {
    expect(parseSelection({ customer: ['helix-labs', 'ghost-corp'] })).toEqual({
      customer: ['helix-labs'],
    });
  });

  it('REFUSES an unknown value at the data-facing layer instead of dropping it', () => {
    // Failure #12: a dropped condition widens the result set with nothing on screen
    // saying so. Different layer, different correct answer.
    expect(() => predicateFor('status', 'not-a-status')).toThrow(/Unknown value/);
    expect(predicateFor('status', 'delayed')(SHIPMENTS[0])).toBe(true);
  });
});

describe('§4 interaction invariants that live in the model', () => {
  it('toggling edits the one rule a facet has (§4.4)', () => {
    let sel: Selection = {};
    sel = toggleValue(sel, 'status', 'delayed');
    sel = toggleValue(sel, 'status', 'held');
    expect(sel.status).toEqual(['delayed', 'held']);
  });

  it('deselecting the last value removes the rule entirely (§4.5)', () => {
    let sel: Selection = toggleValue({}, 'status', 'delayed');
    sel = toggleValue(sel, 'status', 'delayed');
    expect(sel).toEqual({});
    expect('status' in sel).toBe(false);
  });
});

describe('§5 chip presentation', () => {
  it('reads "is" for one value and "is any of" for several', () => {
    const facet = facetById('status');
    expect(ruleSummary(facet, ['delayed']).operator).toBe('is');
    expect(ruleSummary(facet, ['delayed', 'held']).operator).toBe('is any of');
  });

  it('shows the first value and a +N badge for the rest', () => {
    const summary = ruleSummary(facetById('status'), ['delayed', 'held', 'pending']);
    expect(summary.first).toBe('Delayed');
    expect(summary.extra).toBe(2);
  });

  it('never exposes a group name for a discriminated facet (failure #14)', () => {
    const facet = facetById('schedule');
    const summary = ruleSummary(facet, ['delivered:yesterday', 'expected:today']);
    expect(summary.first).toBe('Yesterday');
    expect(summary.first).not.toMatch(/delivered|expected/i);
    expect(summary.extra).toBe(1);
  });
});

describe('§9.6 non-regressions', () => {
  it('the free-text query still matches every field it matched before facets existed', () => {
    // Failure #18: filtering work routinely reimplements search from a mock that shows
    // fewer fields than production has.
    expect(filtered({}, 'WP-24081')).toEqual(['WP-24081']); // id
    expect(filtered({}, 'baltic')).toEqual(['WP-24064', 'WP-24079']); // customer
    expect(filtered({}, 'PO-88213')).toEqual(['WP-24081']); // reference
  });

  it('the count describes the filtered set, with filtered and unfiltered differing', () => {
    const sel: Selection = { carrier: ['AlpTrans'] };
    expect(applyFilters(SHIPMENTS, sel).length).toBe(2);
    expect(applyFilters(SHIPMENTS, sel).length).not.toBe(SHIPMENTS.length);
  });

  it('a query and a facet narrow together rather than replacing one another', () => {
    expect(matchesFilters(SHIPMENTS[0], { status: ['delayed'] }, 'nordvik')).toBe(true);
    expect(matchesFilters(SHIPMENTS[0], { status: ['held'] }, 'nordvik')).toBe(false);
  });
});

/*
 * §9 items that do not apply here, named rather than silently skipped:
 *
 *   §9.5 "values are bound, not interpolated" — there is no query text to inspect. The
 *        half that DOES apply, deduplication, is asserted above.
 *   §9.7 deterministic pagination — this list has no pagination; `applyFilters` preserves
 *        the fixture's order, and there is no page boundary for a record to straddle.
 *   §9.6 "sort and page size survive a filter change" — the screen has neither control.
 *
 * If this prototype ever grows a real backend, these three become required rather than
 * not-applicable, and §8.2/§8.3 turn from prose in filters.ts into obligations.
 */
