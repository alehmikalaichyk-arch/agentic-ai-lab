import * as React from 'react';
import {
  AlertTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListFilterIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/ui-staging/badge';
import { Button } from '@/ui-staging/button';
import { Checkbox } from '@/ui-staging/checkbox';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui-staging/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui-staging/popover';
import { Separator } from '@/ui-staging/separator';
import { Spinner } from '@/ui-staging/spinner';
import {
  CustomerSearchError,
  FACETS,
  activeFacetCount,
  allValueLabels,
  clearFacet,
  customerLabel,
  facetById,
  hasAnySelection,
  ruleSummary,
  searchCustomers,
  selectedValues,
  toggleValue,
  valueLabel,
  type Facet,
  type FacetId,
  type Selection,
} from './filters';

/*
 * The filter bar — §4 (interaction), §5 (rule chips), §3.D (the open facet's three
 * states). Step 3 of the spec's §11 order, kept domain-agnostic where it can be: every
 * component below takes facet and value descriptors and knows nothing about shipments.
 *
 * The interaction rules that are easiest to break, and where each one lives:
 *   §4.1 filters apply immediately — there is no Apply button anywhere in this file.
 *   §4.2 the popover stays open after a toggle — nothing here closes it on select.
 *   §4.3 focus does not move — the option IS the button that was clicked.
 *   §4.9 the trigger counts facets, never values, never the query.
 *   §4.10 "Clear filters" does not touch the query; the combined control lives in the
 *         empty state and says so.
 *   §4.11 Escape closes and returns focus to the trigger — Popover's own behaviour.
 */

/* --------------------------------------------------------------- option rows */

function OptionRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  /*
   * A <label> wrapping the checkbox, NOT a <button> containing one. The first version
   * was a button, and Radix's Checkbox renders a button of its own — nested buttons,
   * which React reported as a hydration error in the console and which no test asserted
   * on. Found by opening the popover and reading the console.
   *
   * §4.3 still holds: clicking the label moves focus to the control inside it, so focus
   * lands on the option that was toggled and keyboard selection of several values works.
   */
  return (
    <label className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-surface-neutral-subtle">
      <Checkbox checked={checked} onCheckedChange={onToggle} />
      <span className="truncate">{label}</span>
    </label>
  );
}

/* ------------------------------------------------------- open facet (§3.D) */

type Option = { id: string; label: string };

function OpenFacetOptions({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (valueId: string) => void;
}) {
  const [query, setQuery] = React.useState('');
  const [options, setOptions] = React.useState<Option[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'error' | 'ready'>('loading');
  // Stale-response guard: a slow answer to an earlier query must never overwrite a later
  // one (§3.D, last bullet).
  const requestRef = React.useRef(0);
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    const id = ++requestRef.current;
    setStatus('loading');
    const timer = setTimeout(() => {
      searchCustomers(query)
        .then((rows) => {
          if (id !== requestRef.current) return;
          setOptions(rows);
          setStatus('ready');
        })
        .catch((err) => {
          if (id !== requestRef.current) return;
          if (err instanceof CustomerSearchError) setStatus('error');
        });
    }, 180); // debounce
    return () => clearTimeout(timer);
  }, [query, attempt]);

  // §3.D — selected values stay visible while the reader searches for others. Dropping a
  // selection because it fell out of the current result page is silent (failure #9).
  const pinned = selected.filter((id) => !options.some((o) => o.id === id));

  return (
    <div className="grid gap-2">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        {/* No autoFocus: Popover already moves focus into its content on open, so the
            attribute is redundant here and jsx-a11y flags it. */}
        <InputGroupInput
          aria-label="Search customers"
          placeholder="Search customers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </InputGroup>

      {pinned.length > 0 ? (
        <>
          <div className="grid">
            {pinned.map((id) => (
              <OptionRow
                key={id}
                label={customerLabel(id) ?? id}
                checked
                onToggle={() => onToggle(id)}
              />
            ))}
          </div>
          <Separator />
        </>
      ) : null}

      <div className="max-h-56 overflow-y-auto">
        {/* Three distinct states. An error rendered as an empty list reads as "no such
            customer", which is a different and wrong statement (failure #11). */}
        {status === 'loading' ? (
          <div className="flex items-center gap-2 px-2 py-6 text-sm text-fg-subtle">
            <Spinner className="size-4" />
            Searching…
          </div>
        ) : status === 'error' ? (
          <div className="grid gap-2 px-2 py-4 text-sm">
            <p className="flex items-center gap-2 text-fg-status-danger">
              <AlertTriangleIcon className="size-4" />
              The customer directory did not respond.
            </p>
            <Button variant="outline" size="sm" onClick={() => setAttempt((a) => a + 1)}>
              Try again
            </Button>
          </div>
        ) : options.length === 0 ? (
          <p className="px-2 py-6 text-sm text-fg-subtle">No customer matches “{query}”.</p>
        ) : (
          options.map((o) => (
            <OptionRow
              key={o.id}
              label={o.label}
              checked={selected.includes(o.id)}
              onToggle={() => onToggle(o.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------- facet value list */

function FacetValues({
  facet,
  selected,
  onToggle,
}: {
  facet: Facet;
  selected: string[];
  onToggle: (valueId: string) => void;
}) {
  if (facet.kind === 'open') {
    return <OpenFacetOptions selected={selected} onToggle={onToggle} />;
  }

  // §3.C — groups are a presentation grouping and a query-level union, nothing else.
  // The reader sees headings; the reader does not see a second filter.
  if (facet.groups) {
    return (
      <div className="max-h-72 overflow-y-auto">
        {facet.groups.map((group) => (
          <div key={group.id} className="mb-1">
            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-fg-subtlest">
              {group.label}
            </p>
            {(facet.values ?? [])
              .filter((v) => v.group === group.id)
              .map((v) => (
                <OptionRow
                  key={v.id}
                  label={v.label}
                  checked={selected.includes(v.id)}
                  onToggle={() => onToggle(v.id)}
                />
              ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-h-72 overflow-y-auto">
      {(facet.values ?? []).map((v) => (
        <OptionRow
          key={v.id}
          label={v.label}
          checked={selected.includes(v.id)}
          onToggle={() => onToggle(v.id)}
        />
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- the popover */

/*
 * The facet picker, hung off whichever control opened it.
 *
 * TWO controls open it now — the "Filters" button and the "+" on the rule panel — and
 * Radix allows one trigger per Popover root. So the trigger is a prop and the component
 * is mounted twice, sharing `openFacet` so the two never disagree about which facet is
 * being shown. Each keeps its own open flag, because each anchors its own panel.
 */
function FilterPopover({
  sel,
  onChange,
  openFacet,
  setOpenFacet,
  open,
  setOpen,
  trigger,
}: {
  sel: Selection;
  onChange: (next: Selection) => void;
  openFacet: FacetId | null;
  setOpenFacet: (id: FacetId | null) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  trigger: React.ReactNode;
}) {
  const facet = openFacet ? facetById(openFacet) : null;

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        // §4.8 — dismissal is not cancellation. Selections are already applied; only the
        // navigation state resets.
        if (!v) setOpenFacet(null);
      }}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2">
        {facet === null ? (
          <div role="menu" aria-label="Choose a filter">
            {FACETS.map((f) => {
              const n = selectedValues(sel, f.id).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setOpenFacet(f.id)}
                  className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-surface-neutral-subtle"
                >
                  <span>{f.label}</span>
                  <span className="flex items-center gap-1 text-fg-subtle">
                    {n > 0 ? <span className="text-xs tabular-nums">{n}</span> : null}
                    <ChevronRightIcon className="size-4" />
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-2" aria-label={`${facet.label} values`}>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Back to all filters"
                onClick={() => setOpenFacet(null)}
              >
                <ChevronLeftIcon />
              </Button>
              <span className="text-sm font-medium">{facet.label}</span>
              {selectedValues(sel, facet.id).length > 0 ? (
                <Button
                  variant="ghost"
                  size="xs"
                  className="ml-auto"
                  onClick={() => onChange(clearFacet(sel, facet.id))}
                >
                  Clear
                </Button>
              ) : null}
            </div>
            <FacetValues
              facet={facet}
              selected={selectedValues(sel, facet.id)}
              // §4.2 / §4.3: this updates the selection and does nothing else — the
              // popover is not closed and focus is not moved.
              onToggle={(valueId) => onChange(toggleValue(sel, facet.id, valueId))}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

/* --------------------------------------------------------------- rule chips */

function RuleChip({
  facet,
  values,
  onOpen,
  onRemove,
}: {
  facet: Facet;
  values: string[];
  onOpen: () => void;
  onRemove: () => void;
}) {
  const { operator, first, extra } = ruleSummary(facet, values);
  return (
    <span className="inline-flex max-w-full items-stretch overflow-hidden rounded-md border border-outline-default bg-surface-default text-xs">
      {/* The FACET's name — never a group name, never the stored attribute (§5). */}
      <span className="flex items-center px-2 py-1 font-medium text-fg-default">{facet.label}</span>
      <span className="flex items-center border-x border-outline-default px-2 py-1 text-fg-subtle">
        {operator}
      </span>
      <button
        type="button"
        onClick={onOpen}
        title={allValueLabels(facet, values)}
        className="flex min-w-0 items-center gap-1 px-2 py-1 hover:bg-surface-neutral-subtle"
      >
        <span className="truncate">{first}</span>
        {extra > 0 ? <span className="shrink-0 text-fg-subtle">+{extra}</span> : null}
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${facet.label} filter`}
        className="flex shrink-0 items-center border-l border-outline-default px-1.5 hover:bg-surface-neutral-subtle"
      >
        <XIcon className="size-3.5" />
      </button>
    </span>
  );
}

/* ------------------------------------------------------------------- the bar */

export function FilterBar({
  sel,
  onChange,
  leading,
  trailing,
  className,
}: {
  sel: Selection;
  onChange: (next: Selection) => void;
  /** The free-text field. Passed in so the bar owns the whole toolbar's layout. */
  leading?: React.ReactNode;
  /** The result count. Same reason. */
  trailing?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [openFacet, setOpenFacet] = React.useState<FacetId | null>(null);
  const count = activeFacetCount(sel);

  const openFor = (id: FacetId) => {
    setOpenFacet(id);
    setOpen(true);
  };

  /*
   * The rule row is its own PANEL, not a bare row: the page surface is grey, so the
   * rules sit on surface-default with a border, the way the reference screen does it.
   *
   * It carries three things, left to right: the chips, a "+" that opens the same facet
   * picker as the toolbar button, and "Clear filters" pinned to the right edge.
   *
   * §4.6 still holds — the whole panel is absent when no facet has a selection, so the
   * "+" and the clear control come and go with it rather than sitting on an empty strip.
   */
  return (
    <div className={cn('grid gap-2', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {leading}
        <FilterPopover
          sel={sel}
          onChange={onChange}
          openFacet={openFacet}
          setOpenFacet={setOpenFacet}
          open={open}
          setOpen={setOpen}
          trigger={
            <Button variant="outline">
              <ListFilterIcon />
              Filters
              {/* §4.9 — facets with a selection, not values, and never the query. */}
              {count > 0 ? <Badge variant="secondary">{count}</Badge> : null}
            </Button>
          }
        />
        {trailing ? <div className="ml-auto">{trailing}</div> : null}
      </div>

      {hasAnySelection(sel) ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-outline-default bg-surface-default p-2">
          {FACETS.filter((f) => selectedValues(sel, f.id).length > 0).map((f) => (
            <RuleChip
              key={f.id}
              facet={f}
              values={selectedValues(sel, f.id)}
              onOpen={() => openFor(f.id)}
              onRemove={() => onChange(clearFacet(sel, f.id))}
            />
          ))}

          {/* The second way in. It opens at the facet list, never at a facet — adding a
              rule is a different intent from editing the one a chip already shows. */}
          <FilterPopover
            sel={sel}
            onChange={onChange}
            openFacet={openFacet}
            setOpenFacet={setOpenFacet}
            open={addOpen}
            setOpen={(v) => {
              if (v) setOpenFacet(null);
              setAddOpen(v);
            }}
            trigger={
              <Button variant="outline" size="icon-xs" aria-label="Add a filter">
                <PlusIcon />
              </Button>
            }
          />

          {/* §4.10 — clears the facets and leaves the free-text query alone. */}
          <Button variant="link" size="sm" className="ml-auto" onClick={() => onChange({})}>
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export { valueLabel };
