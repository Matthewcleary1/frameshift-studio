import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Supabase publishable/anon credentials are intentionally safe to embed in the app.
// Privileged service-role credentials remain inside Supabase Edge Functions only.
const DEFAULT_SUPABASE_URL = 'https://mcwblzbttlionsuwvxbb.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_zEeB55F1ueYhZNX_KC0JmA_yjGFff2p';
const DEFAULT_SUPABASE_EDGE_AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Im1jd2JsemJ0dGxpb25zdXd2eGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NzA1NDksImV4cCI6MjEwNDU0NjU0OX0.qjvZP99o3BKtrDf1vboH5xYYdVNPY9kjN0Qcaxv1vG8';

export function publicSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL ?? DEFAULT_SUPABASE_URL,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? DEFAULT_SUPABASE_PUBLISHABLE_KEY,
    edgeAuthKey: process.env.SUPABASE_EDGE_AUTH_KEY ?? DEFAULT_SUPABASE_EDGE_AUTH_KEY,
  };
}

export function publicDatabase() {
  const { url, publishableKey } = publicSupabaseConfig();
  return createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
