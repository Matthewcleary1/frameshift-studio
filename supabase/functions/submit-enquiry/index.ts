import { createClient } from 'jsr:@supabase/supabase-js@2';

const productionTypes = ['Hybrid production', 'Film & photography', 'Generative AI', 'Help me decide'] as const;
const budgets = ['Under €5,000', '€5,000–€15,000', '€15,000–€30,000', '€30,000–€75,000', '€75,000+', 'Let’s discuss'] as const;
const timelines = ['Within a month', '1–3 months', '3–6 months', 'Still exploring'] as const;
const deliverables = ['Brand film', 'Campaign photography', 'Social content', 'Product imagery', 'Visual development'] as const;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function allowedOrigin(origin: string) {
  if (origin === 'http://localhost:3000') return true;
  if (origin === 'https://frameshift-studio.vercel.app') return true;
  return /^https:\/\/frameshift-studio-[a-z0-9-]+\.vercel\.app$/i.test(origin);
}

function cors(origin: string) {
  return allowedOrigin(origin) ? {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'authorization, apikey, content-type',
    'access-control-max-age': '86400',
    'vary': 'Origin',
  } : {};
}

function json(body: object, status: number, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...cors(origin),
    },
  });
}

function isOneOf<T extends readonly string[]>(value: unknown, allowed: T): value is T[number] {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value);
}

async function hmacSha256(secret: string, value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin') ?? '';
  if (!allowedOrigin(origin)) return json({ error: 'Please send your brief from the FRAME/SHIFT website.' }, 403, origin);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, origin);
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'Please submit the project form.' }, 415, origin);

  const bodyText = await request.text();
  if (new TextEncoder().encode(bodyText).byteLength > 24_000) return json({ error: 'Your brief is too long. Please keep it under 5,000 characters.' }, 413, origin);

  let body: Record<string, unknown>;
  try { body = JSON.parse(bodyText) as Record<string, unknown>; }
  catch { return json({ error: 'Please check the project form and try again.' }, 400, origin); }

  const requestId = body.requestId;
  const productionType = body.productionType;
  const selectedDeliverables = body.deliverables;
  const budget = body.budget;
  const timeline = body.timeline;
  const brief = typeof body.brief === 'string' ? body.brief.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  const consent = body.consent;
  const website = typeof body.website === 'string' ? body.website.trim() : '';

  const valid =
    typeof requestId === 'string' && uuidPattern.test(requestId) &&
    isOneOf(productionType, productionTypes) &&
    Array.isArray(selectedDeliverables) && selectedDeliverables.length <= 5 && selectedDeliverables.every((item) => isOneOf(item, deliverables)) &&
    isOneOf(budget, budgets) && isOneOf(timeline, timelines) &&
    brief.length >= 20 && brief.length <= 5000 &&
    name.length >= 2 && name.length <= 100 &&
    email.length <= 254 && emailPattern.test(email) &&
    company.length <= 160 && consent === true;

  if (!valid) return json({ error: 'Please check your details and complete every required field.' }, 400, origin);
  if (website) return json({ error: 'Your brief could not be accepted.' }, 400, origin);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Enquiries are temporarily unavailable.' }, 503, origin);

  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('cf-connecting-ip')?.trim()
    ?? 'unknown';
  const ipHash = await hmacSha256(serviceRoleKey, clientIp);
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.rpc('agency_submit_enquiry', {
    p_request_id: requestId,
    p_name: name,
    p_email: email,
    p_company: company,
    p_production_type: productionType,
    p_deliverables: selectedDeliverables,
    p_budget: budget,
    p_timeline: timeline,
    p_brief: brief,
    p_ip_hash: ipHash,
  });

  if (error) {
    if (error.message.includes('rate_limit_exceeded')) return json({ error: 'You’ve sent a few briefs recently. Please try again in an hour.' }, 429, origin);
    console.error('agency_submit_enquiry failed', error.code, error.message);
    return json({ error: 'We couldn’t save your brief. Please try again in a moment.' }, 503, origin);
  }
  return json({ reference: data }, 201, origin);
});
