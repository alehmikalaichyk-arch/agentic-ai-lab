import type { Meta, StoryObj } from '@storybook/react';
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
} from 'lucide-react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Button } from '@/ui-staging/button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/ui-staging/button-group';
import { Toggle } from '@/ui-staging/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/ui-staging/toggle-group';

const meta = {
  title: 'Staging/Toggle & ButtonGroup',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Toggle & ButtonGroup"
      tier="staging"
      summary="A button that stays pressed, a set of them that behave as one control, and a purely visual way to weld ordinary buttons together. Three different things that look nearly identical."
    >
      <Section
        title="Toggle — variants and sizes"
        description="A single on/off button. It is pressed or not, and unlike a Switch it usually applies to a selection rather than a setting."
      >
        <Specimens columns={4}>
          <Specimen label='variant="default"'>
            <Toggle aria-label="Bold">
              <BoldIcon />
            </Toggle>
          </Specimen>
          <Specimen label='variant="outline"'>
            <Toggle variant="outline" aria-label="Italic">
              <ItalicIcon />
            </Toggle>
          </Specimen>
          <Specimen label="defaultPressed">
            <Toggle defaultPressed aria-label="Underline">
              <UnderlineIcon />
            </Toggle>
          </Specimen>
          <Specimen label="disabled">
            <Toggle disabled aria-label="Bold">
              <BoldIcon />
            </Toggle>
          </Specimen>
        </Specimens>
        <div className="mt-5">
          <Specimens columns={3}>
            <Specimen label='size="sm"'>
              <Toggle size="sm">Small</Toggle>
            </Specimen>
            <Specimen label='size="default"'>
              <Toggle>Default</Toggle>
            </Specimen>
            <Specimen label='size="lg"'>
              <Toggle size="lg">Large</Toggle>
            </Specimen>
          </Specimens>
        </div>
      </Section>

      <Section
        title="ToggleGroup — single and multiple"
        description="`single` is a segmented control: exactly one pressed. `multiple` is a set of independent toggles that happen to sit together — text formatting is the classic case."
      >
        <Specimens columns={2}>
          <Specimen label='type="single"' hint="one at a time — alignment">
            <ToggleGroup type="single" defaultValue="left" variant="outline">
              <ToggleGroupItem value="left" aria-label="Align left">
                <AlignLeftIcon />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center">
                <AlignCenterIcon />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                <AlignRightIcon />
              </ToggleGroupItem>
            </ToggleGroup>
          </Specimen>
          <Specimen label='type="multiple"' hint="independent — formatting">
            <ToggleGroup type="multiple" defaultValue={['bold']} variant="outline">
              <ToggleGroupItem value="bold" aria-label="Bold">
                <BoldIcon />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Italic">
                <ItalicIcon />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Underline">
                <UnderlineIcon />
              </ToggleGroupItem>
            </ToggleGroup>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="ButtonGroup"
        description="Purely visual. It joins the corners of adjacent buttons and nothing else — there is no selection, no value, no pressed state anywhere in it."
      >
        <Specimens columns={3}>
          <Specimen label="horizontal">
            <ButtonGroup>
              <Button variant="outline">Day</Button>
              <Button variant="outline">Week</Button>
              <Button variant="outline">Month</Button>
            </ButtonGroup>
          </Specimen>
          <Specimen label="with separator and text">
            <ButtonGroup>
              <Button variant="outline">Export</Button>
              <ButtonGroupSeparator />
              <ButtonGroupText>CSV</ButtonGroupText>
            </ButtonGroup>
          </Specimen>
          <Specimen label='orientation="vertical"'>
            <ButtonGroup orientation="vertical">
              <Button variant="outline">Promote</Button>
              <Button variant="outline">Open spec</Button>
            </ButtonGroup>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            { prop: 'Toggle pressed / defaultPressed', type: 'boolean', note: 'With onPressedChange.' },
            { prop: 'Toggle variant', type: "'default' | 'outline'", def: "'default'" },
            { prop: 'Toggle size', type: "'default' | 'sm' | 'lg'", def: "'default'" },
            { prop: 'ToggleGroup type', type: "'single' | 'multiple'", note: 'Required.' },
            {
              prop: 'ToggleGroup value',
              type: 'string | string[]',
              note: 'A string for single, an array for multiple.',
            },
            {
              prop: 'ButtonGroup orientation',
              type: "'horizontal' | 'vertical'",
              def: "'horizontal'",
              note: 'Visual only. No state of its own.',
            },
          ]}
        />
      </Section>

      <Section title="Which of the three">
        <div className="space-y-3">
          <Note>
            <strong>ToggleGroup single</strong> when the buttons are alternatives and one
            is always active. <strong>ButtonGroup</strong> when they are separate
            commands that merely sit together. They look the same and behave completely
            differently — a ButtonGroup will never show which option is current, and
            people will wait for it to.
          </Note>
          <Note tone="warning">
            Every icon-only toggle above passes{' '}
            <code className="font-mono text-xs">aria-label</code>. Without it the control
            announces as an unnamed pressed button, which is worse than an unnamed
            ordinary one — the state is audible and the subject is not.
          </Note>
        </div>
      </Section>
    </Page>
  ),
};
