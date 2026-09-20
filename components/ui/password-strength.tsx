"use client";

import { cn } from "@/lib/utils";

export type PasswordStrengthLevel = 0 | 1 | 2 | 3;

export function scorePassword(password: string): PasswordStrengthLevel {
  if (!password) return 0;
  const score =
    (password.length >= 6 ? 1 : 0) +
    (/\d/.test(password) ? 1 : 0) +
    (/[^\w\s]/.test(password) || password.length >= 10 ? 1 : 0);
  return Math.max(score, 1) as PasswordStrengthLevel;
}

const LEVEL_CLASSES: Record<PasswordStrengthLevel, { bar: string; text: string; width: string }> = {
  0: { bar: "bg-line", text: "text-dim", width: "0%" },
  1: { bar: "bg-down", text: "text-down", width: "33%" },
  2: { bar: "bg-warn", text: "text-warn", width: "66%" },
  3: { bar: "bg-up", text: "text-up", width: "100%" },
};

interface PasswordStrengthProps {
  password: string;
  labels: [string, string, string, string];
  className?: string;
}

/** Strength meter shared by register + change-password forms. */
export function PasswordStrength({ password, labels, className }: PasswordStrengthProps) {
  const level = scorePassword(password);
  const { bar, text, width } = LEVEL_CLASSES[level];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex-1 h-1.5 rounded-full bg-panel-2 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", bar)} style={{ width }} />
      </div>
      <span className={cn("text-[12.5px] font-semibold shrink-0", text)}>{labels[level]}</span>
    </div>
  );
}
