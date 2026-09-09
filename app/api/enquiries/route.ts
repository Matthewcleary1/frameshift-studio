import { NextResponse } from 'next/server';
import { briefSchema } from '@/lib/brief-schema';
import { publicSupabaseConfig } from '@/lib/supabase';

export const runtime = 'nodejs';
export const preferredRegion = 'cdg1';
export const maxDuration = 30;

export async function POST(request: Request) {
  const respond = (body: object, status: number) => NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });

  const origin = request.headers.get('origin');
  const allowed = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
    'https://frameshift-studio.vercel.app',
  ].filter(Boolean);
  if (process.env.NODE_ENV === 'development') allowed.push('http://localhost:3000');
  if (!origin || !allowed.includes(origin)) {
    return respond({ error: 'Please send your brief from this website.' }, 403);
  }
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return respond({ error: 'Please submit the project form.' }, 415);
  }

  let raw: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return respond({ error: 'Please complete the project form.' }, 400);
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 24_000) {
        await reader.cancel();
        return respond({ error: 'Your brief is too long. Please keep it under 5,000 characters.' }, 413);
      }
      chunks.push(value);
    }
    raw = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return respond({ error: 'Please check the project form and try again.' }, 400);
  }

  const parsed = briefSchema.safeParse(raw);
  if (!parsed.success) {
    return respond({ error: 'Please check your details and complete every required field.' }, 400);
  }
  if (parsed.data.website) return respond({ error: 'Your brief could not be accepted.' }, 400);

  const { url, publishableKey, edgeAuthKey } = publicSupabaseConfig();
  const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'unknown';

  try {
    const edgeResponse = await fetch(`${url}/functions/v1/submit-enquiry`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'content-type': 'application/json',
        apikey: publishableKey,
        authorization: `Bearer ${edgeAuthKey}`,
        'x-frameshift-client-ip': ip,
      },
      body: JSON.stringify(parsed.data),
    });

    const result = await edgeResponse.json().catch(() => null) as { reference?: string; error?: string } | null;
    if (!edgeResponse.ok) {
      return respond({ error: result?.error ?? 'We couldn’t save your brief. Please try again in a moment.' }, edgeResponse.status);
    }
    if (!result?.reference) {
      return respond({ error: 'We couldn’t save your brief. Please try again in a moment.' }, 503);
    }
    return respond({ reference: result.reference }, 201);
  } catch {
    return respond({ error: 'We couldn’t save your brief. Please try again in a moment.' }, 503);
  }
}
