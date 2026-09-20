"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Circle, Loader2, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/ui/section-card";
import { InlineAlert } from "@/components/ui/inline-alert";
import { PasswordStrength } from "@/components/ui/password-strength";
import { SessionsSection } from "@/components/settings/sessions-section";
import { changePassword as changePasswordApi } from "@/lib/api-auth";

export function SecuritySection() {
  const { t } = useLanguage();
  const tt = t.pages.settings;

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const resetForm = () => {
    setShowChangePassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
  };

  const rules = [
    { ok: newPassword.length >= 6, label: tt.passwordRuleLength },
    { ok: /\d/.test(newPassword), label: tt.passwordRuleNumber },
    { ok: newPassword.length > 0 && newPassword === confirmPassword, label: tt.passwordRuleMatch },
  ];
  const canSubmit = rules.every((r) => r.ok) && currentPassword.length > 0;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError(t.common.errorPasswordMismatch);
      return;
    }
    if (newPassword.length < 6) {
      setError(t.common.errorPasswordLength);
      return;
    }

    setLoading(true);
    try {
      await changePasswordApi({
        old_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      closeTimer.current = setTimeout(() => {
        setShowChangePassword(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : t.common.error;
      setError(message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <SectionCard title={tt.changePasswordSection}>
        <div className="p-4 md:p-5">
          {!showChangePassword ? (
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel-2">
                  <Lock className="h-4 w-4 text-dim" />
                </span>
                <p className="text-[13px] text-muted">{tt.changePasswordDescription}</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowChangePassword(true)} className="shrink-0">
                {tt.changePasswordButton}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-[460px]">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">{tt.currentPassword}</Label>
                <Input
                  id="currentPassword"
                  type={showPasswords ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">{tt.newPassword}</Label>
                <Input
                  id="newPassword"
                  type={showPasswords ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">{tt.confirmPasswordLabel}</Label>
                <Input
                  id="confirmPassword"
                  type={showPasswords ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswords((v) => !v)}
                  className="shrink-0 rounded-[9px] border border-line px-3 py-1.5 text-[12.5px] font-medium text-muted hover:bg-hover"
                >
                  {showPasswords ? tt.hidePasswords : tt.showPasswords}
                </button>
                {newPassword && (
                  <PasswordStrength
                    password={newPassword}
                    labels={[
                      t.pages.passwordStrength.empty,
                      t.pages.passwordStrength.weak,
                      t.pages.passwordStrength.fair,
                      t.pages.passwordStrength.strong,
                    ]}
                    className="flex-1"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                {rules.map((rule) => (
                  <div key={rule.label} className={cn("flex items-center gap-2 text-[12.5px]", rule.ok ? "text-up" : "text-dim")}>
                    {rule.ok ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <Circle className="h-3.5 w-3.5 shrink-0" />}
                    {rule.label}
                  </div>
                ))}
              </div>

              {error && <InlineAlert variant="error">{error}</InlineAlert>}
              {success && <InlineAlert variant="success">{tt.passwordChanged}</InlineAlert>}

              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={loading || !canSubmit}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? tt.changingPassword : tt.changePasswordButton}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={resetForm} disabled={loading}>
                  {tt.cancel}
                </Button>
              </div>
            </form>
          )}
        </div>
      </SectionCard>

      <SessionsSection />
    </div>
  );
}
