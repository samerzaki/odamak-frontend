"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  className?: string;
}

/** Token-based checkbox, styled as a labeled toggle button (no native input). */
export function Checkbox({ checked, onCheckedChange, disabled = false, label, className }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "inline-flex items-center gap-2.5 text-[13px] text-text",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span
        className={cn(
          "flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-[6px] border transition-colors",
          checked ? "bg-gold border-gold" : "bg-panel border-line"
        )}
      >
        {checked && <Check className="h-3 w-3 text-on-gold" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}
