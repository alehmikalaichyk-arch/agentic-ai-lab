import type { Meta, StoryObj } from '@storybook/react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui-staging/accordion';
import { Button } from '@/ui-staging/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui-staging/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui-staging/tabs';

const meta = {
  title: 'Staging/Tabs, Accordion & Collapsible',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Tabs, Accordion & Collapsible"
      tier="staging"
      summary="Three ways to show one part of something at a time. The choice is about whether the sections compete for the same space, and whether the reader may need two of them at once."
    >
      <Section
        title="Tabs — variants"
        description="Two. `default` is a filled segmented control; `line` is an underline, which sits better directly under a page heading."
      >
        <Specimens columns={2}>
          <Specimen label='variant="default"' full>
            <Tabs defaultValue="spec" className="w-full">
              <TabsList>
                <TabsTrigger value="spec">Spec</TabsTrigger>
                <TabsTrigger value="impl">Implementation</TabsTrigger>
                <TabsTrigger value="a11y">A11y</TabsTrigger>
              </TabsList>
              <TabsContent value="spec" className="pt-3 text-sm text-fg-subtle">
                Merged by a human before any code for it existed.
              </TabsContent>
              <TabsContent value="impl" className="pt-3 text-sm text-fg-subtle">
                Built literally from the frozen spec.
              </TabsContent>
              <TabsContent value="a11y" className="pt-3 text-sm text-fg-subtle">
                Zero blockers; two checks need a person.
              </TabsContent>
            </Tabs>
          </Specimen>
          <Specimen label='variant="line"' full>
            <Tabs defaultValue="spec" className="w-full">
              <TabsList variant="line">
                <TabsTrigger value="spec">Spec</TabsTrigger>
                <TabsTrigger value="impl">Implementation</TabsTrigger>
                <TabsTrigger value="a11y">A11y</TabsTrigger>
              </TabsList>
              <TabsContent value="spec" className="pt-3 text-sm text-fg-subtle">
                The same content, a lighter frame.
              </TabsContent>
              <TabsContent value="impl" className="pt-3 text-sm text-fg-subtle">
                Underline sits better under a page heading.
              </TabsContent>
              <TabsContent value="a11y" className="pt-3 text-sm text-fg-subtle">
                Choose on density, not preference.
              </TabsContent>
            </Tabs>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Accordion — single and multiple"
        description="`single` closes the previous section when a new one opens; `multiple` lets the reader keep two open to compare. Add `collapsible` to allow closing the last one."
      >
        <Specimens columns={2}>
          <Specimen label='type="single" collapsible' full>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="a">
                <AccordionTrigger>What is the staging tier?</AccordionTrigger>
                <AccordionContent className="text-fg-subtle">
                  Registry components with no spec, tests or audit — outside every gate,
                  openly.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>How does a component leave it?</AccordionTrigger>
                <AccordionContent className="text-fg-subtle">
                  By moving into src/components/ui/ after the pipeline, as a visible diff.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Specimen>
          <Specimen label='type="multiple"' full>
            <Accordion type="multiple" defaultValue={['a']} className="w-full">
              <AccordionItem value="a">
                <AccordionTrigger>Both can be open</AccordionTrigger>
                <AccordionContent className="text-fg-subtle">
                  Use this when sections are compared rather than read in turn.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>Open me too</AccordionTrigger>
                <AccordionContent className="text-fg-subtle">
                  The first one stays open.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Collapsible"
        description="The unstyled primitive underneath Accordion: one region, one trigger, no chrome. Reach for it when you want the behaviour without the list."
      >
        <Specimens columns={1}>
          <Specimen label="one region" full>
            <Collapsible className="w-full max-w-md">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  Show gate details
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 text-sm text-fg-subtle">
                enforce-spec-pr-separation · enforce-one-component-per-pr ·
                require-document-on-base · review-approved
              </CollapsibleContent>
            </Collapsible>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            { prop: 'Tabs value / defaultValue', type: 'string', note: 'With onValueChange.' },
            { prop: 'TabsList variant', type: "'default' | 'line'", def: "'default'" },
            { prop: 'Accordion type', type: "'single' | 'multiple'", note: 'Required.' },
            {
              prop: 'Accordion collapsible',
              type: 'boolean',
              def: 'false',
              note: 'single only. Allows closing the open item.',
            },
            {
              prop: 'AccordionItem value',
              type: 'string',
              note: 'Required and unique. It is the identity, not the label.',
            },
          ]}
        />
      </Section>

      <Section title="Choosing between them">
        <Note>
          <strong>Tabs</strong> when the sections are alternatives and only one is ever
          relevant. <strong>Accordion</strong> when they are parts of one document the
          reader may want several of. The tell: if you find yourself wishing two tabs
          could be open at once, it was an accordion.
        </Note>
      </Section>
    </Page>
  ),
};
