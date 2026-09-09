'use client';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Arrow } from './icons';
import { productionTypes, budgetOptions, timelineOptions, deliverableOptions, briefSchema } from '@/lib/brief-schema';

type SubmissionConfig = {
  endpoint: string;
  publishableKey: string;
  edgeAuthKey: string;
};

export function BriefForm({ enabled, submission }: { enabled: boolean; submission: SubmissionConfig }) {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const requestId = useRef('');
  const heading = useRef<HTMLHeadingElement>(null);
  const [data, setData] = useState({ productionType: '', deliverables: [] as string[], budget: '', timeline: '', brief: '', name: '', email: '', company: '', consent: false, website: '' });
  useEffect(() => { if (step > 1) heading.current?.focus(); }, [step]);
  function set(key: string, value: string | boolean | string[]) { requestId.current = ''; setData(d => ({...d, [key]: value})); setError(''); }
  function goBack() { setError(''); setStep(s => s - 1); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (step < 3) { setStep(s => s + 1); return; }
    if (!enabled) return;
    requestId.current ||= crypto.randomUUID();
    const result = briefSchema.safeParse({ ...data, requestId: requestId.current });
    if (!result.success) { setError('Please check your details and complete every required field.'); return; }
    setBusy(true);
    try {
      const response = await fetch(submission.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: submission.publishableKey,
          Authorization: `Bearer ${submission.edgeAuthKey}`,
        },
        body: JSON.stringify(result.data),
        signal: AbortSignal.timeout(20000),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'Your brief could not be sent. Please try again.');
      setReference(body.reference);
    } catch (err) { setError(err instanceof Error && err.name !== 'TimeoutError' ? err.message : 'We couldn’t confirm delivery. Please try again; your brief won’t be duplicated.'); }
    finally { setBusy(false); }
  }
  if (reference) return <div className="brief-success" role="status"><span className="success-mark">✓</span><p className="eyebrow">BRIEF RECEIVED</p><h2>IT STARTS<br />WITH AN IDEA.</h2><p>Thanks, {data.name.split(' ')[0]}. Your brief is with the studio. We’ll use {data.email} to get in touch.</p><p className="reference">Your reference: {reference}</p><Link href="/#work" className="button primary">Explore the concepts <Arrow /></Link></div>;
  return <form className="brief-form" onSubmit={submit}>
    <ol className="form-steps" aria-label="Brief progress">{['The project', 'The details', 'About you'].map((label, index) => <li key={label} aria-current={step === index + 1 ? 'step' : undefined} className={step >= index + 1 ? 'reached' : ''}><span>0{index + 1}</span>{label}</li>)}</ol>
    {step === 1 && <div className="form-step"><h2 ref={heading} tabIndex={-1}>What are we making?</h2><p className="form-hint">Start with a direction. We can work out the rest together.</p><fieldset><legend>Production approach <span>*</span></legend><div className="production-options">{productionTypes.map((type,i) => <label key={type} className={data.productionType === type ? 'option-tile selected' : 'option-tile'}><input type="radio" name="productionType" required value={type} checked={data.productionType === type} onChange={()=>set('productionType',type)} /><span className="option-number">0{i+1}</span><span>{type}</span><span className="option-check" aria-hidden="true">{data.productionType === type ? '✓' : '+'}</span></label>)}</div></fieldset><fieldset><legend>What do you need? <span className="optional">Optional, select all that apply</span></legend><div className="deliverable-options">{deliverableOptions.map(option => <label key={option} className={data.deliverables.includes(option) ? 'chip selected' : 'chip'}><input type="checkbox" checked={data.deliverables.includes(option)} onChange={e=>set('deliverables', e.target.checked ? [...data.deliverables,option] : data.deliverables.filter(d=>d!==option))} />{option}</label>)}</div></fieldset></div>}
    {step === 2 && <div className="form-step"><h2 ref={heading} tabIndex={-1}>Give us the bigger picture.</h2><p className="form-hint">A rough idea is enough to start a useful conversation.</p><label className="field">Tell us about your project <span className="required">*</span><textarea required minLength={20} maxLength={5000} rows={5} value={data.brief} onChange={e=>set('brief',e.target.value)} placeholder="The idea, the audience, the feeling you want to create…" /><span className="field-help">At least 20 characters. Please leave out confidential or sensitive information.</span></label><div className="field-row"><label className="field">Indicative budget <span className="required">*</span><select required value={data.budget} onChange={e=>set('budget',e.target.value)}><option value="" disabled>Select a range</option>{budgetOptions.map(b=><option key={b}>{b}</option>)}</select></label><label className="field">Your timeline <span className="required">*</span><select required value={data.timeline} onChange={e=>set('timeline',e.target.value)}><option value="" disabled>Select timing</option>{timelineOptions.map(t=><option key={t}>{t}</option>)}</select></label></div></div>}
    {step === 3 && <div className="form-step"><h2 ref={heading} tabIndex={-1}>And who’s behind the idea?</h2><p className="form-hint">Let’s put a name to the conversation.</p><div className="field-row"><label className="field">Your name <span className="required">*</span><input required minLength={2} maxLength={100} autoComplete="name" value={data.name} onChange={e=>set('name',e.target.value)} /></label><label className="field">Company <span className="optional">Optional</span><input maxLength={160} autoComplete="organization" value={data.company} onChange={e=>set('company',e.target.value)} /></label></div><label className="field">Email address <span className="required">*</span><input required type="email" maxLength={254} autoComplete="email" value={data.email} onChange={e=>set('email',e.target.value)} /></label><div className="brief-review"><p className="eyebrow">YOUR BRIEF AT A GLANCE</p><p>{data.productionType}</p><span>{data.budget} · {data.timeline}</span><p className="brief-excerpt">{data.brief}</p><button type="button" onClick={()=>setStep(2)}>Edit project details</button></div><label className="consent-label"><input type="checkbox" required checked={data.consent} onChange={e=>set('consent',e.target.checked)} /><span>I agree to be contacted about this project. <Link href="/privacy" target="_blank">How we use your enquiry</Link>.</span></label><div className="honeypot" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={data.website} onChange={e=>set('website',e.target.value)} /></label></div></div>}
    {!enabled && <p className="preview-notice">Enquiries open soon. You can explore this brief form, but it won’t send or save your information yet.</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-actions">{step > 1 ? <button type="button" className="back-button" onClick={goBack} disabled={busy}>← Back</button> : <span className="required-note">* Required fields</span>}<button className="button primary" type="submit" disabled={busy || (step === 3 && !enabled)}>{busy ? 'Sending your brief…' : step === 3 ? 'Send your brief' : 'Continue'}<Arrow /></button></div>
  </form>;
}
