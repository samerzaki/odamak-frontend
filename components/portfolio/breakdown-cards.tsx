"use client";

import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { CATEGORY_META, formatEgp, numberValue } from "./portfolio-meta";
import type { PortfolioSummary } from "@/types/portfolio";

const KEYS = ["gold", "silver", "currencies", "crypto"] as const;
const TYPE_BY_KEY = { gold: "gold", silver: "silver", currencies: "currency", crypto: "crypto" } as const;

interface BreakdownCardsProps {
  breakdown: PortfolioSummary["breakdown"] | undefined;
  totalValue: number | null;
  isHidden: boolean;
}

export function BreakdownCards({ breakdown, totalValue, isHidden }: BreakdownCardsProps) {
  const { t, language } = useLanguage();
  const tp = t.pages.portfolio;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
      {KEYS.map((key) => {
        const item = breakdown?.[key];
        const meta = CATEGORY_META[TYPE_BY_KEY[key]];
        const Icon = meta.icon;
        const value = numberValue(item?.current_value);
        const pl = numberValue(item?.profit_loss);
        const hasCost = numberValue(item?.purchase_value) !== null && numberValue(item?.purchase_value) !== 0;
        const pct = value !== null && totalValue ? (value / totalValue) * 100 : 0;

        return (
          <div key={key} className="card-surface p-[18px] flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className={cn("flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px]", meta.soft)}>
                <Icon className={cn("h-4 w-4", meta.text)} />
              </span>
              <span className="text-[14.5px] font-semibold text-text">{tp[key]}</span>
              <div className="flex-1" />
              <span className="text-[11.5px] text-muted">
                {item?.assets_count ?? 0} {tp.assetsSuffix}
              </span>
            </div>

            <div className={cn(isHidden && "blur-sm select-none")}>
              <div className="num text-[22px] font-medium tracking-tight text-text">
                {formatEgp(value, tp.notAvailable, language)}
              </div>
              <div className="text-[12px] text-muted mt-0.5">{pct.toFixed(1)}% {tp.assetDistribution}</div>
            </div>

            <div className="h-1.5 rounded-full bg-panel-2 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100).toFixed(1)}%`, background: meta.cssVar }} />
            </div>

            <div className={cn("flex items-center justify-between border-t border-line-2 pt-2.5 text-[12.5px]", isHidden && "blur-sm select-none")}>
              <span className="text-muted">{tp.profitLoss}</span>
              <span className={cn("num font-semibold", !hasCost ? "text-dim" : pl !== null && pl >= 0 ? "text-up" : "text-down")}>
                {!hasCost ? tp.notRecorded : formatEgp(pl, tp.notAvailable, language)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
