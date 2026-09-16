import type { Meta, StoryObj } from '@storybook/react';
import { CheckIcon, ClockIcon, XIcon } from 'lucide-react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Badge } from '@/ui-staging/badge';

const meta = {
  title: 'Staging/Badge',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Badge"
      tier="staging"
      summary="A short, static label attached to something else — a status, a count, a tag. It is not a button, and the moment it needs a click it should have been one."
    >
      <Section
        title="Variants"
        description="Six, matching Button's names. That is a naming coincidence, not a promise: a badge's variant carries meaning, a button's carries consequence."
      >
        <Specimens columns={3}>
          <Specimen label="default">
            <Badge>frozen</Badge>
          </Specimen>
          <Specimen label="secondary">
            <Badge variant="secondary">staging</Badge>
          </Specimen>
          <Specimen label="destructive">
            <Badge variant="destructive">failed</Badge>
          </Specimen>
          <Specimen label="outline">
            <Badge variant="outline">draft</Badge>
          </Specimen>
          <Specimen label="ghost">
            <Badge variant="ghost">optional</Badge>
          </Specimen>
          <Specimen label="link">
            <Badge variant="link">see PR #32</Badge>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="With an icon"
        description="One small icon, leading. A badge with a trailing icon reads as a dismissible chip and people will try to click it."
      >
        <Specimens columns={3}>
          <Specimen label="success">
            <Badge>
              <CheckIcon />
              passed
            </Badge>
          </Specimen>
          <Specimen label="pending">
            <Badge variant="secondary">
              <ClockIcon />
              awaiting review
            </Badge>
          </Specimen>
          <Specimen label="failure">
            <Badge variant="destructive">
              <XIcon />
              blocked
            </Badge>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Counts"
        description="A numeric badge should stop counting somewhere. '99+' is readable at a glance; '1284' is a number the reader has to parse."
      >
        <Specimens columns={4}>
          <Specimen label="single digit">
            <Badge>3</Badge>
          </Specimen>
          <Specimen label="capped">
            <Badge>99+</Badge>
          </Specimen>
          <Specimen label="zero" hint="usually render nothing instead">
            <Badge variant="outline">0</Badge>
          </Specimen>
          <Specimen label="uncapped" hint="hard to read — avoid">
            <Badge variant="secondary">1284</Badge>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            {
              prop: 'variant',
              type: "'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'",
              def: "'default'",
            },
            {
              prop: 'asChild',
              type: 'boolean',
              def: 'false',
              note: 'Render as <a> when the badge really does navigate.',
            },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <Note>
          Colour is the whole message here, and colour alone is not a message for
          everyone. Where a badge distinguishes pass from fail, put the word in it —
          every specimen above does.
        </Note>
      </Section>
    </Page>
  ),
};
