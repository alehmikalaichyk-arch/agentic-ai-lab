import type { Meta, StoryObj } from '@storybook/react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/ui-staging/avatar';

const meta = {
  title: 'Staging/Avatar',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Avatar"
      tier="staging"
      summary="A person or an entity, at a glance. The fallback is not an error state — for most users in most products it is what actually renders."
    >
      <Section
        title="Image and fallback"
        description="AvatarImage swaps itself for the fallback when the src fails or is absent. The second specimen has a deliberately broken URL to show what that looks like."
      >
        <Specimens columns={3}>
          <Specimen label="fallback only" hint="the common case">
            <Avatar>
              <AvatarFallback>OM</AvatarFallback>
            </Avatar>
          </Specimen>
          <Specimen label="broken src" hint="falls back automatically">
            <Avatar>
              <AvatarImage src="https://example.invalid/nope.png" alt="" />
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
          </Specimen>
          <Specimen label="single initial">
            <Avatar>
              <AvatarFallback>K</AvatarFallback>
            </Avatar>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Sizes"
        description="There is no size prop. Set it with a utility on the Avatar; the fallback text does not scale with it, so adjust that too on the larger ones."
      >
        <Specimens columns={4}>
          <Specimen label='className="size-6"'>
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px]">XS</AvatarFallback>
            </Avatar>
          </Specimen>
          <Specimen label="default" hint="size-8">
            <Avatar>
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
          </Specimen>
          <Specimen label='className="size-12"'>
            <Avatar className="size-12">
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
          </Specimen>
          <Specimen label='className="size-16"'>
            <Avatar className="size-16">
              <AvatarFallback className="text-lg">LG</AvatarFallback>
            </Avatar>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Group and badge"
        description="AvatarGroup overlaps its children; AvatarGroupCount closes the stack with a remainder. AvatarBadge pins a status dot to one avatar."
      >
        <Specimens columns={3}>
          <Specimen label="AvatarGroup">
            <AvatarGroup>
              {['A', 'B', 'C'].map((i) => (
                <Avatar key={i}>
                  <AvatarFallback>{i}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
          </Specimen>
          <Specimen label="with AvatarGroupCount">
            <AvatarGroup>
              {['A', 'B'].map((i) => (
                <Avatar key={i}>
                  <AvatarFallback>{i}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount>+7</AvatarGroupCount>
            </AvatarGroup>
          </Specimen>
          <Specimen label="AvatarBadge" hint="status dot">
            <Avatar>
              <AvatarFallback>OM</AvatarFallback>
              <AvatarBadge className="bg-surface-status-success-bold" />
            </Avatar>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            { prop: 'AvatarImage src', type: 'string', note: 'Falls back on load failure.' },
            {
              prop: 'AvatarImage alt',
              type: 'string',
              note: 'Empty string when the name is already beside it — see the note.',
            },
            { prop: 'AvatarFallback', type: 'node', note: 'Initials, or an icon.' },
            { prop: 'AvatarGroup', type: 'div', note: 'Overlaps its children.' },
            { prop: 'AvatarBadge', type: 'span', note: 'Absolute, bottom-right. Set its colour.' },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <Note>
          An avatar next to a name that is already on screen is decoration, and{' '}
          <code className="font-mono text-xs">alt=""</code> is correct — otherwise a
          screen reader reads the name twice. Give it real alt text only when the avatar
          is the only thing identifying the person.
        </Note>
      </Section>
    </Page>
  ),
};
