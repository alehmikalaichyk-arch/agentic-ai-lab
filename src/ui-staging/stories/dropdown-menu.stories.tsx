import type { Meta, StoryObj } from '@storybook/react';
import { MoreHorizontalIcon } from 'lucide-react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Button } from '@/ui-staging/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/ui-staging/context-menu';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/ui-staging/dropdown-menu';

const meta = {
  title: 'Staging/DropdownMenu & ContextMenu',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="DropdownMenu & ContextMenu"
      tier="staging"
      summary="The same menu with two different ways in: a button you click, or a right-click on the thing itself. Identical part names, so a menu built for one ports to the other by renaming imports."
    >
      <Section
        title="Item kinds"
        description="Four: a plain command, a checkbox, a radio within a group, and a submenu. Mixing checkbox and radio items in one group is the usual mistake — radio means exactly one."
      >
        <Specimens columns={3}>
          <Specimen label="commands + shortcuts">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Component</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Promote <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Open spec <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">Remove</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Specimen>
          <Specimen label="checkbox + radio">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">View</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Show</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked>Staging tier</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Prototypes</DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuRadioGroup value="name">
                  <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="tier">Tier</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </Specimen>
          <Specimen label="submenu">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More actions">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem>Open</DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Move to tier</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>components/ui</DropdownMenuItem>
                      <DropdownMenuItem>ui-staging</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="ContextMenu"
        description="Right-click the dashed area. It replaces the browser's own menu, so use it only where you genuinely offer more than the browser does."
      >
        <Specimens columns={1}>
          <Specimen label="right-click target" full>
            <ContextMenu>
              <ContextMenuTrigger className="flex h-24 w-full items-center justify-center rounded-md border border-dashed border-outline-default text-sm text-fg-subtle">
                Right-click anywhere in this area
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>
                  Inspect token <ContextMenuShortcut>⌘I</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem>Copy class</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem variant="destructive">Reset</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            {
              prop: 'Item variant',
              type: "'default' | 'destructive'",
              def: "'default'",
              note: 'Destructive tints the row and its icon.',
            },
            { prop: 'Item disabled', type: 'boolean', def: 'false', note: 'Skipped by arrow keys.' },
            { prop: 'CheckboxItem checked', type: 'boolean', note: 'With onCheckedChange.' },
            { prop: 'RadioGroup value', type: 'string', note: 'With onValueChange.' },
            {
              prop: 'Content align / side',
              type: 'as Popover',
              note: 'Flips to stay on screen.',
            },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <div className="space-y-3">
          <Note>
            The shortcut text is a <strong>label, not a binding</strong>.{' '}
            <code className="font-mono text-xs">DropdownMenuShortcut</code> renders ⌘P
            and registers nothing — you still have to wire the key handler yourself.
          </Note>
          <Note tone="warning">
            A ContextMenu with no other route to the same commands is unreachable by
            keyboard and on touch. Offer the same items from a DropdownMenu as well;
            right-click is a shortcut, never the only door.
          </Note>
        </div>
      </Section>
    </Page>
  ),
};
