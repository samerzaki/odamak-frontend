"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CATEGORY_META, assetDisplayUnit, assetSubLabel, formatAmount, formatEgp, formatPercent, numberValue } from "./portfolio-meta";
import type { PortfolioItem } from "@/types/portfolio";

interface AssetCardProps {
  item: PortfolioItem;
  isHidden: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function AssetCard({ item, isHidden, onEdit, onDelete }: AssetCardProps) {
  const { t, language } = useLanguage();
  const tp = t.pages.portfolio;
  const meta = CATEGORY_META[item.type];
  const Icon = meta.icon;

  const price = numberValue(item.current_price);
  const value = numberValue(item.current_value);
  const cost = numberValue(item.buy_price);
  const pl = numberValue(item.profit_loss);
  const plPercent = numberValue(item.profit_loss_percent);
  const unit = assetDisplayUnit(item, language);

  return (
    <div className="card-surface p-[18px] flex flex-col gap-3.5 transition-shadow hover:shadow-gold">
      <div className="flex items-start gap-2.5">
        <span className={cn("flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px]", meta.soft)}>
          <Icon className={cn("h-[18px] w-[18px]", meta.text)} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14.5px] font-semibold text-text truncate">{item.name}</div>
          <div className="text-[12px] text-muted mt-0.5">
            {assetSubLabel(item, language, tp.notRecorded)} · {formatAmount(item.amount)} {unit}
          </div>
        </div>
        <span
          className={cn(
            "num text-[11.5px] px-2 py-0.5 rounded-full shrink-0",
            plPercent === null ? "bg-panel-2 text-dim" : plPercent >= 0 ? "bg-up-soft text-up" : "bg-down-soft text-down"
          )}
        >
          {plPercent === null ? tp.notRecorded : formatPercent(plPercent)}
        </span>
      </div>

      <div className={cn(isHidden && "blur-sm select-none")}>
        <div className="text-[11.5px] text-muted">{tp.currentValue}</div>
        <div className="flex items-baseline gap-1.5">
          <span className={cn("num text-[23px] font-medium tracking-tight", value === null ? "text-dim" : "text-text")}>
            {value === null ? tp.notAvailable : formatAmount(value, 2)}
          </span>
          {value !== null && <span className="text-[12px] text-muted">{t.common.egp}</span>}
        </div>
      </div>

      <div className={cn("flex flex-col gap-1.5 text-[12.5px] border-t border-line-2 pt-2.5", isHidden && "blur-sm select-none")}>
        <div className="flex justify-between gap-2">
          <span className="text-muted">{tp.currentPriceLabel}</span>
          <span className={cn("num", price === null ? "text-dim" : "text-text")}>
            {price === null ? tp.notAvailable : formatEgp(price, tp.notAvailable, language)}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted">{tp.purchaseValue}</span>
          <span className={cn("num", cost === null ? "text-dim" : "text-text")}>
            {cost === null ? tp.notRecorded : formatEgp(item.purchase_value, tp.notRecorded, language)}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted">{tp.profitLoss}</span>
          <span className={cn("num font-semibold", pl === null ? "text-dim" : pl >= 0 ? "text-up" : "text-down")}>
            {pl === null ? tp.notRecorded : formatEgp(pl, tp.notAvailable, language)}
          </span>
        </div>
      </div>

      <div className="flex gap-2 border-t border-line-2 pt-2.5">
        <Button type="button" variant="outline" size="sm" onClick={onEdit} className="flex-1 gap-1.5">
          <Pencil className="h-3.5 w-3.5" />
          {tp.edit}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="gap-1.5 border-down/25 text-down hover:bg-down-soft hover:border-down/25"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {tp.delete}
        </Button>
      </div>
    </div>
  );
}
