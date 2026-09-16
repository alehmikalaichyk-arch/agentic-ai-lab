import type { Meta, StoryObj } from '@storybook/react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Badge } from '@/ui-staging/badge';
import { Button } from '@/ui-staging/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/ui-staging/card';
import { Input } from '@/ui-staging/input';
import { Label } from '@/ui-staging/label';

const meta = {
  title: 'Staging/Card',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Card"
      tier="staging"
      summary="A raised container for one coherent thing. It has no variants — a card is a surface, and what it means is carried by what you put in it."
    >
      <Section
        title="Anatomy"
        description="Seven parts, all optional. CardAction is the one people miss: it places a control in the header's top-right without you positioning anything."
      >
        <Specimens columns={2}>
          <Specimen label="header + content + footer" full>
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Input v1</CardTitle>
                <CardDescription>Frozen spec, tests, a11y audit.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-fg-subtle">
                Built literally from docs/component-specs/input.md.
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">Open spec</Button>
                <Button size="sm" variant="ghost">
                  History
                </Button>
              </CardFooter>
            </Card>
          </Specimen>
          <Specimen label="with CardAction" full>
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Deployment</CardTitle>
                <CardDescription>Last run 4 minutes ago.</CardDescription>
                <CardAction>
                  <Badge>live</Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="text-sm text-fg-subtle">
                CardAction sits top-right without any positioning of your own.
              </CardContent>
            </Card>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Shapes it takes"
        description="The same container doing different jobs. None of these is a variant — they are compositions."
      >
        <Specimens columns={3}>
          <Specimen label="content only" full>
            <Card className="w-full p-6 text-sm text-fg-subtle">
              No header, no footer. A padded surface.
            </Card>
          </Specimen>
          <Specimen label="a form" full>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>New workspace</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Label htmlFor="sb-card-in">Name</Label>
                <Input id="sb-card-in" placeholder="acme" />
              </CardContent>
              <CardFooter>
                <Button size="sm" className="w-full">
                  Create
                </Button>
              </CardFooter>
            </Card>
          </Specimen>
          <Specimen label="a statistic" full>
            <Card className="w-full">
              <CardHeader>
                <CardDescription>Semantic tokens</CardDescription>
                <CardTitle className="text-3xl">196</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-fg-subtle">
                surface 131 · fg 38 · outline 27
              </CardContent>
            </Card>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            { prop: 'Card', type: 'div', note: 'The surface. Set width from the outside.' },
            { prop: 'CardHeader', type: 'div', note: 'Grid that positions CardAction for you.' },
            { prop: 'CardTitle', type: 'div', note: 'Not an <h*>. Add your own heading level.' },
            { prop: 'CardDescription', type: 'div', note: 'Muted foreground.' },
            { prop: 'CardAction', type: 'div', note: 'Top-right of the header.' },
            { prop: 'CardContent', type: 'div' },
            { prop: 'CardFooter', type: 'div', note: 'Actions. Set your own gap.' },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <Note>
          <code className="font-mono text-xs">CardTitle</code> renders a{' '}
          <code className="font-mono text-xs">div</code>, not a heading. A page of cards
          therefore has no document outline at all unless you add one — pass a heading
          element yourself where the card is a real section of the page.
        </Note>
      </Section>
    </Page>
  ),
};
