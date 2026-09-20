"use client";

import { Eye, EyeOff, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { formatEgp, formatEgpNumber, formatPercent } from "./portfolio-meta";

interface PortfolioHeroProps {
  totalValue: number | null;
  assetsCount: number;
  profit: number | null;
  profitPercent: number | null;
  purchaseValue: number | null;
  pricedCount: number;
  bestCategoryLabel: string | null;
  isHidden: boolean;
  onToggleHidden: () => void;
}

export function PortfolioHero({
  totalValue,
  assetsCount,
  profit,
  profitPercent,
  purchaseValue,
  pricedCount,
  bestCategoryLabel,
  isHidden,
  onToggleHidden,
}: PortfolioHeroProps) {
  const { t, language } = useLanguage();
  const tp = t.pages.portfolio;

  return (
    <div className="relative overflow-hidden rounded-[20px] bg-gold text-on-gold p-6 md:p-7 flex flex-col">
      <div className="absolute -bottom-[70px] start-[-50px] w-[240px] h-[240px] rounded-full bg-warn/[0.22]" />

      <div className="relative flex items-center gap-3 flex-wrap">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 shrink-0">
          <Wallet className="h-5 w-5" />
        </span>
        <span className="text-[14.5px] font-semibold">{tp.totalWealth}</span>
        <span className="text-[11.5px] bg-white/[0.16] px-2.5 py-1 rounded-full">
          {assetsCount} {tp.assetsSuffix}
        </span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onToggleHidden}
          className="inline-flex items-center gap-1.5 bg-white/[0.14] hover:bg-white/[0.26] rounded-[9px] px-3 py-1.5 text-[12px] transition-colors"
        >
          {isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {isHidden ? tp.showNumbers : tp.hideNumbers}
        </button>
      </div>

      <div className="relative flex items-end gap-3 flex-wrap mt-3">
        <div className={cn("num text-[36px] md:text-[44px] font-medium leading-none tracking-tight", isHidden && "blur-md select-none")}>
          {formatEgpNumber(totalValue, tp.notAvailable)}
        </div>
        <div className="pb-1.5 text-[13px] text-on-gold/75">{t.common.egp}</div>
      </div>

      <div
        className={cn(
          "relative inline-flex items-center gap-2 mt-3 w-fit rounded-full px-3 py-1.5 text-[13.5px] font-semibold num",
          profit === null ? "bg-white/[0.14] text-on-gold/75" : profit >= 0 ? "bg-up-soft text-up" : "bg-down-soft text-down",
          isHidden && "blur-md select-none"
        )}
      >
        {profit !== null && (profit >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />)}
        <span>
          {profit === null
            ? tp.notAvailable
            : `${formatEgp(profit, tp.notAvailable, language)} (${formatPercent(profitPercent)})`}
        </span>
      </div>

      <div className="relative flex gap-6 flex-wrap mt-auto pt-5 text-[13px]">
        <div>
          <div className="text-on-gold/70 text-[12px]">{tp.purchaseValue}</div>
          <div className={cn("num text-[16px] mt-0.5", isHidden && "blur-sm select-none")}>
            {formatEgp(purchaseValue, tp.notRecorded, language)}
          </div>
        </div>
        <div>
          <div className="text-on-gold/70 text-[12px]">{tp.pricedAssets}</div>
          <div className="num text-[16px] mt-0.5">
            {pricedCount} {tp.ofLabel} {assetsCount}
          </div>
        </div>
        <div>
          <div className="text-on-gold/70 text-[12px]">{tp.bestCategory}</div>
          <div className="text-[15px] font-semibold mt-0.5">{bestCategoryLabel ?? tp.notAvailable}</div>
        </div>
      </div>
    </div>
  );
}
