import type { Meta, StoryObj } from '@storybook/react';
import { FileTextIcon, LayersIcon, SettingsIcon } from 'lucide-react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/ui-staging/command';
import { Kbd, KbdGroup } from '@/ui-staging/kbd';

const meta = {
  title: 'Staging/Command',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Command"
      tier="staging"
      summary="A filtered command list — the ⌘K palette. Type in the specimens below: the filtering is real and runs on the item text, with no wiring from you."
    >
      <Section
        title="Inline"
        description="Embedded in the page rather than in a dialog. Useful as a searchable picker inside a Popover, which is how a combobox is built out of these parts."
      >
        <Specimens columns={2}>
          <Specimen label="grouped" hint="type to filter" full>
            <Command className="w-full rounded-md border border-outline-subtle">
              <CommandInput placeholder="Search a component…" />
              <CommandList>
                <CommandEmpty>Nothing matches.</CommandEmpty>
                <CommandGroup heading="Forms">
                  <CommandItem>
                    <LayersIcon />
                    Button
                    <CommandShortcut>⌘B</CommandShortcut>
                  </CommandItem>
                  <CommandItem>
                    <LayersIcon />
                    Input
                  </CommandItem>
                  <CommandItem>
                    <LayersIcon />
                    Select
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Documents">
                  <CommandItem>
                    <FileTextIcon />
                    input.md
                  </CommandItem>
                  <CommandItem>
                    <SettingsIcon />
                    ds-kit.config.yml
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </Specimen>
          <Specimen label="empty state" hint="search for something absent" full>
            <Command className="w-full rounded-md border border-outline-subtle">
              <CommandInput placeholder="Try typing zzz" defaultValue="zzz" />
              <CommandList>
                <CommandEmpty>No component by that name.</CommandEmpty>
                <CommandGroup heading="Forms">
                  <CommandItem>Button</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Items"
        description="An icon, a label, and an optional shortcut hint on the right. Disabled items stay visible and are skipped by the arrow keys."
      >
        <Specimens columns={1}>
          <Specimen label="item kinds" full>
            <Command className="w-full rounded-md border border-outline-subtle">
              <CommandList>
                <CommandGroup heading="Actions">
                  <CommandItem>Plain item</CommandItem>
                  <CommandItem>
                    <LayersIcon />
                    With an icon
                  </CommandItem>
                  <CommandItem>
                    With a shortcut
                    <CommandShortcut>⌘P</CommandShortcut>
                  </CommandItem>
                  <CommandItem disabled>Disabled — needs a spec first</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            {
              prop: 'CommandInput value',
              type: 'string',
              note: 'Controlled. With onValueChange.',
            },
            {
              prop: 'CommandItem value',
              type: 'string',
              note: 'What filtering matches on. Defaults to the text content.',
            },
            { prop: 'CommandItem onSelect', type: '(value: string) => void' },
            { prop: 'CommandItem disabled', type: 'boolean', def: 'false' },
            {
              prop: 'CommandEmpty',
              type: 'node',
              note: 'Rendered when nothing matches. Not optional in practice.',
            },
            {
              prop: 'CommandDialog',
              type: 'component',
              note: 'The same list inside a Dialog, for the ⌘K overlay.',
            },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <div className="space-y-3">
          <Note>
            <CommandShortcut /> and{' '}
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>{' '}
            are labels. Opening the palette on ⌘K is a key handler you add — the
            component ships the list, not the global shortcut.
          </Note>
          <Note tone="warning">
            Filtering is a substring match over item text. It does not know that
            "dropdown" should find "DropdownMenu" if your label says "Menu", and it has
            no fuzzy matching — a palette over a large catalogue usually needs its own
            search, passed in via the controlled value.
          </Note>
        </div>
      </Section>
    </Page>
  ),
};
