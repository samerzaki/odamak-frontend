"use client";

import { useState } from "react";
import { Bell, Mail, MessageSquare, Phone, Send } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { SectionCard } from "@/components/ui/section-card";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Switch } from "@/components/ui/switch";

type ChannelKey = "email" | "sms" | "whatsapp" | "telegram";
type TopicKey = "alerts" | "daily" | "news" | "portfolio";

/**
 * Channels and topics are not backed by an API yet — toggles flip local
 * state only, so people can pre-select what they want ahead of launch
 * (confirmed with product: ship the UI, no persistence for now).
 */
export function NotificationsSection() {
  const { t } = useLanguage();
  const tt = t.pages.settings;
  const [channels, setChannels] = useState<Record<ChannelKey, boolean>>({
    email: true,
    sms: false,
    whatsapp: false,
    telegram: false,
  });
  const [topics, setTopics] = useState<Record<TopicKey, boolean>>({
    alerts: true,
    daily: true,
    news: false,
    portfolio: true,
  });

  const CHANNELS: { key: ChannelKey; icon: typeof Mail; label: string; desc: string }[] = [
    { key: "email", icon: Mail, label: tt.emailNotifications, desc: tt.emailNotificationsDesc },
    { key: "sms", icon: Phone, label: tt.smsNotifications, desc: tt.smsNotificationsDesc },
    { key: "whatsapp", icon: MessageSquare, label: tt.whatsappNotifications, desc: tt.whatsappNotificationsDesc },
    { key: "telegram", icon: Send, label: tt.telegramNotifications, desc: tt.telegramNotificationsDesc },
  ];

  const TOPICS: { key: TopicKey; label: string; desc: string }[] = [
    { key: "alerts", label: tt.topics.priceAlerts, desc: tt.topics.priceAlertsDesc },
    { key: "daily", label: tt.topics.dailySummary, desc: tt.topics.dailySummaryDesc },
    { key: "news", label: tt.topics.marketNews, desc: tt.topics.marketNewsDesc },
    { key: "portfolio", label: tt.topics.portfolioChanges, desc: tt.topics.portfolioChangesDesc },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title={tt.notificationsSection}>
        <div className="space-y-3 p-4 md:p-5">
          <InlineAlert variant="info">
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4 shrink-0" />
              {tt.comingSoonNotice}
            </span>
          </InlineAlert>

          <div className="space-y-2.5">
            {CHANNELS.map(({ key, icon: Icon, label, desc }) => {
              const enabled = channels[key];
              return (
                <div
                  key={key}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-[14px] border p-3.5 transition-colors",
                    enabled ? "bg-gold-soft border-gold-line" : "bg-panel border-line"
                  )}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-panel-2">
                      <Icon className="h-[18px] w-[18px] text-muted" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[14.5px] font-semibold text-text">{label}</p>
                        <span className="chip">{tt.comingSoonBadge}</span>
                      </div>
                      <p className="text-[12.5px] text-muted mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(v) => setChannels((prev) => ({ ...prev, [key]: v }))}
                    aria-label={label}
                    className="shrink-0"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>

      <SectionCard title={tt.topics.title}>
        <div className="p-4 md:p-5">
          <p className="text-[12.5px] text-muted mb-3">{tt.topics.subtitle}</p>
          <div className="divide-y divide-line-2">
            {TOPICS.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-text">{label}</div>
                  <div className="text-[12.5px] text-muted mt-0.5">{desc}</div>
                </div>
                <Switch
                  checked={topics[key]}
                  onCheckedChange={(v) => setTopics((prev) => ({ ...prev, [key]: v }))}
                  aria-label={label}
                  className="shrink-0"
                />
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
