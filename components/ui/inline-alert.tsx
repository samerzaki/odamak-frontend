import { AlertCircle, CheckCircle2, Info, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type InlineAlertVariant = "error" | "success" | "info";

const VARIANT_CLASSES: Record<InlineAlertVariant, string> = {
  error: "text-down bg-down-soft",
  success: "text-up bg-up-soft",
  info: "text-gold bg-gold-soft",
};

const VARIANT_ICONS: Record<InlineAlertVariant, typeof AlertCircle> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

interface InlineAlertProps {
  variant: InlineAlertVariant;
  children: React.ReactNode;
  className?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/** The canonical settings/auth-page alert box — token-based, no icon by default for compact rows. */
export function InlineAlert({ variant, children, className, onRetry, retryLabel }: InlineAlertProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-[10px] p-3 text-[13px]",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      <span>{children}</span>
      {onRetry && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onRetry}
          className="shrink-0 text-inherit hover:bg-black/5 dark:hover:bg-white/5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

/** Icon + heading variant for full-width error states (e.g. failed list load). */
export function InlineAlertBlock({ variant, title, description, onRetry, retryLabel }: {
  variant: InlineAlertVariant;
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  const Icon = VARIANT_ICONS[variant];
  return (
    <div className="card-surface border border-down/20 p-6">
      <div className="flex items-center gap-3">
        <Icon className={cn("h-6 w-6 shrink-0", variant === "error" ? "text-down" : variant === "success" ? "text-up" : "text-gold")} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-text">{title}</h3>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
        {onRetry && (
          <Button type="button" size="sm" variant="outline" onClick={onRetry} className="shrink-0">
            <RefreshCw className="h-4 w-4" />
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
