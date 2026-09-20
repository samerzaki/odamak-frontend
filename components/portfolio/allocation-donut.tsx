"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { CATEGORY_META, formatEgpNumber } from "./portfolio-meta";
import type { PortfolioSummary } from "@/types/portfolio";

type CategoryKey = "gold" | "silver" | "currencies" | "crypto";
const CATEGORY_KEYS: CategoryKey[] = ["gold", "silver", "currencies", "crypto"];
const TYPE_BY_KEY = { gold: "gold", silver: "silver", currencies: "currency", crypto: "crypto" } as const;

interface AllocationDonutProps {
  breakdown: PortfolioSummary["breakdown"] | undefined;
  allocation: PortfolioSummary["allocation"] | undefined;
  isHidden: boolean;
}

const R = 76;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function AllocationDonut({ breakdown, allocation, isHidden }: AllocationDonutProps) {
  const { t } = useLanguage();
  const tp = t.pages.portfolio;
  const [hover, setHover] = useState<CategoryKey | null>(null);

  const allocationAvailable =
    !!allocation &&
    allocation.gold_percent !== null &&
    allocation.silver_percent !== null &&
    allocation.currencies_percent !== null &&
    allocation.crypto_percent !== null;

  const [mode, setMode] = useState<"value" | "count">(allocationAvailable ? "value" : "count");
  const effectiveMode = allocationAvailable ? mode : "count";

  const categoryLabel = (key: CategoryKey) => tp[key];

  const totalCount = CATEGORY_KEYS.reduce((sum, key) => sum + (breakdown?.[key]?.assets_count ?? 0), 0);

  const percentFor = (key: CategoryKey): number => {
    if (effectiveMode === "value") {
      const map = { gold: allocation?.gold_percent, silver: allocation?.silver_percent, currencies: allocation?.currencies_percent, crypto: allocation?.crypto_percent };
      return map[key] ?? 0;
    }
    return totalCount ? ((breakdown?.[key]?.assets_count ?? 0) / totalCount) * 100 : 0;
  };

  let acc = 0;
  const slices = CATEGORY_KEYS.map((key) => {
    const pct = percentFor(key);
    const len = (pct / 100) * CIRCUMFERENCE - (pct > 0 ? 2.5 : 0);
    const slice = {
      key,
      color: CATEGORY_META[TYPE_BY_KEY[key]].cssVar,
      width: hover === key ? 34 : 26,
      dash: `${Math.max(len, 0).toFixed(2)} ${CIRCUMFERENCE.toFixed(2)}`,
      offset: (-acc * CIRCUMFERENCE).toFixed(2),
    };
    acc += pct / 100;
    return slice;
  }).filter((s) => percentFor(s.key) > 0);

  const hovered = hover ? breakdown?.[hover] : null;
  const centerValue = hover
    ? effectiveMode === "count"
      ? String(hovered?.assets_count ?? 0)
      : formatEgpNumber(hovered?.current_value, tp.notAvailable)
    : effectiveMode === "count"
      ? String(totalCount)
      : formatEgpNumber(
          breakdown
            ? CATEGORY_KEYS.reduce((sum, key) => {
                const v = breakdown[key]?.current_value;
                return sum + (typeof v === "number" ? v : v ? Number(v) : 0);
              }, 0)
            : null,
          tp.notAvailable
        );
  const centerLabel = hover ? categoryLabel(hover) : effectiveMode === "count" ? tp.myAssets : tp.assetDistribution;

  return (
    <div className="card-surface p-5 md:p-6">
      <div className="flex items-center gap-2.5 mb-1">
        <h3 className="font-heading text-[15px] md:text-[16px] font-semibold text-text">{tp.assetDistribution}</h3>
        <div className="flex-1" />
        <SegmentedControl
          items={[
            { value: "value", label: tp.distributionByValue },
            { value: "count", label: tp.distributionByCount },
          ]}
          value={effectiveMode}
          onChange={(v) => setMode(v as "value" | "count")}
        />
      </div>

      <div className="flex items-center gap-5 flex-wrap mt-2">
        <div className="relative w-[164px] h-[164px] shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
            <circle cx="100" cy="100" r={R} fill="none" stroke="var(--line2)" strokeWidth={22} />
            {slices.map((s) => (
              <circle
                key={s.key}
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={s.width}
                strokeDasharray={s.dash}
                strokeDashoffset={s.offset}
                onMouseEnter={() => setHover(s.key)}
                onMouseLeave={() => setHover(null)}
                className="cursor-pointer transition-[stroke-width] duration-150"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
            <div className="text-[11px] text-muted truncate max-w-full">{centerLabel}</div>
            <div className={cn("num text-[19px] font-medium tracking-tight", isHidden && "blur-sm select-none")}>
              {centerValue}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-[150px] flex flex-col gap-0.5">
          {CATEGORY_KEYS.map((key) => {
            const pct = percentFor(key);
            return (
              <div
                key={key}
                onMouseEnter={() => setHover(key)}
                onMouseLeave={() => setHover(null)}
                className={cn("flex items-center gap-2.5 px-2 py-2 rounded-[9px] cursor-pointer", hover === key ? "bg-panel-2" : "")}
              >
                <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: CATEGORY_META[TYPE_BY_KEY[key]].cssVar }} />
                <span className="text-[13.5px] font-medium text-text">{categoryLabel(key)}</span>
                <div className="flex-1" />
                <span className="num text-[13.5px] font-medium text-text">
                  {effectiveMode === "count" ? `${breakdown?.[key]?.assets_count ?? 0}` : `${pct.toFixed(2)}%`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
