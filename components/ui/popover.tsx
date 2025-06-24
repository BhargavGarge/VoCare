"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextType | undefined>(
  undefined
);

const Popover = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = ({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) => {
  const context = React.useContext(PopoverContext);
  if (!context) return null;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...children.props,
      onClick: (e: any) => {
        context.setOpen(!context.open);
        if (typeof children.props.onClick === "function") {
          children.props.onClick(e);
        }
      },
    });
  }

  return (
    <button onClick={() => context.setOpen(!context.open)}>{children}</button>
  );
};

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: string; sideOffset?: number }
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  const context = React.useContext(PopoverContext);
  if (!context || !context.open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none top-full mt-1",
        className
      )}
      {...props}
    />
  );
});
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
