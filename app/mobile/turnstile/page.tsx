'use client';
import { Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Turnstile } from '@/components/auth/turnstile';
function Challenge() {
  const params = useSearchParams(), nonce = params.get('nonce') || '', language = params.get('lang') === 'en' ? 'en' : 'ar';
  const post = useCallback((type: string, token?: string) => {
    const bridge = (window as Window & { ReactNativeWebView?: { postMessage: (message: string) => void } }).ReactNativeWebView;
    bridge?.postMessage(JSON.stringify({ type, token, nonce, issuedAt: Date.now() }));
  }, [nonce]);
  const verify = useCallback((token: string) => post('token', token), [post]);
  const expire = useCallback(() => post('expired'), [post]);
  return <main dir={language === 'ar' ? 'rtl' : 'ltr'} className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-white p-4 text-black"><h1>{language === 'ar' ? 'التحقق الأمني لقدامك' : 'Odamak security check'}</h1><Turnstile onVerify={verify} onExpire={expire} language={language} /><p>{language === 'ar' ? 'ستعود إلى التطبيق بعد إكمال التحقق.' : 'You will return to the app after verification.'}</p></main>;
}
export default function Page() { return <Suspense><Challenge /></Suspense>; }
