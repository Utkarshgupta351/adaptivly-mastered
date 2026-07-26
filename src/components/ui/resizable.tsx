import * as React from "react";
import { GripVertical } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({
  className,
  direction = "horizontal",
  ...props
}: React.ComponentProps<typeof Group> & { direction?: "horizontal" | "vertical" }) => (
  <Group
    orientation={direction}
    className={cn("h-full w-full", className)}
    {...props}
  />
);

const ResizablePanel = Panel as any;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean;
}) => (
  <Separator
    className={cn(
      "relative flex shrink-0 items-center justify-center bg-border/50 transition-colors hover:bg-primary/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
      "[aria-orientation=vertical]:w-1.5 [aria-orientation=vertical]:cursor-col-resize",
      "[aria-orientation=horizontal]:h-1.5 [aria-orientation=horizontal]:w-full [aria-orientation=horizontal]:cursor-row-resize",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </Separator>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
