"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
}

/**
 * Token-based on/off switch. Uses logical positioning (start-/end-) so it
 * mirrors correctly in RTL without any isRTL branching.
 */
export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  ...aria
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        checked ? "bg-gold border-gold" : "bg-panel-2 border-line",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...aria}
    >
      <span
        className={cn(
          "absolute h-4 w-4 rounded-full bg-panel shadow-card transition-all",
          checked ? "end-1" : "start-1"
        )}
      />
    </button>
  );
}
