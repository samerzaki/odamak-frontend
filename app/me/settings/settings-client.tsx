"use client";

import { useEffect, useState } from "react";
import { Bell, Lock, LogOut, Smartphone, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSection } from "@/components/settings/account-section";
import { PhoneSection } from "@/components/settings/phone-section";
import { SecuritySection } from "@/components/settings/security-section";
import { NotificationsSection } from "@/components/settings/notifications-section";

/** Tracks whether the viewport is at/above the `md` breakpoint, for the tabs' aria-orientation. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const isDesktop = useIsDesktop();
  const [hasUnverifiedPhone, setHasUnverifiedPhone] = useState(false);

  // AuthGuard in layout handles redirect — this is a safety fallback
  if (!user) return null;

  const TABS = [
    { value: "account", label: t.pages.settings.tabs.account, icon: User, badge: false },
    { value: "phone", label: t.pages.settings.tabs.phone, icon: Smartphone, badge: hasUnverifiedPhone },
    { value: "security", label: t.pages.settings.tabs.security, icon: Lock, badge: false },
    { value: "notifications", label: t.pages.settings.tabs.notifications, icon: Bell, badge: false },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6">
      <PageHeader
        title={t.pages.settings.title}
        lead={t.pages.settings.subtitle}
        actions={
          <div className="flex items-center gap-3 rounded-[14px] border border-line bg-panel px-4 py-2.5">
            <Avatar src={user.avatar} alt={user.name} fallback={user.name?.charAt(0).toUpperCase() || "U"} />
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-text truncate">{user.name}</div>
              <div className="num text-[12px] text-muted truncate" dir="ltr">{user.email}</div>
            </div>
            {user.emailVerified && (
              <span className="chip bg-up-soft text-up shrink-0">{t.pages.settings.phone.verified}</span>
            )}
          </div>
        }
      />

      <Tabs defaultValue="account" orientation={isDesktop ? "vertical" : "horizontal"} className="w-full md:flex md:items-start md:gap-6">
        <div className="max-md:rounded-xl max-md:border max-md:border-line max-md:bg-panel-2 max-md:p-1.5 md:card-surface md:w-[250px] md:shrink-0 md:p-2.5 md:sticky md:top-6">
          <TabsList className="grid h-auto w-full grid-cols-4 gap-1 border-0 bg-transparent p-0 md:flex md:flex-col md:items-stretch">
            {TABS.map(({ value, label, icon: Icon, badge }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="relative flex h-auto flex-col gap-1 rounded-lg py-2.5 text-[11px] data-[state=active]:shadow-none md:w-full md:flex-row md:justify-start md:gap-2.5 md:rounded-[11px] md:px-3 md:py-3 md:text-[14px] md:data-[state=active]:bg-gold-soft md:data-[state=active]:text-gold md:data-[state=active]:shadow-none"
              >
                <Icon className="h-4 w-4" />
                <span className="md:flex-1 md:text-start">{label}</span>
                {badge && (
                  <span className="chip bg-warn-soft text-warn md:static max-md:absolute max-md:-top-1 max-md:-end-1">
                    {t.pages.settings.phone.verify}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-2 border-t border-line-2 pt-2 max-md:hidden">
            <button
              type="button"
              onClick={() => logout()}
              className="flex w-full items-center gap-2.5 rounded-[11px] px-3 py-3 text-[14px] font-medium text-down transition-colors hover:bg-down-soft"
            >
              <LogOut className="h-4 w-4" />
              {t.pages.settings.signOut}
            </button>
          </div>
        </div>

        <div className="mt-4 md:mt-0 md:min-w-0 md:flex-1">
          <TabsContent value="account" className="mt-0">
            <AccountSection />
          </TabsContent>
          <TabsContent value="phone" className="mt-0">
            <PhoneSection onUnverifiedChange={setHasUnverifiedPhone} />
          </TabsContent>
          <TabsContent value="security" className="mt-0">
            <SecuritySection />
          </TabsContent>
          <TabsContent value="notifications" className="mt-0">
            <NotificationsSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
