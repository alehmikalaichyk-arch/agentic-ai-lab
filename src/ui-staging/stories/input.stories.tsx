import type { Meta, StoryObj } from '@storybook/react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Input } from '@/ui-staging/input';
import { Label } from '@/ui-staging/label';

const meta = {
  title: 'Staging/Input',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Input"
      tier="staging"
      summary="A single-line text field. The registry's — see the warning below, because this design system has one of its own and they are not the same component."
    >
      <Section title="Before anything else">
        <Note tone="warning">
          <strong>There are two Inputs in this Storybook.</strong> This one is the
          registry's, at{' '}
          <code className="font-mono text-xs">@/ui-staging/input</code>. The other is
          under <strong>Components</strong> — it has a frozen spec, unit and browser
          tests, and a stage-#7 accessibility audit with zero blockers. For a throwaway
          prototype either works. For anything that outlives the prototype, the governed
          one is the whole point of the exercise.
        </Note>
      </Section>

      <Section
        title="Types"
        description="The type attribute is native and passes straight through. It changes the keyboard on a phone and the validation the browser applies — it is not cosmetic."
      >
        <Specimens columns={3}>
          <Specimen label='type="text"'>
            <Input placeholder="Workspace name" />
          </Specimen>
          <Specimen label='type="email"'>
            <Input type="email" placeholder="name@example.com" />
          </Specimen>
          <Specimen label='type="password"'>
            <Input type="password" defaultValue="hunter2" />
          </Specimen>
          <Specimen label='type="number"'>
            <Input type="number" defaultValue={42} />
          </Specimen>
          <Specimen label='type="search"'>
            <Input type="search" placeholder="Search components" />
          </Specimen>
          <Specimen label='type="file"' hint="height differs — native control">
            <Input type="file" />
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="States"
        description="Focus is keyboard-visible only. The invalid state is driven by aria-invalid, not by a prop — which means the same attribute screen readers use is the one that draws the ring."
      >
        <Specimens columns={4}>
          <Specimen label="default">
            <Input placeholder="Placeholder" />
          </Specimen>
          <Specimen label="filled">
            <Input defaultValue="acme-platform" />
          </Specimen>
          <Specimen label="disabled" hint="not focusable, not submitted">
            <Input disabled defaultValue="Locked" />
          </Specimen>
          <Specimen label="aria-invalid" hint="destructive border and ring">
            <Input aria-invalid defaultValue="not an email" />
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="With a label"
        description="Always. A placeholder is not a label: it disappears the moment someone types, and it is not announced as the field's name."
      >
        <Specimens columns={2}>
          <Specimen label="htmlFor + id" hint="click the label to focus the field">
            <div className="grid w-full max-w-xs gap-2">
              <Label htmlFor="sb-in-1">Workspace</Label>
              <Input id="sb-in-1" placeholder="acme" />
            </div>
          </Specimen>
          <Specimen label="invalid + description">
            <div className="grid w-full max-w-xs gap-2">
              <Label htmlFor="sb-in-2">Email</Label>
              <Input id="sb-in-2" aria-invalid aria-describedby="sb-in-2-err" />
              <p id="sb-in-2-err" className="text-xs text-fg-status-danger">
                Enter a valid address.
              </p>
            </div>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            {
              prop: 'type',
              type: 'HTML input type',
              def: "'text'",
              note: 'Native. Drives mobile keyboard and browser validation.',
            },
            {
              prop: 'aria-invalid',
              type: 'boolean',
              def: 'false',
              note: 'Draws the error border and ring. There is no `error` prop.',
            },
            { prop: 'disabled', type: 'boolean', def: 'false', note: 'Native.' },
            {
              prop: 'className',
              type: 'string',
              note: 'Merged via tailwind-merge, so a caller utility wins over the default.',
            },
          ]}
        />
      </Section>
    </Page>
  ),
};
