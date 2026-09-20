"use client";

import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { CATEGORY_META, assetSubLabel, assetDisplayUnit, formatAmount, formatEgp, formatPercent, numberValue } from "./portfolio-meta";
import type { PortfolioItem } from "@/types/portfolio";

interface AssetTableProps {
  items: PortfolioItem[];
  isHidden: boolean;
}

export function AssetTable({ items, isHidden }: AssetTableProps) {
  const { t, language } = useLanguage();
  const tp = t.pages.portfolio;

  return (
    <div className="card-surface overflow-x-auto">
      <div className="min-w-[820px]">
        <div className="grid grid-cols-[2fr_1fr_1.1fr_1.2fr_1.2fr_1fr] gap-2.5 px-[18px] py-3 bg-panel-2 text-[12.5px] font-semibold text-muted">
          <span className="ps-1">{tp.columnAsset}</span>
          <span>{tp.columnAmount}</span>
          <span>{tp.columnPrice}</span>
          <span>{tp.columnCurrentValue}</span>
          <span>{tp.columnPurchaseValue}</span>
          <span>{tp.columnProfitLoss}</span>
        </div>
        {items.map((item) => {
          const meta = CATEGORY_META[item.type];
          const Icon = meta.icon;
          const price = numberValue(item.current_price);
          const value = numberValue(item.current_value);
          const cost = numberValue(item.buy_price);
          const pl = numberValue(item.profit_loss);
          const unit = assetDisplayUnit(item, language);

          return (
            <div
              key={item.id}
              className="grid grid-cols-[2fr_1fr_1.1fr_1.2fr_1.2fr_1fr] gap-2.5 px-[18px] py-3.5 border-t border-line-2 items-center text-[13.5px] hover:bg-hover"
            >
              <span className="flex items-center gap-2.5 min-w-0 ps-1">
                <span className={cn("flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[8px]", meta.soft)}>
                  <Icon className={cn("h-3.5 w-3.5", meta.text)} />
                </span>
                <span className="min-w-0">
                  <span className="font-semibold text-text block truncate">{item.name}</span>
                  <span className="text-[11.5px] text-muted">{assetSubLabel(item, language, tp.notRecorded)}</span>
                </span>
              </span>
              <span className={cn("num", isHidden && "blur-sm select-none")}>{formatAmount(item.amount)} {unit}</span>
              <span className={cn("num", price === null ? "text-dim" : "text-text", isHidden && "blur-sm select-none")}>
                {price === null ? tp.notAvailable : formatEgp(price, tp.notAvailable, language)}
              </span>
              <span className={cn("num font-medium", value === null ? "text-dim" : "text-text", isHidden && "blur-sm select-none")}>
                {value === null ? tp.notAvailable : formatEgp(value, tp.notAvailable, language)}
              </span>
              <span className={cn("num", cost === null ? "text-dim" : "text-text", isHidden && "blur-sm select-none")}>
                {cost === null ? tp.notRecorded : formatEgp(item.purchase_value, tp.notRecorded, language)}
              </span>
              <span
                className={cn(
                  "num font-semibold",
                  pl === null ? "text-dim" : pl >= 0 ? "text-up" : "text-down",
                  isHidden && "blur-sm select-none"
                )}
              >
                {pl === null ? tp.notRecorded : formatPercent(numberValue(item.profit_loss_percent))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
