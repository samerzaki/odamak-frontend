"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { OTPInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EMPTY_OTP = ["", "", "", "", "", ""];

export interface OtpDialogTexts {
  noCode: string;
  resend: string;
  resendIn: string;
  seconds: string;
  successTitle: string;
  successDescription: string;
  genericError: string;
}

interface OtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle: string;
  /** Phone number or masked email — rendered with dir="ltr" + .num */
  target: string;
  initialSeconds?: number;
  /** Reject with an Error(message) on failure. */
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  /** Called once verification succeeds, before the dialog auto-closes. */
  onSuccess?: () => void;
  texts: OtpDialogTexts;
}

/**
 * Reusable OTP verification dialog (phone add/verify, email change).
 * Guards against the OTPInput "duplicate submit" bug: a stable onComplete
 * callback plus an in-flight ref so a stray re-render can't re-fire verify.
 */
export function OtpDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  target,
  initialSeconds = 120,
  onVerify,
  onResend,
  onSuccess,
  texts,
}: OtpDialogProps) {
  const [otp, setOtp] = useState<string[]>(EMPTY_OTP);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(initialSeconds);
  const [canResend, setCanResend] = useState(false);
  const submittingRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  // Reset state whenever the dialog opens for a new target.
  useEffect(() => {
    if (open) {
      setOtp(EMPTY_OTP);
      setError("");
      setSuccess(false);
      setCountdown(initialSeconds);
      setCanResend(false);
      submittingRef.current = false;
    } else {
      clearTimers();
    }
  }, [open, initialSeconds, clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  // Countdown ticker
  useEffect(() => {
    if (!open || canResend) return;
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    timers.current.push(timer);
    return () => clearTimeout(timer);
  }, [open, countdown, canResend]);

  const handleComplete = useCallback(
    async (code: string) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setError("");
      setLoading(true);

      try {
        await onVerify(code);
        setSuccess(true);
        onSuccess?.();
        const t = setTimeout(() => onOpenChange(false), 1500);
        timers.current.push(t);
      } catch (err) {
        const message = err instanceof Error ? err.message : texts.genericError;
        setError(message);
        setOtp(EMPTY_OTP);
        submittingRef.current = false;
      }

      setLoading(false);
    },
    [onVerify, onSuccess, onOpenChange, texts.genericError]
  );

  const handleResend = async () => {
    setError("");
    try {
      await onResend();
      setCountdown(initialSeconds);
      setCanResend(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : texts.genericError;
      setError(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
      <DialogContent className="max-w-md">
        {success ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-up-soft">
              <CheckCircle2 className="h-8 w-8 text-up" />
            </div>
            <DialogTitle className="text-up">{texts.successTitle}</DialogTitle>
            <DialogDescription className="mt-1">{texts.successDescription}</DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader className="text-center">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{subtitle}</DialogDescription>
              <p className="num mt-1 text-[13px] font-medium text-text" dir="ltr">
                {target}
              </p>
            </DialogHeader>

            <div className="space-y-4">
              <OTPInput
                length={6}
                value={otp}
                onChange={setOtp}
                onComplete={handleComplete}
                disabled={loading}
                error={!!error}
                autoFocus
              />

              {error && <InlineAlert variant="error" className="justify-center text-center">{error}</InlineAlert>}

              <div className="text-center">
                <p className="mb-2 text-[12px] text-dim">{texts.noCode}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResend}
                  disabled={!canResend || loading}
                  className="text-[13px]"
                >
                  {canResend ? texts.resend : `${texts.resendIn} ${countdown} ${texts.seconds}`}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
