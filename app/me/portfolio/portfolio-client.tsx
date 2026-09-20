"use client";

import { useMemo, useState } from "react";
import { Coins, Gem, Landmark, Bitcoin, Plus, Wallet } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/components/ui/api-error";
import { InlineAlert } from "@/components/ui/inline-alert";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useDeletePortfolioItem,
  usePortfolio,
  usePortfolioOptions,
  usePortfolioSummary,
} from "@/hooks/use-portfolio";
import { PortfolioHero } from "@/components/portfolio/portfolio-hero";
import { AllocationDonut } from "@/components/portfolio/allocation-donut";
import { BreakdownCards } from "@/components/portfolio/breakdown-cards";
import { AssetCard } from "@/components/portfolio/asset-card";
import { AssetTable } from "@/components/portfolio/asset-table";
import { AssetDrawer } from "@/components/portfolio/asset-drawer";
import { CATEGORY_META, numberValue } from "@/components/portfolio/portfolio-meta";
import type { PortfolioAssetType, PortfolioFilterType, PortfolioItem } from "@/types/portfolio";

const FILTER_TYPES: PortfolioFilterType[] = ["all", "gold", "silver", "currency", "crypto"];
const QUICK_ADD_ICONS: Record<PortfolioAssetType, typeof Coins> = { gold: Coins, silver: Gem, currency: Landmark, crypto: Bitcoin };

export default function PortfolioPage() {
  const { t, language } = useLanguage();
  const tp = t.pages.portfolio;

  const [isHidden, setIsHidden] = useState(false);
  const [filter, setFilter] = useState<PortfolioFilterType>("all");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [drawerInitialType, setDrawerInitialType] = useState<PortfolioAssetType>("gold");
  const [deleteTarget, setDeleteTarget] = useState<PortfolioItem | null>(null);

  const portfolio = usePortfolio();
  const summaryQuery = usePortfolioSummary();
  const optionsQuery = usePortfolioOptions();
  const deleteMutation = useDeletePortfolioItem();

  const items = useMemo(() => portfolio.data?.data ?? [], [portfolio.data]);
  const summary = summaryQuery.data?.data;

  const counts = useMemo(
    () => ({
      all: items.length,
      gold: items.filter((i) => i.type === "gold").length,
      silver: items.filter((i) => i.type === "silver").length,
      currency: items.filter((i) => i.type === "currency").length,
      crypto: items.filter((i) => i.type === "crypto").length,
    }),
    [items]
  );
  const visibleItems = filter === "all" ? items : items.filter((i) => i.type === filter);

  const openCreate = (type: PortfolioAssetType = "gold") => {
    setEditingItem(null);
    setDrawerInitialType(type);
    setDrawerOpen(true);
  };
  const openEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setDrawerOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (portfolio.isLoading || summaryQuery.isLoading) {
    return (
      <div className="space-y-5 pb-10">
        <PageHeader title={tp.title} lead={tp.subtitle} />
        <Skeleton className="h-[210px] w-full rounded-[20px]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[120px] rounded-[16px]" />
          ))}
        </div>
      </div>
    );
  }

  if (portfolio.error || summaryQuery.error) {
    return (
      <div className="space-y-5 pb-10">
        <PageHeader title={tp.title} lead={tp.subtitle} />
        <ApiError
          error={(portfolio.error ?? summaryQuery.error)!}
          retry={() => {
            void portfolio.refetch();
            void summaryQuery.refetch();
          }}
        />
      </div>
    );
  }

  const totalValue = numberValue(summary?.total_current_value);
  const purchaseValue = numberValue(summary?.total_purchase_value);
  const profit = numberValue(summary?.total_profit_loss);
  const profitPercent = numberValue(summary?.total_profit_loss_percent);
  const pricedCount = items.filter((i) => numberValue(i.purchase_value) !== null).length;

  const breakdownEntries = summary
    ? (["gold", "silver", "currencies", "crypto"] as const).map((key) => ({ key, item: summary.breakdown[key] }))
    : [];
  const best = breakdownEntries
    .filter(({ item }) => {
      const cost = numberValue(item.purchase_value);
      return cost !== null && cost !== 0;
    })
    .sort((a, b) => (numberValue(b.item.profit_loss_percent) ?? -Infinity) - (numberValue(a.item.profit_loss_percent) ?? -Infinity))[0];
  const bestCategoryLabel = best ? tp[best.key] : null;

  const isEmpty = items.length === 0;

  return (
    <div className="space-y-5 pb-10">
      <PageHeader
        title={tp.title}
        lead={`${tp.subtitle} · ${tp.lastUpdated} ${formatDateTime(portfolio.dataUpdatedAt ? new Date(portfolio.dataUpdatedAt) : null, language)}`}
        actions={
          <Button onClick={() => openCreate()} className="gap-1.5">
            <Plus className="h-4 w-4" />
            {tp.addAsset}
          </Button>
        }
      />

      {isEmpty ? (
        <div className="card-surface rounded-[20px] py-16 px-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-gold-soft">
            <Wallet className="h-6 w-6 text-gold" />
          </div>
          <div className="text-[19px] font-bold text-text">{tp.emptyTitle}</div>
          <p className="mx-auto mt-2 max-w-[440px] text-[13.5px] text-muted leading-relaxed">{tp.emptyDescription}</p>
          <div className="flex justify-center gap-2 flex-wrap mt-5">
            {(["gold", "silver", "currency", "crypto"] as PortfolioAssetType[]).map((type) => {
              const Icon = QUICK_ADD_ICONS[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => openCreate(type)}
                  className="inline-flex items-center gap-2 rounded-[12px] border border-line bg-panel px-4 py-2.5 text-[13.5px] font-semibold text-text hover:border-gold hover:bg-hover"
                >
                  <Icon className={cn("h-4 w-4", CATEGORY_META[type].text)} />
                  {tp[type === "currency" ? "currencies" : type]}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
            <PortfolioHero
              totalValue={totalValue}
              assetsCount={items.length}
              profit={profit}
              profitPercent={profitPercent}
              purchaseValue={purchaseValue}
              pricedCount={pricedCount}
              bestCategoryLabel={bestCategoryLabel}
              isHidden={isHidden}
              onToggleHidden={() => setIsHidden((v) => !v)}
            />
            <AllocationDonut breakdown={summary?.breakdown} allocation={summary?.allocation} isHidden={isHidden} />
          </div>

          <BreakdownCards breakdown={summary?.breakdown} totalValue={totalValue} isHidden={isHidden} />

          <div className="flex items-center gap-2.5 flex-wrap mt-2">
            <h2 className="font-heading text-[17px] font-semibold text-text">{tp.myAssets}</h2>
            <div className="flex-1" />
            <div className="flex gap-1.5 flex-wrap">
              {FILTER_TYPES.map((f) => {
                const active = filter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[12.5px] font-semibold border transition-colors",
                      active ? "bg-inv-bg text-inv-text border-inv-bg" : "bg-panel text-muted border-line hover:border-gold hover:text-gold"
                    )}
                  >
                    {tp[f === "all" ? "all" : f === "currency" ? "currencies" : f]} {counts[f]}
                  </button>
                );
              })}
            </div>
            <SegmentedControl
              items={[
                { value: "cards", label: tp.viewCards },
                { value: "table", label: tp.viewTable },
              ]}
              value={view}
              onChange={(v) => setView(v as "cards" | "table")}
            />
          </div>

          {view === "cards" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {visibleItems.map((item) => (
                <AssetCard key={item.id} item={item} isHidden={isHidden} onEdit={() => openEdit(item)} onDelete={() => setDeleteTarget(item)} />
              ))}
            </div>
          ) : (
            <AssetTable items={visibleItems} isHidden={isHidden} />
          )}

          <InlineAlert variant="info">{tp.infoNoteBody}</InlineAlert>
        </>
      )}

      <AssetDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        item={editingItem}
        initialType={drawerInitialType}
        options={optionsQuery.data?.data}
        optionsLoading={optionsQuery.isLoading}
        optionsError={optionsQuery.error}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={tp.deleteConfirmTitle}
        description={tp.deleteConfirmDescription}
        confirmLabel={tp.delete}
        cancelLabel={tp.cancel}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
