import type { Meta, StoryObj } from '@storybook/react';

import { Waypoint } from './waypoint';

/**
 * A prototype, not a component. Read prototypes/waypoint/NOTES.md for the question it
 * exists to settle, and reference.html beside it for what it was rebuilt from.
 *
 * `App` is the whole thing, navigable: the sidebar, the shipment links and the
 * breadcrumb all work, and the Demo bar at the bottom flips a screen through its states.
 * The remaining stories are deep links into one screen and one state each — the ones to
 * open when a workshop needs to point at something specific.
 */
const meta = {
  title: 'Prototypes/Waypoint',
  component: Waypoint,
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta<typeof Waypoint>;

export default meta;
type Story = StoryObj<typeof meta>;

export const App: Story = {};

export const TodayLoading: Story = {
  name: 'Today — loading',
  args: { initialState: 'loading' },
};
export const TodayError: Story = {
  name: 'Today — error',
  args: { initialState: 'error' },
};
export const TodayEmpty: Story = {
  name: 'Today — empty',
  args: { initialState: 'empty' },
};

export const Shipments: Story = {
  args: { initialRoute: { screen: 'shipments' } },
};
export const ShipmentsFiltered: Story = {
  name: 'Shipments — filtered to On hold',
  args: { initialRoute: { screen: 'shipments', status: 'held' } },
};
export const ShipmentsNoMatch: Story = {
  name: 'Shipments — nothing matches',
  args: { initialRoute: { screen: 'shipments' }, initialState: 'empty-filtered' },
};

export const DetailsDelayed: Story = {
  name: 'Details — delayed',
  args: { initialRoute: { screen: 'details', id: 'WP-24081' } },
};
export const DetailsHeld: Story = {
  name: 'Details — on hold',
  args: { initialRoute: { screen: 'details', id: 'WP-24077' } },
};
export const DetailsDelivered: Story = {
  name: 'Details — delivered',
  args: { initialRoute: { screen: 'details', id: 'WP-24075' } },
};
export const DetailsNotFound: Story = {
  name: 'Details — not found',
  args: { initialRoute: { screen: 'details', id: 'WP-00000' } },
};
