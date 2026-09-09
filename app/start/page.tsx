import type { Metadata } from 'next';
import { BriefForm } from '@/components/brief-form';
import { Footer } from '@/components/footer';
import { publicSupabaseConfig } from '@/lib/supabase';

export const metadata: Metadata = { title: 'Start a project', description: 'Share your production brief with FRAME/SHIFT.' };
export const dynamic = 'force-dynamic';

export default function StartProject() {
  const { url, publishableKey, edgeAuthKey } = publicSupabaseConfig();
  const submission = {
    endpoint: `${url}/functions/v1/submit-enquiry`,
    publishableKey,
    edgeAuthKey,
  };
  const enabled = Boolean(url && publishableKey && edgeAuthKey);
  return <><main id="main" className="start-page section-pad"><div className="start-intro"><p className="eyebrow">LET’S MAKE IT HAPPEN</p><h1>BIG IDEA?<br /><span>WE’RE IN.</span></h1><p>A first thought, a full treatment, or a question about what’s possible. We’d love to hear it.</p><div className="start-aside"><span className="asterisk" aria-hidden="true">✳</span><p>Good work starts with<br />a good conversation.</p></div></div><BriefForm enabled={enabled} submission={submission} /></main><Footer compact /></>;
}
