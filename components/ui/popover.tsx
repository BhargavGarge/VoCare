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
    return React.cloneElement(children, {
      onClick: (e: any) => {
        context.setOpen(!context.open);
        children.props.onClick?.(e);
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

  let positionClass = "left-0";
  if (align === "end") positionClass = "right-0";
  if (align === "center") positionClass = "left-1/2 transform -translate-x-1/2";

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95",
        `top-full mt-${sideOffset}`,
        positionClass,
        className
      )}
      {...props}
    />
  );
});
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
