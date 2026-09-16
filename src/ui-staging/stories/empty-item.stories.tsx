import type { Meta, StoryObj } from '@storybook/react';
import { FolderIcon, InboxIcon, SearchXIcon } from 'lucide-react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Badge } from '@/ui-staging/badge';
import { Button } from '@/ui-staging/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/ui-staging/empty';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/ui-staging/item';

const meta = {
  title: 'Staging/Empty & Item',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Empty & Item"
      tier="staging"
      summary="A list row, and what to show when there are no rows. They belong on one page because you will build them in the same hour and the second is the one people skip."
    >
      <Section
        title="Item"
        description="Media, content and actions in a row, with the spacing settled. ItemGroup stacks several and ItemSeparator rules between them."
      >
        <Specimens columns={2}>
          <Specimen label="title + description" full>
            <ItemGroup className="w-full">
              <Item>
                <ItemContent>
                  <ItemTitle>token-guardian</ItemTitle>
                  <ItemDescription>Detects violations; never fixes them.</ItemDescription>
                </ItemContent>
              </Item>
            </ItemGroup>
          </Specimen>
          <Specimen label="media + actions" full>
            <ItemGroup className="w-full">
              <Item>
                <ItemMedia>
                  <FolderIcon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>ui-staging</ItemTitle>
                  <ItemDescription>54 components, no specs.</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button size="xs" variant="ghost">
                    Open
                  </Button>
                </ItemActions>
              </Item>
            </ItemGroup>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Item — variants and a list"
        description="`outline` boxes each row, `muted` tints it. In a long list neither is usually right: a separator between plain rows is quieter and scans faster."
      >
        <Specimens columns={2}>
          <Specimen label="variants" full>
            <div className="w-full space-y-2">
              {(['default', 'outline', 'muted'] as const).map((v) => (
                <Item key={v} variant={v}>
                  <ItemContent>
                    <ItemTitle>variant=&quot;{v}&quot;</ItemTitle>
                  </ItemContent>
                </Item>
              ))}
            </div>
          </Specimen>
          <Specimen label="a real list" hint="separators, not boxes" full>
            <ItemGroup className="w-full">
              {[
                ['Input', 'frozen'],
                ['Button', 'none yet'],
                ['Badge', 'none yet'],
              ].map(([name, spec], i, arr) => (
                <div key={name}>
                  <Item>
                    <ItemContent>
                      <ItemTitle>{name}</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <Badge variant={spec === 'frozen' ? 'default' : 'secondary'}>{spec}</Badge>
                    </ItemActions>
                  </Item>
                  {i < arr.length - 1 ? <ItemSeparator /> : null}
                </div>
              ))}
            </ItemGroup>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Empty"
        description="Three different nothings, and they need three different messages. The one people get wrong is the middle: 'no results' is not 'nothing exists', and offering 'Create' there is useless advice."
      >
        <Specimens columns={3}>
          <Specimen label="nothing yet" hint="offer the first action" full>
            <Empty className="w-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>No components staged</EmptyTitle>
                <EmptyDescription>Pull one from the registry to begin.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size="sm">Add component</Button>
              </EmptyContent>
            </Empty>
          </Specimen>
          <Specimen label="no results" hint="offer a way back" full>
            <Empty className="w-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchXIcon />
                </EmptyMedia>
                <EmptyTitle>No match for “zzz”</EmptyTitle>
                <EmptyDescription>54 components are available.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size="sm" variant="outline">
                  Clear search
                </Button>
              </EmptyContent>
            </Empty>
          </Specimen>
          <Specimen label="text only" hint="when it is genuinely fine" full>
            <Empty className="w-full">
              <EmptyHeader>
                <EmptyTitle>Nothing to review</EmptyTitle>
                <EmptyDescription>All four gates are green.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            { prop: 'Item variant', type: "'default' | 'outline' | 'muted'", def: "'default'" },
            { prop: 'Item size', type: "'default' | 'sm'", def: "'default'" },
            { prop: 'ItemMedia variant', type: "'default' | 'icon' | 'image'", def: "'default'" },
            { prop: 'ItemActions', type: 'div', note: 'Right-aligned. Put controls here.' },
            { prop: 'EmptyMedia variant', type: "'default' | 'icon'", def: "'default'" },
            { prop: 'EmptyContent', type: 'div', note: 'The action. Optional — see the note.' },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <Note>
          An empty state without an action is sometimes the correct design and sometimes
          a dead end. Ask what the reader is supposed to do next; if the answer is
          "nothing, this is fine", say so in the description rather than inventing a
          button to fill the space.
        </Note>
      </Section>
    </Page>
  ),
};
