"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  placeholder?: string;
}

const SelectContext = React.createContext<SelectContextType | undefined>(
  undefined
);

const Select = ({
  children,
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const [displayText, setDisplayText] = React.useState(value || "");

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-select-root]")) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [open]);

  React.useEffect(() => {
    if (!value) {
      setDisplayText("");
    } else {
      setDisplayText(value);
    }
  }, [value]);

  return (
    <SelectContext.Provider
      value={{
        value: value || "",
        onValueChange: onValueChange || (() => {}),
        open,
        setOpen,
      }}
    >
      <div className="relative" data-select-root>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  if (!context) return null;

  return (
    <button
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        context.setOpen(!context.open);
      }}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const context = React.useContext(SelectContext);
  if (!context) return null;

  return <span className="truncate">{context.value || placeholder || ""}</span>;
};

const SelectContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const context = React.useContext(SelectContext);
  if (!context || !context.open) return null;

  return (
    <div
      className={cn(
        "absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-1">{children}</div>
    </div>
  );
};

const SelectItem = ({
  children,
  value,
  className,
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
}) => {
  const context = React.useContext(SelectContext);
  if (!context) return null;

  const isSelected = context.value === value;

  return (
    <div
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected && "bg-accent text-accent-foreground",
        className
      )}
      onClick={() => {
        context.onValueChange(value);
        context.setOpen(false);
      }}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
