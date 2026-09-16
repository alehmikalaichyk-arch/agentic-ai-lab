import type { Meta, StoryObj } from '@storybook/react';
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon } from 'lucide-react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Alert, AlertDescription, AlertTitle } from '@/ui-staging/alert';

const meta = {
  title: 'Staging/Alert',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Alert"
      tier="staging"
      summary="A message that stays on the page, in place, about the thing next to it. If it should disappear on its own, that is a toast; if it blocks the page, that is an AlertDialog."
    >
      <Section
        title="Variants"
        description="Only two ship. Anything warmer or cooler than these is you composing it from tokens — see the next section."
      >
        <Specimens columns={2}>
          <Specimen label="default" full>
            <Alert>
              <InfoIcon />
              <AlertTitle>Spec merged</AlertTitle>
              <AlertDescription>
                PR-1 is on main, so the spec is frozen. Implementation may start.
              </AlertDescription>
            </Alert>
          </Specimen>
          <Specimen label="destructive" full>
            <Alert variant="destructive">
              <AlertTriangleIcon />
              <AlertTitle>Gate failed</AlertTitle>
              <AlertDescription>
                require-document-on-base found no spec at the base commit.
              </AlertDescription>
            </Alert>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Composed tones"
        description="Success and warning are not variants of this component. Where you need them, bind this repository's own status tokens rather than reaching for a colour."
      >
        <Specimens columns={2}>
          <Specimen
            label="success"
            hint="surface-status-success / outline-status-success"
            full
          >
            <Alert className="border-outline-status-success bg-surface-status-success">
              <CheckCircleIcon />
              <AlertTitle>Quality gate passed</AlertTitle>
              <AlertDescription>All four upstream reports were present.</AlertDescription>
            </Alert>
          </Specimen>
          <Specimen
            label="warning"
            hint="surface-status-warning / outline-status-warning"
            full
          >
            <Alert className="border-outline-status-warning bg-surface-status-warning">
              <AlertTriangleIcon />
              <AlertTitle>Two manual checks remain</AlertTitle>
              <AlertDescription>
                An agent cannot close them; a person has to look.
              </AlertDescription>
            </Alert>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Shapes"
        description="The icon and the description are both optional. A title-only alert is the right shape when the message is genuinely one line."
      >
        <Specimens columns={2}>
          <Specimen label="title only" full>
            <Alert>
              <AlertTitle>Storybook published.</AlertTitle>
            </Alert>
          </Specimen>
          <Specimen label="no icon" full>
            <Alert>
              <AlertTitle>Branch protection is off</AlertTitle>
              <AlertDescription>Gates report but do not block a merge.</AlertDescription>
            </Alert>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            { prop: 'variant', type: "'default' | 'destructive'", def: "'default'" },
            {
              prop: 'AlertTitle',
              type: 'div',
              note: 'One line. It truncates rather than wrapping.',
            },
            { prop: 'AlertDescription', type: 'div', note: 'Muted foreground; wraps freely.' },
            {
              prop: 'icon',
              type: 'svg child',
              note: 'First child. Positioned by the grid — do not wrap it.',
            },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <Note>
          Nothing here announces itself. An alert that appears in response to something
          the user just did needs{' '}
          <code className="font-mono text-xs">role="alert"</code> to be read out; one
          that was on the page all along must not have it, or it interrupts on every
          render.
        </Note>
      </Section>
    </Page>
  ),
};
