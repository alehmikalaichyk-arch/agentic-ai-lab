import type { Meta, StoryObj } from '@storybook/react';

import { AspectRatio } from '@/ui-staging/aspect-ratio';
import { Avatar, AvatarFallback, AvatarGroup } from '@/ui-staging/avatar';
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/ui-staging/empty';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/ui-staging/item';
import { Kbd, KbdGroup } from '@/ui-staging/kbd';
import { Progress } from '@/ui-staging/progress';
import { ScrollArea } from '@/ui-staging/scroll-area';
import { Separator } from '@/ui-staging/separator';
import { Skeleton } from '@/ui-staging/skeleton';
import { Spinner } from '@/ui-staging/spinner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui-staging/table';

import { Case, Col, Grid, Row } from './shared';

/*
 * Staging tier — surfaces and data display. See ./forms.stories.tsx for what this
 * tier is and is not.
 */
const meta = {
  title: 'Staging/Catalogue/Data display',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DataDisplay: Story = {
  render: () => (
    <Grid>
      <Case name="card">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Deployment</CardTitle>
            <CardDescription>Last run 4 minutes ago.</CardDescription>
            <CardAction>
              <Badge>live</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Progress value={72} />
          </CardContent>
          <CardFooter className="gap-2">
            <Button size="sm">Promote</Button>
            <Button size="sm" variant="ghost">
              Logs
            </Button>
          </CardFooter>
        </Card>
      </Case>

      <Case name="badge">
        <Row>
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </Row>
      </Case>

      <Case name="avatar">
        <Row>
          <Avatar>
            <AvatarFallback>OM</AvatarFallback>
          </Avatar>
          <AvatarGroup>
            <Avatar>
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>B</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
          </AvatarGroup>
        </Row>
      </Case>

      <Case name="table">
        <Table>
          <TableCaption>Components by tier.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Component</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Spec</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Input</TableCell>
              <TableCell>components/ui</TableCell>
              <TableCell>frozen</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Button</TableCell>
              <TableCell>ui-staging</TableCell>
              <TableCell>none yet</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Case>

      <Case name="item">
        <ItemGroup className="max-w-md">
          <Item>
            <ItemContent>
              <ItemTitle>token-guardian</ItemTitle>
              <ItemDescription>Detects violations; never fixes them.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button size="sm" variant="ghost">
                Run
              </Button>
            </ItemActions>
          </Item>
          <Item>
            <ItemContent>
              <ItemTitle>production-quality-gate</ItemTitle>
              <ItemDescription>The single binary merge decision.</ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      </Case>

      <Case name="empty">
        <Empty className="max-w-md">
          <EmptyHeader>
            <EmptyTitle>No components staged</EmptyTitle>
            <EmptyDescription>Pull one from the registry to begin.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm">Add component</Button>
          </EmptyContent>
        </Empty>
      </Case>

      <Case name="progress  /  spinner  /  skeleton">
        <Col>
          <Progress value={40} className="max-w-sm" />
          <Spinner />
          <div className="flex max-w-sm items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </Col>
      </Case>

      <Case name="separator  /  kbd">
        <Col>
          <div className="flex h-6 items-center gap-3">
            <span className="text-sm">Left</span>
            <Separator orientation="vertical" />
            <span className="text-sm">Right</span>
          </div>
          <Separator />
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Col>
      </Case>

      <Case name="scroll-area  /  aspect-ratio">
        <Row>
          <ScrollArea className="h-32 w-56 rounded-md border border-outline-subtle p-3">
            <div className="space-y-2 text-sm">
              {Array.from({ length: 12 }, (_, i) => (
                <p key={i}>Scrollable row {i + 1}</p>
              ))}
            </div>
          </ScrollArea>
          <div className="w-56">
            <AspectRatio ratio={16 / 9}>
              <div className="flex size-full items-center justify-center rounded-md bg-surface-neutral-subtle text-sm">
                16 / 9
              </div>
            </AspectRatio>
          </div>
        </Row>
      </Case>
    </Grid>
  ),
};
