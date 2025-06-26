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
      onMouseEnter: () => context.setOpen(true),
      onMouseLeave: () => context.setOpen(false),
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
        "fixed z-50 w-96 rounded-2xl border-0 bg-white p-0 text-popover-foreground shadow-2xl outline-none animate-in fade-in-0 zoom-in-95 duration-300",
        "left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2",
        "backdrop-blur-xl bg-white/95 border border-gray-100/50",
        "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/80 before:to-gray-50/80 before:-z-10",
        className
      )}
      style={{
        boxShadow:
          "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)",
      }}
      {...props}
    />
  );
});
HoverCardContent.displayName = "HoverCardContent";

export { HoverCard, HoverCardTrigger, HoverCardContent };
