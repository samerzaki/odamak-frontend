"use client";

import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogClose, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { useCreatePortfolioItem, useUpdatePortfolioItem } from "@/hooks/use-portfolio";
import { CATEGORY_META, amountUnit, identifierLabel, identifierOptions, firstIdentifier } from "./portfolio-meta";
import type { CreatePortfolioItemRequest, PortfolioAssetType, PortfolioItem, PortfolioOptions } from "@/types/portfolio";

const DECIMAL_PATTERN = /^(?:\d+(?:\.\d{1,8})?|\.\d{1,8})$/;
const TYPES: PortfolioAssetType[] = ["gold", "silver", "currency", "crypto"];

interface AssetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: PortfolioItem | null;
  options: PortfolioOptions | undefined;
  optionsLoading: boolean;
  optionsError: Error | null;
  initialType?: PortfolioAssetType;
}

export function AssetDrawer({ open, onOpenChange, item, options, optionsLoading, optionsError, initialType }: AssetDrawerProps) {
  const { t, language } = useLanguage();
  const tp = t.pages.portfolio;
  const createMutation = useCreatePortfolioItem();
  const updateMutation = useUpdatePortfolioItem();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;

  const [type, setType] = useState<PortfolioAssetType>(item?.type ?? initialType ?? "gold");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form contents whenever the drawer opens (create or edit).
  useEffect(() => {
    if (!open) return;
    const initialIdentifier = item?.karat?.toString() ?? item?.purity?.toString() ?? item?.currency_code ?? item?.coin_id ?? "";
    setType(item?.type ?? initialType ?? "gold");
    setName(item?.name ?? "");
    setAmount(item ? String(item.amount) : "");
    setIdentifier(initialIdentifier);
    setBuyPrice(item?.buy_price === null || item?.buy_price === undefined ? "" : String(item.buy_price));
    setPurchaseDate(item?.purchase_date?.slice(0, 10) ?? "");
    setNotes(item?.notes ?? "");
    setErrors({});
    createMutation.reset();
    updateMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  // Pick a sensible default identifier once options load for a fresh (no-identifier) form.
  useEffect(() => {
    if (!options || identifier) return;
    const first = firstIdentifier(type, options, language);
    if (first) setIdentifier(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, type]);

  const selectType = (next: PortfolioAssetType) => {
    setType(next);
    setIdentifier(firstIdentifier(next, options, language) ?? "");
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    const today = new Date().toISOString().slice(0, 10);

    if (!name.trim()) nextErrors.name = tp.assetNameLabel;
    if (!DECIMAL_PATTERN.test(amount) || Number(amount) <= 0) nextErrors.amount = tp.amountLabelWeight;
    if (buyPrice && (!DECIMAL_PATTERN.test(buyPrice) || Number(buyPrice) <= 0)) nextErrors.buyPrice = tp.buyPriceOptionalLabel;
    if (purchaseDate && purchaseDate > today) nextErrors.purchaseDate = tp.purchaseDateLabel;
    if (!identifier) nextErrors.identifier = identifierLabel(type, language);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const data: CreatePortfolioItemRequest = {
      type,
      name: name.trim(),
      amount,
      buy_price: buyPrice || null,
      purchase_date: purchaseDate || null,
      notes: notes.trim() || null,
    };
    if (type === "gold") data.karat = Number(identifier);
    if (type === "silver") data.purity = Number(identifier);
    if (type === "currency") data.currency_code = identifier;
    if (type === "crypto") data.coin_id = identifier;

    const onSuccess = () => onOpenChange(false);
    if (item) updateMutation.mutate({ id: item.id, data }, { onSuccess });
    else createMutation.mutate(data, { onSuccess });
  };

  const amountLabel =
    type === "gold" || type === "silver" ? tp.amountLabelWeight : type === "currency" ? tp.amountLabelCurrency : tp.amountLabelCrypto;
  const namePlaceholder = type === "gold" ? tp.assetNamePlaceholderGold : type === "crypto" ? tp.assetNamePlaceholderCrypto : tp.assetNamePlaceholderGeneric;

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 start-0 z-50 flex w-full max-w-[540px] flex-col bg-panel shadow-card outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left rtl:data-[state=open]:slide-in-from-right rtl:data-[state=closed]:slide-out-to-right",
            "max-md:inset-x-0 max-md:top-auto max-md:max-h-[92vh] max-md:rounded-t-[20px] max-md:data-[state=open]:slide-in-from-bottom max-md:data-[state=closed]:slide-out-to-bottom"
          )}
        >
          <div className="flex items-center gap-3 border-b border-line-2 px-6 py-5 shrink-0">
            <div>
              <DialogPrimitive.Title className="font-heading text-[18px] font-bold text-text">
                {item ? tp.edit : tp.addAssetTitle}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-[12.5px] text-muted mt-0.5">{tp.addAssetSubtitle}</DialogPrimitive.Description>
            </div>
            <div className="flex-1" />
            <DialogClose className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-line text-muted hover:bg-hover">
              <span className="text-base leading-none">×</span>
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {mutationError && <InlineAlert variant="error">{mutationError.message}</InlineAlert>}

            <div>
              <div className="text-[12.5px] text-muted mb-2">{tp.type}</div>
              <div className="grid grid-cols-4 gap-2">
                {TYPES.map((value) => {
                  const meta = CATEGORY_META[value];
                  const Icon = meta.icon;
                  const active = type === value;
                  return (
                    <button
                      type="button"
                      key={value}
                      onClick={() => selectType(value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-[12px] border-[1.5px] px-2 py-3 text-[12.5px] font-semibold transition-colors",
                        active ? cn(meta.soft, meta.line, meta.text) : "border-line text-muted hover:bg-hover"
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      {tp[value === "currency" ? "currencies" : value]}
                    </button>
                  );
                })}
              </div>
            </div>

            {optionsLoading ? (
              <div className="flex items-center gap-2 rounded-[11px] bg-panel-2 p-3 text-[13px] text-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.common.loading}
              </div>
            ) : optionsError ? (
              <InlineAlert variant="error">{optionsError.message}</InlineAlert>
            ) : (
              <>
                <FormField label={tp.assetNameLabel} error={errors.name}>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={namePlaceholder} maxLength={255} />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label={identifierLabel(type, language)} error={errors.identifier}>
                    <Select value={identifier} onValueChange={setIdentifier}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {identifierOptions(type, options, language).map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label={`${amountLabel}${amountUnit(type, language) ? ` (${amountUnit(type, language)})` : ""}`} error={errors.amount}>
                    <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00000000" className="num" />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label={tp.buyPriceOptionalLabel} error={errors.buyPrice} hint={tp.buyPriceHint}>
                    <Input inputMode="decimal" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} placeholder={tp.buyPriceHint} className="num" />
                  </FormField>
                  <FormField label={tp.purchaseDateLabel} error={errors.purchaseDate}>
                    <Input type="date" value={purchaseDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setPurchaseDate(e.target.value)} />
                  </FormField>
                </div>

                <FormField label={tp.notesLabel}>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={1000}
                    rows={2}
                    placeholder={tp.notesPlaceholder}
                    className="w-full rounded-[11px] border border-line bg-bg px-3.5 py-2.5 text-[14px] placeholder:text-dim focus-visible:outline-none focus-visible:border-gold resize-y"
                  />
                </FormField>
              </>
            )}

            <div className="flex gap-2.5 border-t border-line-2 pt-4">
              <Button type="submit" className="flex-1" disabled={isPending || optionsLoading || !!optionsError}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {tp.saveAsset}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  {tp.cancel}
                </Button>
              </DialogClose>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function FormField({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[13px] font-medium text-text">{label}</span>
      {children}
      {error ? (
        <span className="block text-[12px] text-down">{error}</span>
      ) : hint ? (
        <span className="block text-[12px] text-dim">{hint}</span>
      ) : null}
    </label>
  );
}
