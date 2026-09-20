import { Bitcoin, Coins, Gem, Landmark, type LucideIcon } from "lucide-react";
import type { Language } from "@/lib/translations";
import type { PortfolioAssetType, PortfolioItem, PortfolioNumber, PortfolioOptions } from "@/types/portfolio";

/** Category → design tokens. Kept in one place so the hero, donut, cards and table agree. */
export interface CategoryMeta {
  icon: LucideIcon;
  text: string;
  soft: string;
  line: string;
  /** CSS var reference for inline SVG strokes (the donut can't use Tailwind classes). */
  cssVar: string;
}

export const CATEGORY_META: Record<PortfolioAssetType, CategoryMeta> = {
  gold: { icon: Coins, text: "text-warn", soft: "bg-warn-soft", line: "border-warn-line", cssVar: "var(--warn)" },
  silver: { icon: Gem, text: "text-dim", soft: "bg-panel-2", line: "border-line", cssVar: "var(--dim)" },
  currency: { icon: Landmark, text: "text-gold", soft: "bg-gold-soft", line: "border-gold-line", cssVar: "var(--gold)" },
  crypto: { icon: Bitcoin, text: "text-rust", soft: "bg-rust-soft", line: "border-rust-line", cssVar: "var(--rust)" },
};

/** Maps the asset type to the summary's breakdown/allocation key (API pluralizes "currency" → "currencies"). */
export function breakdownKey(type: PortfolioAssetType): "gold" | "silver" | "currencies" | "crypto" {
  return type === "currency" ? "currencies" : type;
}

export function numberValue(value?: PortfolioNumber): number | null {
  if (value === null || value === "" || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatEgp(value: PortfolioNumber | undefined, fallback: string, locale: string): string {
  const numeric = numberValue(value);
  if (numeric === null) return fallback;
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
    numberingSystem: "latn",
  }).format(numeric);
}

/** Bare number (no currency symbol) for large hero figures shown beside a unit label. */
export function formatEgpNumber(value: PortfolioNumber | undefined, fallback: string): string {
  const numeric = numberValue(value);
  if (numeric === null) return fallback;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, numberingSystem: "latn" }).format(numeric);
}

export function formatAmount(value: number | string, digits = 8): string {
  const numeric = Number(value);
  return Number.isFinite(numeric)
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: digits, numberingSystem: "latn" }).format(numeric)
    : String(value);
}

export function formatPercent(value: number | null, digits = 2): string {
  if (value === null) return "—";
  const sign = value >= 0 ? "+" : "−";
  return `${sign}${Math.abs(value).toFixed(digits)}%`;
}

export function identifierLabel(type: PortfolioAssetType, lang: Language): string {
  const ar = { gold: "العيار", silver: "النقاء", currency: "العملة", crypto: "العملة الرقمية" };
  const en = { gold: "Karat", silver: "Purity", currency: "Currency", crypto: "Coin" };
  return (lang === "en" ? en : ar)[type];
}

export function identifierOptions(
  type: PortfolioAssetType,
  options: PortfolioOptions | undefined,
  lang: Language
): { value: string; label: string }[] {
  if (!options) return [];
  if (type === "gold") return options.gold_karats.map((v) => ({ value: String(v), label: lang === "en" ? `${v}k` : `عيار ${v}` }));
  if (type === "silver") return options.silver_purities.map((v) => ({ value: String(v), label: String(v) }));
  if (type === "crypto") return options.crypto.map((c) => ({ value: c.coin_id, label: `${c.symbol} — ${c.name}` }));
  return options.currencies.flatMap((c) => {
    const value = typeof c === "string" ? c : c.currency_code ?? c.code;
    if (!value) return [];
    const name = typeof c === "string" ? "" : (lang === "en" ? c.name_en ?? c.name : c.name_ar ?? c.name);
    return [{ value, label: name ? `${value} — ${name}` : value }];
  });
}

export function firstIdentifier(type: PortfolioAssetType, options: PortfolioOptions | undefined, lang: Language): string | undefined {
  return identifierOptions(type, options, lang).at(0)?.value;
}

/** Amount-field unit for a given asset type (grams for metals, currency/coin units otherwise). */
export function amountUnit(type: PortfolioAssetType, lang: Language): string {
  if (type === "gold" || type === "silver") return lang === "en" ? "g" : "جم";
  return "";
}

/** "Karat 21" / "Purity 999" / currency code / coin id — with a "not recorded" fallback. */
export function assetSubLabel(item: PortfolioItem, lang: Language, notRecorded: string): string {
  if (item.type === "gold") return item.karat ? (lang === "en" ? `${item.karat}k` : `عيار ${item.karat}`) : notRecorded;
  if (item.type === "silver") return item.purity ? (lang === "en" ? `${item.purity}` : `نقاء ${item.purity}`) : notRecorded;
  if (item.type === "currency") return item.currency_code ?? notRecorded;
  return item.coin_id ?? notRecorded;
}

/** Trailing unit shown next to amount/price figures (grams, currency code, or coin ticker). */
export function assetDisplayUnit(item: PortfolioItem, lang: Language): string {
  if (item.type === "gold" || item.type === "silver") return amountUnit(item.type, lang);
  if (item.type === "currency") return item.currency_code ?? "";
  return (item.coin_id ?? "").slice(0, 5).toUpperCase();
}
