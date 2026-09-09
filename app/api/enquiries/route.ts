import { NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import { briefSchema } from '@/lib/brief-schema';
import { privateDatabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: Request) {
  const respond = (body: object, status: number) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  const origin = request.headers.get('origin');
  const allowed = [process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`, process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`].filter(Boolean);
  if (process.env.NODE_ENV === 'development') allowed.push('http://localhost:3000');
  if (!origin || !allowed.includes(origin)) return respond({ error: 'Please send your brief from this website.' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) return respond({ error: 'Please submit the project form.' }, 415);
  const db = privateDatabase();
  if (!db) return respond({ error: 'Enquiries are not open yet. Please check back soon.' }, 503);
  let raw;
  try {
    const reader = request.body?.getReader();
    if (!reader) return respond({ error: 'Please complete the project form.' }, 400);
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 24000) { await reader.cancel(); return respond({ error: 'Your brief is too long. Please keep it under 5,000 characters.' }, 413); }
      chunks.push(value);
    }
    raw = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch { return respond({ error: 'Please check the project form and try again.' }, 400); }
  const parsed = briefSchema.safeParse(raw);
  if (!parsed.success) return respond({ error: 'Please check your details and complete every required field.' }, 400);
  const { website, requestId, name, email, company, productionType, deliverables, budget, timeline, brief } = parsed.data;
  if (website) return respond({ error: 'Your brief could not be accepted.' }, 400);
  // Vercel overwrites this header with the actual client address.
  const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const ipHash = createHmac('sha256', process.env.SUPABASE_SECRET_KEY!).update(ip).digest('hex');
  const { data, error } = await db.rpc('agency_submit_enquiry', {
    p_request_id: requestId, p_name: name, p_email: email, p_company: company,
    p_production_type: productionType, p_deliverables: deliverables, p_budget: budget,
    p_timeline: timeline, p_brief: brief, p_ip_hash: ipHash,
  });
  if (error) {
    if (error.message.includes('rate_limit_exceeded')) return respond({ error: 'You’ve sent a few briefs recently. Please try again in an hour.' }, 429);
    return respond({ error: 'We couldn’t save your brief. Please try again in a moment.' }, 503);
  }
  return respond({ reference: data }, 201);
}
