import * as React from 'react';
import {
  AlertTriangleIcon,
  CalendarDaysIcon,
  InboxIcon,
  MessageSquareIcon,
  PackageIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SearchXIcon,
  TruckIcon,
  XIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Badge } from '@/ui-staging/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/ui-staging/breadcrumb';
import { Button } from '@/ui-staging/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ui-staging/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/ui-staging/empty';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/ui-staging/input-group';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/ui-staging/sidebar';
import { Skeleton } from '@/ui-staging/skeleton';
import { Toaster } from '@/ui-staging/sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui-staging/table';
import { ToggleGroup, ToggleGroupItem } from '@/ui-staging/toggle-group';

import { FilterBar } from './filter-bar';
import { applyFilters, type Selection } from './filters';
import {
  SHIPMENTS,
  STATUS_LABEL,
  STATUS_TOKENS,
  TODAY_LABEL,
  eventsFor,
  type DemoState,
  type Route,
  type Shipment,
  type ShipmentsRoute,
  type Status,
} from './data';

/*
 * Waypoint — a dispatcher's tracking app, rebuilt from reference.html on the staging
 * tier. A prototype, not a component: read NOTES.md for the question it answers.
 *
 * The one rule held throughout: no colour, radius or type value from the reference is
 * carried over. Everything is either a staging component as shipped or a DS token.
 * Where the reference and the design system disagree, the design system wins and the
 * difference is listed in NOTES.md — that list is the output worth keeping.
 */

type Go = (route: Route) => void;

/* ------------------------------------------------------------------ status badge */

/* Composed, not a variant: Badge ships no status tones. This is the second prototype in
 * this repository to build the same thing (status-board was the first) — see NOTES.md. */
export function StatusBadge({ status }: { status: Status }) {
  const t = STATUS_TOKENS[status];
  return (
    <Badge variant="ghost" className={cn('gap-1.5 px-2.5', t.surface, t.fg)}>
      <span aria-hidden="true" className={cn('size-1.5 rounded-full', t.dot)} />
      {STATUS_LABEL[status]}
    </Badge>
  );
}

/* ----------------------------------------------------------------------- shell */

const NAV: Array<{ screen: Route['screen']; label: string; icon: React.ElementType }> = [
  { screen: 'today', label: 'Today', icon: CalendarDaysIcon },
  { screen: 'shipments', label: 'Shipments', icon: PackageIcon },
  { screen: 'problems', label: 'Problem cases', icon: AlertTriangleIcon },
  { screen: 'messages', label: 'Messages', icon: MessageSquareIcon },
  { screen: 'new', label: 'New shipment', icon: PlusIcon },
];

const problemCount = SHIPMENTS.filter((s) => s.status === 'delayed' || s.status === 'held').length;

function Shell({
  route,
  go,
  children,
  footer,
}: {
  route: Route;
  go: Go;
  children: React.ReactNode;
  /** Pinned to the bottom of the content column. Used by the Demo bar. */
  footer?: React.ReactNode;
}) {
  // Details belongs to Shipments in the nav, as it does in the reference.
  const active = route.screen === 'details' ? 'shipments' : route.screen;
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <button
            type="button"
            onClick={() => go({ screen: 'today' })}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left"
          >
            <span className="grid size-7 place-items-center rounded-md bg-surface-brand-bold text-fg-inverse">
              <TruckIcon className="size-4" aria-hidden="true" />
            </span>
            <span className="text-md font-semibold text-fg-default">Waypoint</span>
          </button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map((n) => (
                  <SidebarMenuItem key={n.screen}>
                    <SidebarMenuButton
                      isActive={active === n.screen}
                      onClick={() => go({ screen: n.screen } as Route)}
                    >
                      <n.icon />
                      {n.label}
                    </SidebarMenuButton>
                    {n.screen === 'problems' ? (
                      <SidebarMenuBadge className="bg-surface-accent-red-subtlest text-fg-accent-red-boldest">
                        {problemCount}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <p className="px-2 text-xs text-fg-subtlest">Demo data · Prototype, not a product</p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-surface-page">
        <header className="flex h-12 items-center gap-2 border-b border-outline-default bg-surface-default px-4 md:hidden">
          <SidebarTrigger />
          <span className="text-sm font-medium">Waypoint</span>
        </header>
        {/* A div, not <main>: SidebarInset already renders the page's <main>, and a
            second one nested inside it is a duplicate landmark. */}
        <div className="mx-auto w-full max-w-6xl flex-1 p-6 md:p-8">{children}</div>
        {footer}
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}

function PageHeader({
  title,
  sub,
  actions,
  above,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
  above?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {above}
        <h1 className="flex items-center gap-3 text-2xl font-semibold text-fg-default">
          {title}
        </h1>
        {sub ? <p className="mt-1 text-sm text-fg-subtle">{sub}</p> : null}
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </div>
  );
}

const NewShipmentButton = ({ go }: { go: Go }) => (
  <Button onClick={() => go({ screen: 'new' })}>
    <PlusIcon />
    New shipment
  </Button>
);

/* ---------------------------------------------------------------------- states */

function LoadingBlock() {
  return (
    <Card aria-busy="true" aria-label="Loading shipments">
      <CardContent className="grid gap-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function StateBlock({ state, go }: { state: DemoState; go: Go }) {
  if (state === 'loading') return <LoadingBlock />;
  if (state === 'error')
    return (
      <Card className="border-outline-status-danger">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertTriangleIcon />
            </EmptyMedia>
            <EmptyTitle>Couldn’t load shipments</EmptyTitle>
            <EmptyDescription>The tracking service didn’t respond (timeout after 10s).</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={() => toast('Retrying…')}>
              <RefreshCwIcon />
              Try again
            </Button>
          </EmptyContent>
        </Empty>
      </Card>
    );
  if (state === 'empty')
    return (
      <Card>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon />
            </EmptyMedia>
            <EmptyTitle>No shipments yet</EmptyTitle>
            <EmptyDescription>Shipments appear here once the first order is booked.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NewShipmentButton go={go} />
          </EmptyContent>
        </Empty>
      </Card>
    );
  return null;
}

function NothingMatches({ onClear, what }: { onClear: () => void; what: React.ReactNode }) {
  return (
    <Card>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>Nothing matches</EmptyTitle>
          <EmptyDescription>{what} Try clearing a filter.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={onClear}>
            Clear filters and search
          </Button>
        </EmptyContent>
      </Empty>
    </Card>
  );
}

/* ----------------------------------------------------------------------- table */

/*
 * The reference makes the whole <tr> clickable. That is mouse-only — a row is not
 * focusable and has no key handling — so the shipment id is the link here, and the row
 * only carries the hover. Same destination, reachable by Tab.
 */
function ShipmentTable({
  rows,
  go,
  back,
}: {
  rows: Shipment[];
  go: Go;
  /** The list state to return to. Omitted on Today, which is not the list. */
  back?: ShipmentsRoute;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-6">Shipment</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead className="hidden md:table-cell">Route</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="pr-6">ETA</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((s) => (
          <TableRow key={s.id}>
            <TableCell className="pl-6">
              <Button
                variant="link"
                className="h-auto p-0 font-semibold tabular-nums text-fg-default"
                onClick={() => go({ screen: 'details', id: s.id, back })}
              >
                {s.id}
              </Button>
            </TableCell>
            <TableCell>{s.customer}</TableCell>
            <TableCell className="hidden text-fg-subtle md:table-cell">
              {[s.from, ...s.via, s.to].join(' → ')}
            </TableCell>
            <TableCell>
              <StatusBadge status={s.status} />
            </TableCell>
            <TableCell
              className={cn(
                'pr-6 tabular-nums',
                s.etaLate && 'font-medium text-fg-status-danger',
              )}
            >
              {s.eta}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/* ----------------------------------------------------------------------- today */

function Stat({
  label,
  value,
  hint,
  alert,
}: {
  label: string;
  value: number;
  hint: string;
  alert?: boolean;
}) {
  return (
    <Card className="gap-1 py-5">
      <CardHeader className="px-5">
        <CardDescription className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </CardDescription>
        <CardTitle
          className={cn(
            'text-3xl font-semibold tabular-nums',
            alert && 'text-fg-status-danger',
          )}
        >
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 text-xs text-fg-subtle">{hint}</CardContent>
    </Card>
  );
}

export function TodayScreen({ state, go }: { state: DemoState; go: Go }) {
  const by = (st: Status) => SHIPMENTS.filter((s) => s.status === st);
  const delayed = by('delayed');
  const held = by('held');
  const transit = by('transit');
  const delivered = by('delivered');
  const attention = [...delayed, ...held];

  const block = StateBlock({ state, go });

  return (
    <>
      <PageHeader
        title="Today"
        sub={`${TODAY_LABEL} · ${SHIPMENTS.length} active shipments`}
        actions={<NewShipmentButton go={go} />}
      />
      {block ?? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Delayed" value={delayed.length} hint="need a new ETA" alert />
            <Stat label="On hold" value={held.length} hint="waiting on documents" />
            <Stat label="In transit" value={transit.length} hint="on schedule" />
            <Stat
              label="Delivered today"
              value={delivered.filter((s) => s.eta.startsWith('Today')).length}
              hint={`of ${delivered.length} this week`}
            />
          </div>
          <Card className="gap-0 pb-0">
            <CardHeader className="border-b border-outline-default pb-4">
              <CardTitle className="text-md">Needs attention</CardTitle>
              <CardDescription>Delayed or on hold — each one is waiting on you.</CardDescription>
              <CardAction>
                <Button variant="outline" size="sm" onClick={() => go({ screen: 'problems' })}>
                  Open queue
                </Button>
              </CardAction>
            </CardHeader>
            <ShipmentTable rows={attention} go={go} />
          </Card>
        </>
      )}
    </>
  );
}

/* ------------------------------------------------------------------- shipments */

export function ShipmentsScreen({
  state,
  go,
  initial,
}: {
  state: DemoState;
  go: Go;
  /** The list state this screen was entered with — a deep link, or a return trip. */
  initial?: { q?: string; sel?: Selection };
}) {
  const [q, setQ] = React.useState(initial?.q ?? '');
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [sel, setSel] = React.useState<Selection>(initial?.sel ?? {});

  // §2 / §8.1 — one composition, defined in filters.ts and pinned by filters.test.ts.
  const list = applyFilters(SHIPMENTS, sel, q);

  // §4.10 — the bar's own "Clear filters" leaves the query alone. This combined reset is
  // offered only in the empty state, and its label says that it clears both.
  const clearEverything = () => {
    setSel({});
    setQ('');
  };

  // The list state as a route, so a row click carries it into the detail view and the
  // breadcrumb carries it back (§6).
  const here: ShipmentsRoute = { screen: 'shipments', q: q || undefined, sel };

  // `empty-filtered` is forced by the demo switch; otherwise it is whatever the filters produce.
  const forcedNoMatch = state === 'empty-filtered';
  const block = StateBlock({ state, go });

  return (
    <>
      <PageHeader
        title="Shipments"
        sub="Everything booked, in motion, or delivered this week"
        actions={<NewShipmentButton go={go} />}
      />

      <FilterBar
        className="mb-4"
        sel={sel}
        onChange={setSel}
        leading={
          <InputGroup className="w-full sm:w-72">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              ref={searchRef}
              aria-label="Search shipments"
              placeholder="Search by ID, customer or PO…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {/* Only while there is something to clear — an always-visible × on an empty
                field is a control that does nothing. */}
            {q ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label="Clear search"
                  onClick={() => {
                    setQ('');
                    searchRef.current?.focus();
                  }}
                >
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>
        }
        trailing={
          /* §4.13 — a filter change moves this number, and it is announced. */
          <span className="text-sm tabular-nums text-fg-subtle" aria-live="polite">
            {list.length} of {SHIPMENTS.length}
          </span>
        }
      />

      {block ??
        (forcedNoMatch || list.length === 0 ? (
          /*
           * §4.12 — "nothing matched your filters" and "there is nothing here" are
           * different statements. The demo's `empty` state is the second; this is the
           * first, and only this one offers the reset.
           */
          <NothingMatches
            onClear={clearEverything}
            what={
              forcedNoMatch ? (
                <>
                  No <strong>held</strong> shipments going to <strong>Berlin</strong>.
                </>
              ) : (
                'No shipment fits every filter above.'
              )
            }
          />
        ) : (
          <Card className="py-0">
            <ShipmentTable rows={list} go={go} back={here} />
          </Card>
        ))}
    </>
  );
}

/* --------------------------------------------------------------------- details */

const stub = (what: string) => () => toast(`${what} is not built yet`);

function RoutePath({ s }: { s: Shipment }) {
  const points = [s.from, ...s.via, s.to];
  const pos =
    s.status === 'delivered'
      ? points.length
      : s.status === 'pending'
        ? 0
        : s.status === 'held'
          ? 1
          : Math.min(1, points.length - 1);
  return (
    <ol className="flex flex-wrap items-center gap-2 text-md">
      {points.map((p, i) => {
        const passed = i < pos;
        const current = i === pos;
        return (
          <li key={`${p}-${i}`} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn(
                'size-2.5 rounded-full border-2',
                passed && 'border-surface-accent-green-bold bg-surface-accent-green-bold',
                current && 'border-surface-accent-blue-bold bg-surface-accent-blue-bold',
                !passed && !current && 'border-outline-strong',
              )}
            />
            <span className={cn(current && 'font-semibold')}>
              {p}
              {passed ? <span className="sr-only"> (passed)</span> : null}
              {current ? <span className="sr-only"> (current)</span> : null}
            </span>
            {i < points.length - 1 ? (
              <span aria-hidden="true" className="text-fg-subtlest">
                →
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function Timeline({ s }: { s: Shipment }) {
  return (
    <ol className="divide-y divide-outline-default">
      {eventsFor(s).map((e, i) => (
        <li key={i} className="grid grid-cols-[20px_1fr] gap-3 py-3">
          <span
            aria-hidden="true"
            className={cn(
              'mt-1.5 size-2.5 justify-self-center rounded-full',
              e.kind === 'warn' && 'bg-surface-accent-red-bold',
              e.kind === 'ok' && 'bg-surface-accent-green-bold',
              e.kind === '' && 'bg-surface-neutral-boldest',
            )}
          />
          <div>
            <p className="text-sm text-fg-default">{e.text}</p>
            <p className="mt-0.5 text-xs text-fg-subtle">{e.t}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function DetailsScreen({ id, go, back }: { id: string; go: Go; back?: ShipmentsRoute }) {
  const s = SHIPMENTS.find((x) => x.id === id);

  const crumbs = (
    <Breadcrumb className="mb-2">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <button type="button" onClick={() => go(back ?? { screen: 'shipments' })}>
              Shipments
            </button>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{id}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );

  if (!s)
    return (
      <>
        <PageHeader above={crumbs} title="Shipment not found" sub={id} />
        <Card>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No shipment with this ID</EmptyTitle>
              <EmptyDescription>It may have been archived, or the link is wrong.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => go(back ?? { screen: 'shipments' })}>
                Back to shipments
              </Button>
            </EmptyContent>
          </Empty>
        </Card>
      </>
    );

  const details: Array<[string, React.ReactNode, boolean?]> = [
    ['Customer', s.customer],
    ['Reference', s.ref, true],
    ['Carrier', s.carrier],
    ['Driver', s.driver],
    ['Weight', s.weight, true],
    ['Pallets', s.pallets, true],
    ['Origin', s.from],
    ['Destination', s.to],
  ];

  return (
    <>
      <PageHeader
        above={crumbs}
        title={
          <>
            <span className="tabular-nums">{s.id}</span>
            <StatusBadge status={s.status} />
          </>
        }
        sub={`${s.customer} · ${s.ref}`}
        actions={
          <>
            <Button variant="outline" onClick={stub('Message thread')}>
              <MessageSquareIcon />
              Message driver
            </Button>
            <Button variant="outline" onClick={stub('Editing')}>
              Edit
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Route</CardTitle>
              <CardAction className="text-sm text-fg-subtle">
                ETA{' '}
                <strong
                  className={cn('tabular-nums', s.etaLate ? 'text-fg-status-danger' : 'text-fg-default')}
                >
                  {s.eta}
                </strong>
              </CardAction>
            </CardHeader>
            <CardContent>
              <RoutePath s={s} />
              {s.notes ? <p className="mt-3 text-sm text-fg-subtle">{s.notes}</p> : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline s={s} />
            </CardContent>
          </Card>
        </div>

        <Card className="self-start">
          <CardHeader>
            <CardTitle className="text-md">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-3 text-sm">
              {details.map(([k, v, num]) => (
                <React.Fragment key={k}>
                  <dt className="text-fg-subtle">{k}</dt>
                  <dd className={cn('text-fg-default', num && 'tabular-nums')}>{v}</dd>
                </React.Fragment>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

/* ----------------------------------------------------------------------- stubs */

const STUBS: Record<'problems' | 'messages' | 'new', { title: string; note: string }> = {
  problems: {
    title: 'Problem cases',
    note: 'Queue of delayed and held shipments with row actions. The next feature to add.',
  },
  messages: {
    title: 'Messages',
    note: 'Thread per shipment between dispatcher and driver. A third layout type — not built yet.',
  },
  new: {
    title: 'New shipment',
    note: 'Booking form: customer, route, cargo, pickup window. Not built yet.',
  },
};

function StubScreen({ which }: { which: keyof typeof STUBS }) {
  const { title, note } = STUBS[which];
  return (
    <>
      <PageHeader title={title} sub="Not built yet" />
      <Card>
        <CardContent className="text-sm text-fg-subtle">{note}</CardContent>
      </Card>
    </>
  );
}

/* ------------------------------------------------------------------ demo switch */

/*
 * The reference's "demo bar" — a way to flip a screen into each of its states during a
 * walkthrough. Kept, because in a workshop it is the fastest way to show that every
 * state was designed. Rendered with ToggleGroup, and clearly marked as not product UI.
 *
 * PINNED to the bottom of the content column, not placed after the content. In the
 * reference it sat below the page, so on a long list it scrolled out of reach exactly
 * when a presenter wanted it, and on a short state (loading, empty) it floated
 * mid-screen and moved every time the state changed. `sticky bottom-0` keeps it on the
 * viewport edge while scrolling; `mt-auto` holds it at the bottom when the page is
 * short. It lives inside SidebarInset, so it never covers the sidebar.
 */
function DemoBar({
  state,
  setState,
  withFiltered,
}: {
  state: DemoState;
  setState: (s: DemoState) => void;
  withFiltered: boolean;
}) {
  const states: DemoState[] = ['populated', 'loading', 'error', 'empty'];
  if (withFiltered) states.push('empty-filtered');
  return (
    <div
      role="region"
      aria-label="Demo controls"
      className="sticky bottom-0 z-10 mt-auto border-t border-outline-default bg-surface-default"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-6 py-3 md:px-8">
        <span className="rounded-sm border border-dashed border-outline-default px-1.5 text-xs font-semibold uppercase tracking-wide text-fg-subtlest">
          Demo
        </span>
        <span className="text-xs text-fg-subtle">state</span>
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={state}
          onValueChange={(v) => v && setState(v as DemoState)}
          aria-label="Demo state"
        >
          {states.map((s) => (
            <ToggleGroupItem key={s} value={s} className="px-2.5 text-xs">
              {s}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- app */

export function Waypoint({
  initialRoute = { screen: 'today' },
  initialState = 'populated',
  showDemoBar = true,
}: {
  initialRoute?: Route;
  initialState?: DemoState;
  showDemoBar?: boolean;
}) {
  const [route, setRoute] = React.useState<Route>(initialRoute);
  const [state, setState] = React.useState<DemoState>(initialState);

  const go: Go = (r) => {
    setRoute(r);
    setState('populated');
    window.scrollTo(0, 0);
  };

  let screen: React.ReactNode;
  let hasStates = false;
  switch (route.screen) {
    case 'today':
      screen = <TodayScreen state={state} go={go} />;
      hasStates = true;
      break;
    case 'shipments':
      screen = (
        // Remount on route change so a filtered deep link starts from its own filters.
        <ShipmentsScreen key={JSON.stringify(route)} state={state} go={go} initial={route} />
      );
      hasStates = true;
      break;
    case 'details':
      screen = <DetailsScreen id={route.id} go={go} back={route.back} />;
      break;
    default:
      screen = <StubScreen which={route.screen} />;
  }

  return (
    <Shell
      route={route}
      go={go}
      footer={
        showDemoBar && hasStates ? (
          <DemoBar state={state} setState={setState} withFiltered={route.screen === 'shipments'} />
        ) : null
      }
    >
      {screen}
    </Shell>
  );
}
