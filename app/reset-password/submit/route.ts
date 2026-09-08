import { API_BASE_URL } from '@/lib/constants';

// Same-origin fallback lets a phone use the website reset form during LAN development.
export async function POST(request: Request) {
  try {
    const submitted = await request.json();
    const body = Object.fromEntries(['email', 'token', 'password', 'password_confirmation', 'cf-turnstile-response'].map(key => [key, typeof submitted[key] === 'string' ? submitted[key] : '']));
    const response = await fetch(`${API_BASE_URL}/user/reset-password`, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'Accept-Language': request.headers.get('accept-language') || 'ar' }, body: JSON.stringify(body), signal: AbortSignal.timeout(20000), cache: 'no-store' });
    return new Response(await response.text(), { status: response.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ success: false, message: 'تعذر الاتصال بالخادم. Could not reach the server.' }, { status: 502 });
  }
}
