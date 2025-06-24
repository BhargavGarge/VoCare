"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextType | undefined>(
  undefined
);

const Dialog = ({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  return (
    <DialogContext.Provider
      value={{ open: open || false, onOpenChange: onOpenChange || (() => {}) }}
    >
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger = ({
  children,
  asChild,
  ...props
}: {
  children: React.ReactNode;
  asChild?: boolean;
} & React.HTMLAttributes<HTMLElement>) => {
  const context = React.useContext(DialogContext);
  if (!context) return null;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...props,
      onClick: (e: any) => {
        context.onOpenChange(true);
        if (typeof children.props.onClick === "function") {
          children.props.onClick(e);
        }
      },
    });
  }

  return (
    <button {...props} onClick={() => context.onOpenChange(true)}>
      {children}
    </button>
  );
};

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(DialogContext);
  if (!context || !context.open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div
        ref={ref}
        className={cn(
          "relative bg-background p-6 shadow-lg duration-200 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto",
          className
        )}
        {...props}
      >
        {children}
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => context.onOpenChange(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };
