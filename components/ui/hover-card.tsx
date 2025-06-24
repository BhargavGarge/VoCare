"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface HoverCardContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const HoverCardContext = React.createContext<HoverCardContextType | undefined>(
  undefined
);

const HoverCard = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <HoverCardContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </HoverCardContext.Provider>
  );
};

const HoverCardTrigger = ({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) => {
  const context = React.useContext(HoverCardContext);
  if (!context) return null;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      onMouseEnter: (e: React.MouseEvent) => {
        children.props.onMouseEnter?.(e);
        context.setOpen(true);
      },
      onMouseLeave: (e: React.MouseEvent) => {
        children.props.onMouseLeave?.(e);
        context.setOpen(false);
      },
    });
  }

  return (
    <div
      onMouseEnter={() => context.setOpen(true)}
      onMouseLeave={() => context.setOpen(false)}
    >
      {children}
    </div>
  );
};

const HoverCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: string; sideOffset?: number }
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  const context = React.useContext(HoverCardContext);
  if (!context || !context.open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none top-full mt-2",
        className
      )}
      {...props}
    />
  );
});
HoverCardContent.displayName = "HoverCardContent";

export { HoverCard, HoverCardTrigger, HoverCardContent };
