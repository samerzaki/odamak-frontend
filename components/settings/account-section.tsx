"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Mail, Pencil, ShieldAlert, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/ui/section-card";
import { InlineAlert } from "@/components/ui/inline-alert";
import { OtpDialog } from "@/components/settings/otp-dialog";
import { ConnectedAccountsSection } from "@/components/settings/connected-accounts-section";
import { updateProfile, checkEmailExists, sendOtp, changeEmail } from "@/lib/api-auth";

export function AccountSection() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const tt = t.pages.settings;

  // ---- Name edit ----
  const [editingName, setEditingName] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState(false);

  // ---- Email change ----
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [showEmailOtp, setShowEmailOtp] = useState(false);

  if (!user) return null;

  const startEditName = () => {
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setNameError("");
    setNameSuccess(false);
    setEditingName(true);
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");

    if (!firstName.trim() || !lastName.trim()) {
      setNameError(tt.errorUpdateProfile);
      return;
    }

    setNameLoading(true);
    try {
      await updateProfile({ first_name: firstName.trim(), last_name: lastName.trim() });
      await refreshUser();
      setEditingName(false);
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : tt.errorUpdateProfile;
      setNameError(message);
    }
    setNameLoading(false);
  };

  const handleStartChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    const trimmed = newEmail.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() === user.email.toLowerCase()) {
      setEmailError(tt.newEmailSameAsCurrent);
      return;
    }

    setEmailLoading(true);
    try {
      const availability = await checkEmailExists(trimmed);
      if (availability.data && availability.data.available === false) {
        setEmailError(tt.newEmailTaken);
        setEmailLoading(false);
        return;
      }
      await sendOtp(trimmed);
      setShowEmailOtp(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t.common.error;
      setEmailError(message);
    }
    setEmailLoading(false);
  };

  const handleVerifyEmailOtp = async (code: string) => {
    await changeEmail({ email: newEmail.trim(), verification_code: code });
  };

  const handleResendEmailOtp = async () => {
    await sendOtp(newEmail.trim());
  };

  const handleEmailChangeSuccess = async () => {
    await refreshUser();
    setShowChangeEmail(false);
    setNewEmail("");
    setEmailSuccess(true);
    setTimeout(() => setEmailSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      <SectionCard title={tt.profileSection}>
        <div className="divide-y divide-line-2">
          {/* Name row */}
          <div className="p-4 md:p-5">
            {!editingName ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel-2">
                    <User className="h-4 w-4 text-dim" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] text-muted">{tt.nameLabel}</p>
                    <p className="truncate text-[15px] font-medium text-text">{user.name}</p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={startEditName} className="shrink-0 gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  {tt.editProfileButton}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSaveName} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">{tt.firstNameLabel}</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={nameLoading}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">{tt.lastNameLabel}</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={nameLoading}
                      required
                    />
                  </div>
                </div>

                {nameError && <InlineAlert variant="error">{nameError}</InlineAlert>}

                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={nameLoading}>
                    {nameLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {nameLoading ? tt.savingButton : tt.saveButton}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingName(false)}
                    disabled={nameLoading}
                  >
                    {tt.cancel}
                  </Button>
                </div>
              </form>
            )}
            {nameSuccess && <InlineAlert variant="success" className="mt-3">{tt.profileUpdated}</InlineAlert>}
          </div>

          {/* Email row */}
          <div className="p-4 md:p-5">
            {!showChangeEmail ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel-2">
                    <Mail className="h-4 w-4 text-dim" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] text-muted">{tt.emailLabel}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="num truncate text-[15px] font-medium text-text" dir="ltr">{user.email}</p>
                      {user.emailVerified ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-up" />
                      ) : (
                        <ShieldAlert className="h-4 w-4 shrink-0 text-dim" />
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setShowChangeEmail(true); setNewEmail(""); setEmailError(""); }}
                  className="shrink-0 gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {tt.changeEmailButton}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleStartChangeEmail} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newEmail">{tt.newEmailLabel}</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    dir="ltr"
                    placeholder="example@email.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    disabled={emailLoading}
                  />
                  <p className="text-[12px] text-dim">{tt.changeEmailDescription}</p>
                </div>

                {emailError && <InlineAlert variant="error">{emailError}</InlineAlert>}

                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={emailLoading}>
                    {emailLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {emailLoading ? tt.changingEmail : tt.changeEmailButton}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { setShowChangeEmail(false); setEmailError(""); }}
                    disabled={emailLoading}
                  >
                    {tt.cancel}
                  </Button>
                </div>
              </form>
            )}
            {emailSuccess && <InlineAlert variant="success" className="mt-3">{tt.emailChangeSuccess}</InlineAlert>}
          </div>
        </div>
      </SectionCard>

      <ConnectedAccountsSection />

      <OtpDialog
        open={showEmailOtp}
        onOpenChange={setShowEmailOtp}
        title={tt.emailOtpTitle}
        subtitle={tt.emailOtpSubtitle}
        target={newEmail.trim()}
        onVerify={handleVerifyEmailOtp}
        onResend={handleResendEmailOtp}
        onSuccess={handleEmailChangeSuccess}
        texts={{
          noCode: tt.phone.otpNoCode,
          resend: tt.phone.otpResend,
          resendIn: tt.phone.otpResendIn,
          seconds: tt.phone.otpSeconds,
          successTitle: tt.emailChangeSuccess,
          successDescription: tt.emailOtpSubtitle,
          genericError: tt.phone.otpError,
        }}
      />
    </div>
  );
}
