"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Phone,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { InlineAlert, InlineAlertBlock } from "@/components/ui/inline-alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PhoneInputField, type PhoneInputValue } from "@/components/ui/phone-input";
import { OtpDialog } from "@/components/settings/otp-dialog";
import {
  addMobilePhone,
  deleteMobilePhone,
  listMobilePhones,
  resendMobilePhoneOtp,
  sendMobileOtp,
  setDefaultMobilePhone,
  verifyMobilePhone,
  verifyTempMobileNumber,
} from "@/lib/api-auth";
import type { MobilePhone } from "@/types/auth";

const EMPTY_PHONE_VALUE: PhoneInputValue = { phone: "", isValid: false, country: null, inputValue: "" };

interface OtpTarget {
  phoneId?: number;
  displayNumber: string;
  rawNumber: string;
  initialSeconds: number;
}

interface PhoneSectionProps {
  /** Reported whenever the phone list has at least one unverified number — drives the settings tab badge. */
  onUnverifiedChange?: (hasUnverified: boolean) => void;
}

export function PhoneSection({ onUnverifiedChange }: PhoneSectionProps) {
  const { refreshUser } = useAuth();
  const { t } = useLanguage();
  const tp = t.pages.settings.phone;
  const tt = t.pages.settings;

  const [phones, setPhones] = useState<MobilePhone[]>([]);
  const [phonesLoading, setPhonesLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [showAddPhone, setShowAddPhone] = useState(false);
  const [newPhoneData, setNewPhoneData] = useState<PhoneInputValue>(EMPTY_PHONE_VALUE);
  const [addPhoneLoading, setAddPhoneLoading] = useState(false);
  const [addPhoneError, setAddPhoneError] = useState("");

  const [rowActionId, setRowActionId] = useState<number | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<MobilePhone | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [otpTarget, setOtpTarget] = useState<OtpTarget | null>(null);
  const [showOtp, setShowOtp] = useState(false);

  // Plain (non-memoized) function: recreated every render with fresh `tp`,
  // but the mount effect below only ever calls the very first instance so a
  // language switch never triggers a refetch/loading-spinner flash.
  const fetchPhones = async () => {
    setPhonesLoading(true);
    setListError("");
    try {
      const response = await listMobilePhones();
      const list = response.data || [];
      setPhones(list);
      onUnverifiedChange?.(list.some((p) => !p.verified_at));
    } catch (err) {
      const message = err instanceof Error ? err.message : tp.errorLoad;
      setListError(message);
    }
    setPhonesLoading(false);
  };

  useEffect(() => {
    fetchPhones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setRowError = (id: number, message: string) => {
    setRowErrors((prev) => ({ ...prev, [id]: message }));
  };
  const clearRowError = (id: number) => {
    setRowErrors((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // ---- Add phone ----
  const handleAddPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddPhoneError("");

    if (!newPhoneData.isValid) {
      setAddPhoneError(tp.phoneIncomplete);
      return;
    }

    setAddPhoneLoading(true);
    try {
      const response = await addMobilePhone(newPhoneData.phone);
      setOtpTarget({
        phoneId: response.data?.id,
        displayNumber: newPhoneData.phone,
        rawNumber: newPhoneData.phone,
        initialSeconds: response.seconds_to_next_msg ?? 120,
      });
      setShowOtp(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : tp.errorAdd;
      setAddPhoneError(message);
    }
    setAddPhoneLoading(false);
  };

  // ---- Verify an existing unverified phone ----
  const handleVerifyExistingPhone = async (phone: MobilePhone) => {
    clearRowError(phone.id);
    setRowActionId(phone.id);
    try {
      await resendMobilePhoneOtp(phone.id);
      setOtpTarget({
        phoneId: phone.id,
        displayNumber: `${phone.country_code} ${phone.mobile_number}`,
        rawNumber: `${phone.country_code}${phone.mobile_number}`,
        initialSeconds: 120,
      });
      setShowOtp(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : tp.errorVerify;
      setRowError(phone.id, message);
    }
    setRowActionId(null);
  };

  // ---- OTP dialog callbacks (shared by add + verify-existing) ----
  const handleVerifyOtp = async (code: string) => {
    if (!otpTarget) return;
    if (otpTarget.phoneId) {
      await verifyMobilePhone(otpTarget.phoneId, code);
    } else {
      await verifyTempMobileNumber(otpTarget.rawNumber, code);
    }
  };

  const handleResendOtp = async () => {
    if (!otpTarget) return;
    if (otpTarget.phoneId) {
      await resendMobilePhoneOtp(otpTarget.phoneId);
    } else {
      await sendMobileOtp(otpTarget.rawNumber);
    }
  };

  const handleOtpVerified = async () => {
    await fetchPhones();
    await refreshUser();
    setShowAddPhone(false);
    setNewPhoneData(EMPTY_PHONE_VALUE);
  };

  // ---- Set default ----
  const handleSetDefaultPhone = async (phoneId: number) => {
    clearRowError(phoneId);
    setRowActionId(phoneId);
    try {
      await setDefaultMobilePhone(phoneId);
      await fetchPhones();
      await refreshUser();
    } catch (err) {
      const message = err instanceof Error ? err.message : tp.errorSetDefault;
      setRowError(phoneId, message);
    }
    setRowActionId(null);
  };

  // ---- Delete ----
  const confirmDeletePhone = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteMobilePhone(deleteTarget.id);
      await fetchPhones();
      await refreshUser();
      setDeleteTarget(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : tp.errorDelete;
      setRowError(deleteTarget.id, message);
      setDeleteTarget(null);
    }
    setDeleteLoading(false);
  };

  return (
    <div className="space-y-4">
      <SectionCard
        title={tp.title}
        action={
          <Button
            size="sm"
            onClick={() => {
              setShowAddPhone(true);
              setAddPhoneError("");
              setNewPhoneData(EMPTY_PHONE_VALUE);
            }}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {tp.addButton}
          </Button>
        }
      >
        <div className="space-y-3 p-4 md:p-5">
          <p className="text-[13px] text-muted">{tp.description}</p>

          {phonesLoading && (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-[11px]" />
              <Skeleton className="h-16 w-full rounded-[11px]" />
            </div>
          )}

          {!phonesLoading && listError && (
            <InlineAlertBlock
              variant="error"
              title={listError}
              description={tp.errorLoadDescription}
              onRetry={fetchPhones}
              retryLabel={tp.retry}
            />
          )}

          {!phonesLoading && !listError && phones.length === 0 && (
            <div className="space-y-2 py-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-panel-2">
                <Phone className="h-7 w-7 text-dim" />
              </div>
              <div>
                <p className="font-medium text-text">{tp.noPhones}</p>
                <p className="text-[13px] text-muted">{tp.noPhonesDescription}</p>
              </div>
            </div>
          )}

          {!phonesLoading && phones.map((phone) => (
            <div key={phone.id} className="space-y-2">
              <div
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 rounded-[11px] border p-3.5",
                  phone.default ? "bg-gold-soft border-gold-line" : "bg-panel-2 border-line"
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      phone.verified_at ? "bg-up-soft" : "bg-warn-soft"
                    )}
                  >
                    {phone.verified_at
                      ? <ShieldCheck className="h-4 w-4 text-up" />
                      : <ShieldAlert className="h-4 w-4 text-warn" />
                    }
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="num text-[14px] font-medium text-text" dir="ltr">
                        {phone.country_code} {phone.mobile_number}
                      </p>
                      {phone.default && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[11px] font-medium text-on-gold">
                          <Star className="h-3 w-3" />
                          {tp.defaultBadge}
                        </span>
                      )}
                    </div>
                    <p className={cn("mt-0.5 text-[12px]", phone.verified_at ? "text-up" : "text-warn")}>
                      {phone.verified_at ? tp.verified : tp.notVerified}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {!phone.verified_at && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerifyExistingPhone(phone)}
                      disabled={rowActionId === phone.id}
                      className="gap-1 border-warn-line text-warn text-[13px] hover:bg-warn-soft hover:text-warn"
                    >
                      {rowActionId === phone.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <ShieldCheck className="h-3.5 w-3.5" />
                      }
                      {tp.verify}
                    </Button>
                  )}

                  {phone.verified_at && !phone.default && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetDefaultPhone(phone.id)}
                      disabled={rowActionId === phone.id}
                      className="gap-1 text-[13px]"
                    >
                      {rowActionId === phone.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Star className="h-3.5 w-3.5" />
                      }
                      {tp.setDefault}
                    </Button>
                  )}

                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={tt.deleteButton}
                    onClick={() => setDeleteTarget(phone)}
                    disabled={rowActionId === phone.id}
                    className="text-down hover:bg-down-soft hover:text-down"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {rowErrors[phone.id] && (
                <InlineAlert variant="error">{rowErrors[phone.id]}</InlineAlert>
              )}
            </div>
          ))}

          {/* Add phone form */}
          {showAddPhone && (
            <div className="rounded-[11px] border border-dashed border-line bg-bg p-4">
              <form onSubmit={handleAddPhone} className="space-y-4">
                <div className="space-y-2">
                  <Label>{tp.newPhoneLabel}</Label>
                  <PhoneInputField
                    value={newPhoneData.phone}
                    onChange={setNewPhoneData}
                    defaultCountry="eg"
                    disabled={addPhoneLoading}
                    autoFocus
                    placeholder={tp.phonePlaceholder}
                    error={!!addPhoneError}
                  />
                  {newPhoneData.phone && !newPhoneData.isValid && (
                    <p className="text-[12px] text-gold">{tp.phoneIncomplete}</p>
                  )}
                  {newPhoneData.isValid && (
                    <p className="flex items-center gap-1 text-[12px] text-up">
                      <CheckCircle2 className="h-3 w-3" />
                      {tp.phoneValid}
                    </p>
                  )}
                </div>

                {addPhoneError && <InlineAlert variant="error">{addPhoneError}</InlineAlert>}

                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={addPhoneLoading || !newPhoneData.isValid}>
                    {addPhoneLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {addPhoneLoading ? tp.sending : tp.addAndVerify}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddPhone(false);
                      setNewPhoneData(EMPTY_PHONE_VALUE);
                      setAddPhoneError("");
                    }}
                    disabled={addPhoneLoading}
                  >
                    {tt.cancel}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </SectionCard>

      {otpTarget && (
        <OtpDialog
          open={showOtp}
          onOpenChange={setShowOtp}
          title={tp.otpTitle}
          subtitle={tp.otpSubtitle}
          target={otpTarget.displayNumber}
          initialSeconds={otpTarget.initialSeconds}
          onVerify={handleVerifyOtp}
          onResend={handleResendOtp}
          onSuccess={handleOtpVerified}
          texts={{
            noCode: tp.otpNoCode,
            resend: tp.otpResend,
            resendIn: tp.otpResendIn,
            seconds: tp.otpSeconds,
            successTitle: tp.otpSuccess,
            successDescription: tp.otpSuccessDesc,
            genericError: tp.otpError,
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={tp.deleteConfirm}
        confirmLabel={tt.deleteButton}
        cancelLabel={tt.cancel}
        onConfirm={confirmDeletePhone}
        loading={deleteLoading}
      />
    </div>
  );
}
