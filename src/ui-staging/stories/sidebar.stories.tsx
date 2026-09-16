import type { Meta, StoryObj } from '@storybook/react';
import { FileTextIcon, LayersIcon, PaletteIcon, SettingsIcon } from 'lucide-react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/ui-staging/sidebar';

const meta = {
  title: 'Staging/Sidebar',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const nav = [
  { label: 'Foundations', icon: PaletteIcon, badge: '196' },
  { label: 'Components', icon: LayersIcon, badge: '1' },
  { label: 'Staging', icon: FileTextIcon, badge: '54' },
  { label: 'Settings', icon: SettingsIcon },
];

export const Showcase: Story = {
  render: () => (
    <Page
      title="Sidebar"
      tier="staging"
      summary="The largest component in the tier — twenty-four exported parts and a context provider. It is an application shell, not a control, and it expects to own the page it is on."
    >
      <Section
        title="A whole shell"
        description="SidebarProvider must wrap both the Sidebar and the content beside it. SidebarInset is that content area, and SidebarTrigger is the button that collapses the panel."
      >
        <Specimens columns={1}>
          <Specimen label="provider + sidebar + inset" full>
            <div className="h-80 w-full overflow-hidden rounded-md border border-outline-subtle">
              <SidebarProvider>
                <Sidebar collapsible="none">
                  <SidebarHeader>
                    <SidebarInput placeholder="Search…" />
                  </SidebarHeader>
                  <SidebarContent>
                    <SidebarGroup>
                      <SidebarGroupLabel>Library</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {nav.map((n, i) => (
                            <SidebarMenuItem key={n.label}>
                              <SidebarMenuButton isActive={i === 2}>
                                <n.icon />
                                {n.label}
                              </SidebarMenuButton>
                              {n.badge ? <SidebarMenuBadge>{n.badge}</SidebarMenuBadge> : null}
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                    <SidebarSeparator />
                    <SidebarGroup>
                      <SidebarGroupLabel>Loading</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          <SidebarMenuItem>
                            <SidebarMenuSkeleton showIcon />
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuSkeleton showIcon />
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  </SidebarContent>
                  <SidebarFooter>
                    <p className="px-2 text-xs text-fg-subtlest">agentic-ai-lab</p>
                  </SidebarFooter>
                </Sidebar>
                <SidebarInset>
                  <div className="flex items-center gap-2 border-b border-outline-subtle p-3 text-sm">
                    <SidebarTrigger />
                    <span className="text-fg-subtle">Staging</span>
                  </div>
                  <div className="p-4 text-sm text-fg-subtle">
                    SidebarInset is the page beside the panel. It must live inside the
                    same SidebarProvider.
                  </div>
                </SidebarInset>
              </SidebarProvider>
            </div>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Collapse behaviour"
        description="collapsible decides what happens when the trigger fires. The specimen above uses `none` so it stays put inside this page; a real app wants `icon` or `offcanvas`."
      >
        <Api
          rows={[
            {
              prop: 'Sidebar collapsible',
              type: "'offcanvas' | 'icon' | 'none'",
              def: "'offcanvas'",
              note: 'offcanvas slides away; icon shrinks to icons; none never collapses.',
            },
            { prop: 'Sidebar side', type: "'left' | 'right'", def: "'left'" },
            { prop: 'Sidebar variant', type: "'sidebar' | 'floating' | 'inset'", def: "'sidebar'" },
            {
              prop: 'SidebarProvider defaultOpen',
              type: 'boolean',
              def: 'true',
              note: 'Persisted to a cookie by the provider.',
            },
            { prop: 'SidebarMenuButton isActive', type: 'boolean', def: 'false' },
            {
              prop: 'useSidebar()',
              type: 'hook',
              note: 'Read or toggle open state from anywhere inside the provider.',
            },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <div className="space-y-3">
          <Note tone="warning">
            This component assumes it owns the viewport. Dropping it into a scrolling
            page — as this specimen does, deliberately boxed — is not what it is built
            for; in a real screen the provider goes at the top of the layout.
          </Note>
          <Note>
            <code className="font-mono text-xs">SidebarMenuButton</code> renders a button.
            For navigation give it{' '}
            <code className="font-mono text-xs">asChild</code> and put your router's link
            inside, or you lose middle-click, open-in-new-tab and the address bar.
          </Note>
        </div>
      </Section>
    </Page>
  ),
};
