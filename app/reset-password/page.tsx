'use client';
import { FormEvent, Suspense, useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Turnstile } from '@/components/auth/turnstile';
function Handoff() {
  const params = useSearchParams(), email = params.get('email') || '', token = params.get('token') || '';
  const [password, setPassword] = useState(''), [confirmation, setConfirmation] = useState(''), [challenge, setChallenge] = useState(''), [issuedAt, setIssuedAt] = useState(0), [attempt, setAttempt] = useState(0), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const verified = useCallback((value: string) => { setChallenge(value); setIssuedAt(Date.now()); }, []), expired = useCallback(() => setChallenge(''), []);
  const deepLink = `odamak://auth/reset-password?${new URLSearchParams({ email, token })}`;
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setMessage('');
    if (!email || !token || password.length < 8 || password !== confirmation) { setMessage('تحقق من الرابط وكلمتي المرور (8 أحرف على الأقل). Check the link and matching passwords (8+ characters).'); return; }
    if (!challenge || Date.now() - issuedAt >= 240000) { setChallenge(''); setAttempt(n => n + 1); setMessage('أكمل التحقق الأمني مجدداً. Complete a fresh security check.'); return; }
    setBusy(true); const currentChallenge = challenge; setChallenge('');
    try { const response = await fetch('/reset-password/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, token, password, password_confirmation: confirmation, 'cf-turnstile-response': currentChallenge }) }); const body = await response.json(); if (!response.ok || body.success === false) throw new Error(Object.values(body.errors || {}).flat().join('\n') || body.error?.message || body.message || 'Reset failed'); setMessage('تم تغيير كلمة المرور. Password changed.'); setPassword(''); setConfirmation(''); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'تعذر تغيير كلمة المرور. Reset failed.'); }
    finally { setBusy(false); setAttempt(n => n + 1); }
  };
  return <main className="mx-auto my-12 max-w-lg space-y-6 rounded-xl border border-line bg-panel p-6 text-text"><h1 className="text-2xl">إعادة تعيين كلمة المرور / Reset password</h1>{email && token ? <a className="block rounded-lg bg-gold p-3 text-center text-on-gold" href={deepLink}>فتح في التطبيق / Open in app</a> : <p>رابط غير صالح / Invalid link</p>}<p>أو أكمل هنا / Or continue on the website</p><form onSubmit={submit} className="space-y-4"><label className="block">كلمة المرور الجديدة / New password<input className="block w-full rounded border p-3" type="password" autoComplete="new-password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required /></label><label className="block">تأكيد كلمة المرور / Confirm password<input className="block w-full rounded border p-3" type="password" autoComplete="new-password" minLength={8} value={confirmation} onChange={e => setConfirmation(e.target.value)} required /></label><Turnstile key={attempt} onVerify={verified} onExpire={expired} /><button className="rounded-lg bg-gold p-3 text-on-gold disabled:opacity-50" disabled={busy || !challenge || !email || !token}>حفظ / Save</button></form><p role="status">{message}</p></main>;
}
export default function Page() { return <Suspense><Handoff /></Suspense>; }
