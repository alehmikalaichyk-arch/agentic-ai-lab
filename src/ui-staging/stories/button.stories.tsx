import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRightIcon, PlusIcon, TrashIcon } from 'lucide-react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Button } from '@/ui-staging/button';

/*
 * Per-component showcase page. Lives in stories/ rather than next to button.tsx so
 * that `shadcn add button --overwrite` cannot clobber it — the CLI owns the component
 * file, this file is ours.
 */
const meta = {
  title: 'Staging/Button',
  parameters: {
    layout: 'fullscreen',
    // A showcase page renders fixed specimens and takes no args, so the Controls panel
    // has nothing to control and falls back to Storybook's "set your story args"
    // placeholder — an advert where the reader expects information. Hidden rather than
    // left empty.
    controls: { disable: true },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Button"
      tier="staging"
      summary="Triggers an action. The registry's button, rendered in this design system's tokens without a single edit to its source."
    >
      <Section
        title="Variants"
        description="Six, and they are not interchangeable: the variant encodes how consequential the action is, not how it should look."
      >
        <Specimens columns={3}>
          <Specimen label="default" hint="the primary action on a surface">
            <Button>Save changes</Button>
          </Specimen>
          <Specimen label="secondary" hint="an equal-weight alternative">
            <Button variant="secondary">Preview</Button>
          </Specimen>
          <Specimen label="destructive" hint="removes or cannot be undone">
            <Button variant="destructive">Delete</Button>
          </Specimen>
          <Specimen label="outline" hint="secondary, on a busy surface">
            <Button variant="outline">Export</Button>
          </Specimen>
          <Specimen label="ghost" hint="tertiary — toolbars, table rows">
            <Button variant="ghost">Dismiss</Button>
          </Specimen>
          <Specimen label="link" hint="navigates rather than acts">
            <Button variant="link">View documentation</Button>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Sizes"
        description="Four text sizes and four icon-only sizes. Height is fixed per size; width follows the label."
      >
        <Specimens columns={4}>
          <Specimen label="xs" hint="h-6">
            <Button size="xs">Extra small</Button>
          </Specimen>
          <Specimen label="sm" hint="h-8">
            <Button size="sm">Small</Button>
          </Specimen>
          <Specimen label="default" hint="h-9">
            <Button>Default</Button>
          </Specimen>
          <Specimen label="lg" hint="h-10">
            <Button size="lg">Large</Button>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Icon sizes"
        description="Square. An icon-only button carries no label, so it needs an accessible name of its own — see the note below."
      >
        <Specimens columns={4}>
          <Specimen label='size="icon-xs"'>
            <Button size="icon-xs" aria-label="Add">
              <PlusIcon />
            </Button>
          </Specimen>
          <Specimen label='size="icon-sm"'>
            <Button size="icon-sm" aria-label="Add">
              <PlusIcon />
            </Button>
          </Specimen>
          <Specimen label='size="icon"'>
            <Button size="icon" aria-label="Add">
              <PlusIcon />
            </Button>
          </Specimen>
          <Specimen label='size="icon-lg"'>
            <Button size="icon-lg" aria-label="Add">
              <PlusIcon />
            </Button>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="States"
        description="Hover and active are not shown as specimens because a static picture of them is a lie — put the pointer on the ones above instead."
      >
        <Specimens columns={4}>
          <Specimen label="default">
            <Button>Continue</Button>
          </Specimen>
          <Specimen label="disabled" hint="opacity 50%, pointer events off">
            <Button disabled>Continue</Button>
          </Specimen>
          <Specimen label="focus-visible" hint="keyboard only — Tab to it">
            <Button autoFocus>Continue</Button>
          </Specimen>
          <Specimen label='aria-invalid' hint="destructive ring">
            <Button aria-invalid>Continue</Button>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="With icons"
        description="An svg child is sized automatically and spaced by the button's own gap; do not add margin to the icon."
      >
        <Specimens columns={3}>
          <Specimen label="leading icon">
            <Button>
              <PlusIcon />
              New component
            </Button>
          </Specimen>
          <Specimen label="trailing icon">
            <Button variant="secondary">
              Next stage
              <ArrowRightIcon />
            </Button>
          </Specimen>
          <Specimen label="destructive + icon">
            <Button variant="destructive">
              <TrashIcon />
              Delete draft
            </Button>
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
              note: 'Encodes consequence, not appearance.',
            },
            {
              prop: 'size',
              type: "'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'",
              def: "'default'",
              note: 'Icon sizes are square and take no label.',
            },
            {
              prop: 'asChild',
              type: 'boolean',
              def: 'false',
              note: 'Renders the child element instead of a <button>. Use for links.',
            },
            {
              prop: 'disabled',
              type: 'boolean',
              def: 'false',
              note: 'Native. Removes it from the tab order.',
            },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <div className="space-y-3">
          <Note tone="warning">
            This component is in <strong>staging</strong>. No frozen spec, no tests, no
            accessibility audit — the variant meanings above are a reading of the code,
            not a contract anyone has committed to. It can change under you on the next
            registry pull.
          </Note>
          <Note>
            An icon-only button has no accessible name. Every one above passes{' '}
            <code className="font-mono text-xs">aria-label</code>, and yours must too —
            this is the single most common defect in a prototype built from this page.
          </Note>
        </div>
      </Section>
    </Page>
  ),
};
