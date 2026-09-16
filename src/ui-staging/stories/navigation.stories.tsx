import type { Meta, StoryObj } from '@storybook/react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/ui-staging/breadcrumb';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/ui-staging/menubar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/ui-staging/navigation-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/ui-staging/pagination';

const meta = {
  title: 'Staging/Breadcrumb, Pagination & Menus',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Breadcrumb, Pagination & Menus"
      tier="staging"
      summary="Four navigation surfaces. All of them render anchors that go nowhere until you give them an href or hand them to your router."
    >
      <Section
        title="Breadcrumb"
        description="The last crumb is BreadcrumbPage, not a link — it is where you already are. Making it a link is the most common error and it produces a link to the current page."
      >
        <Specimens columns={2}>
          <Specimen label="full trail" full>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">src</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">ui-staging</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>button.tsx</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </Specimen>
          <Specimen label="collapsed" hint="BreadcrumbEllipsis for deep trees" full>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">src</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>button.tsx</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Pagination"
        description="Presentation only — it computes no page numbers and tracks no state. isActive marks the current page and is what sets aria-current."
      >
        <Specimens columns={1}>
          <Specimen label="with ellipsis" full>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">12</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="NavigationMenu and Menubar"
        description="NavigationMenu is a site header's dropdown navigation. Menubar imitates a desktop application's File / Edit bar — a shape web users rarely expect, so use it only where the app really is one."
      >
        <Specimens columns={2}>
          <Specimen label="NavigationMenu" hint="site navigation">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Pipeline</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-56 gap-1 p-2">
                      {['Requirements', 'Specification', 'Implementation', 'Quality gate'].map(
                        (l) => (
                          <li key={l}>
                            <NavigationMenuLink href="#">{l}</NavigationMenuLink>
                          </li>
                        ),
                      )}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </Specimen>
          <Specimen label="Menubar" hint="desktop-app commands">
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    New spec <MenubarShortcut>⌘N</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Open prototype</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Storybook</MenubarItem>
                  <MenubarItem>Token inventory</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            {
              prop: 'BreadcrumbPage',
              type: 'span',
              note: 'The current page. Carries aria-current — never a link.',
            },
            {
              prop: 'PaginationLink isActive',
              type: 'boolean',
              def: 'false',
              note: 'Sets aria-current="page".',
            },
            {
              prop: 'PaginationPrevious / Next',
              type: 'a',
              note: 'Labelled anchors. Disable by omitting href.',
            },
            {
              prop: 'NavigationMenuLink href',
              type: 'string',
              note: 'Use asChild to hand it to a router Link.',
            },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <Note>
          Every anchor on this page points at{' '}
          <code className="font-mono text-xs">#</code>. In a real screen they take an
          href or wrap your router's Link with{' '}
          <code className="font-mono text-xs">asChild</code> — a prototype that navigates
          by onClick on a div loses middle-click, right-click and the keyboard along with
          it.
        </Note>
      </Section>
    </Page>
  ),
};
