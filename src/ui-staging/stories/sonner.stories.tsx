import type { Meta, StoryObj } from '@storybook/react';
import { toast } from 'sonner';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Button } from '@/ui-staging/button';
import { Toaster } from '@/ui-staging/sonner';

const meta = {
  title: 'Staging/Toast (Sonner)',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Toast (Sonner)"
      tier="staging"
      summary="A transient message in the corner. Every button below fires a real toast — the component is sonner, and the registry contributes only the themed Toaster that renders them."
    >
      <Section
        title="Kinds"
        description="Called as functions, not rendered as elements. toast() from 'sonner' is the whole API; the Toaster just has to be on the page once."
      >
        <Specimens columns={3}>
          <Specimen label="toast()">
            <Button variant="outline" onClick={() => toast('Component promoted')}>
              Plain
            </Button>
          </Specimen>
          <Specimen label="toast.success()">
            <Button
              variant="outline"
              onClick={() => toast.success('Quality gate passed', { description: 'All four reports present.' })}
            >
              Success
            </Button>
          </Specimen>
          <Specimen label="toast.error()">
            <Button
              variant="outline"
              onClick={() => toast.error('Gate failed', { description: 'No spec at the base commit.' })}
            >
              Error
            </Button>
          </Specimen>
          <Specimen label="toast.warning()">
            <Button variant="outline" onClick={() => toast.warning('Two manual a11y checks remain')}>
              Warning
            </Button>
          </Specimen>
          <Specimen label="toast.info()">
            <Button variant="outline" onClick={() => toast.info('Storybook published')}>
              Info
            </Button>
          </Specimen>
          <Specimen label="toast.loading()">
            <Button variant="outline" onClick={() => toast.loading('Building Storybook…')}>
              Loading
            </Button>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="With an action, and with a promise"
        description="An action turns a toast into a one-step undo. toast.promise swaps loading for success or error on its own, which is the right shape for anything you await."
      >
        <Specimens columns={3}>
          <Specimen label="action">
            <Button
              variant="outline"
              onClick={() =>
                toast('Draft deleted', {
                  action: { label: 'Undo', onClick: () => toast.success('Restored') },
                })
              }
            >
              With undo
            </Button>
          </Specimen>
          <Specimen label="toast.promise()">
            <Button
              variant="outline"
              onClick={() =>
                toast.promise(new Promise((r) => setTimeout(r, 1600)), {
                  loading: 'Running the quality gate…',
                  success: 'PASS',
                  error: 'FAIL',
                })
              }
            >
              Promise
            </Button>
          </Specimen>
          <Specimen label="duration: Infinity" hint="stays until dismissed">
            <Button
              variant="outline"
              onClick={() => toast('This one will not leave', { duration: Infinity, dismissible: true })}
            >
              Persistent
            </Button>
          </Specimen>
        </Specimens>
        <Toaster />
      </Section>

      <Section title="API">
        <Api
          rows={[
            {
              prop: '<Toaster />',
              type: 'component',
              note: 'Render once, near the root. Without it nothing appears and nothing errors.',
            },
            { prop: 'toast(message, options)', type: 'function', note: "Imported from 'sonner'." },
            {
              prop: 'toast.success / error / warning / info / loading',
              type: 'function',
              note: 'Same options, different icon and tone.',
            },
            {
              prop: 'toast.promise(p, { loading, success, error })',
              type: 'function',
              note: 'Transitions itself.',
            },
            { prop: 'options.description', type: 'string', note: 'Second line.' },
            { prop: 'options.action', type: '{ label, onClick }', note: 'One button. Undo, usually.' },
            { prop: 'options.duration', type: 'number', def: '4000', note: 'Infinity to persist.' },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <div className="space-y-3">
          <Note tone="warning">
            A toast disappears, so it is the wrong place for anything the reader must act
            on or must not miss. Errors that need a decision belong in an Alert on the
            page or a Dialog in front of it — not in a message that leaves after four
            seconds and cannot be recalled.
          </Note>
          <Note>
            The <code className="font-mono text-xs">Toaster</code> in this story sits
            inside the page so the specimens work. In an application it is rendered once
            at the root; several Toasters means several stacks in several corners.
          </Note>
        </div>
      </Section>
    </Page>
  ),
};
