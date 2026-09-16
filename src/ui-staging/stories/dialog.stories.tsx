import type { Meta, StoryObj } from '@storybook/react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/ui-staging/alert-dialog';
import { Button } from '@/ui-staging/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui-staging/dialog';
import { Input } from '@/ui-staging/input';
import { Label } from '@/ui-staging/label';

const meta = {
  title: 'Staging/Dialog',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Dialog"
      tier="staging"
      summary="A modal that takes over the page until it is dealt with. Everything here is closed at rest — open them, because a closed dialog shows none of what this page describes."
    >
      <Section
        title="Dialog and AlertDialog"
        description="Two components, and the difference is not cosmetic. A Dialog can be dismissed with Escape or a click outside; an AlertDialog cannot, because it is asking a question that needs an answer."
      >
        <Specimens columns={2}>
          <Specimen label="Dialog" hint="Escape and outside-click both close it">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Edit workspace</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit workspace</DialogTitle>
                  <DialogDescription>
                    Dismissible. Nothing is lost by closing it.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                  <Label htmlFor="sb-dlg-name">Name</Label>
                  <Input id="sb-dlg-name" defaultValue="acme-platform" />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Specimen>
          <Specimen label="AlertDialog" hint="must be answered — no Escape">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete draft</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this visual draft?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Drafts are scaffolding and are deleted in PR-2 anyway. This cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Sizes"
        description="There is no size prop. Width comes from a utility on DialogContent; height is content-driven and the body scrolls if it has to."
      >
        <Specimens columns={3}>
          <Specimen label="default" hint="max-w-lg">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Default
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Default width</DialogTitle>
                  <DialogDescription>The shipped max-width.</DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </Specimen>
          <Specimen label='className="sm:max-w-md"'>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Narrow
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Narrow</DialogTitle>
                  <DialogDescription>For a single confirmation.</DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </Specimen>
          <Specimen label="long body" hint="scrolls inside">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Long
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[70vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Stage reports</DialogTitle>
                  <DialogDescription>Scroll inside the dialog.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2 text-sm text-fg-subtle">
                  {Array.from({ length: 20 }, (_, i) => (
                    <p key={i}>Report line {i + 1}</p>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            { prop: 'open', type: 'boolean', note: 'Controlled. Pass with onOpenChange.' },
            { prop: 'defaultOpen', type: 'boolean', def: 'false', note: 'Uncontrolled.' },
            { prop: 'onOpenChange', type: '(open: boolean) => void' },
            {
              prop: 'DialogTrigger asChild',
              type: 'boolean',
              note: 'Use it. Without asChild you get a button inside a button.',
            },
            {
              prop: 'DialogTitle',
              type: 'node',
              note: 'Required. It is what names the dialog to a screen reader.',
            },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <div className="space-y-3">
          <Note>
            <code className="font-mono text-xs">DialogTitle</code> is not optional even
            when your design has no visible heading. Omit it and the dialog opens
            unnamed; wrap it in a visually-hidden utility instead of dropping it.
          </Note>
          <Note tone="warning">
            Pick AlertDialog only when dismissing really is not an answer. Used for
            ordinary edits it traps people who pressed Escape out of habit, which is how
            a safety mechanism becomes an annoyance and then gets removed.
          </Note>
        </div>
      </Section>
    </Page>
  ),
};
