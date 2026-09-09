'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <main id="main" className="status-page section-pad"><p className="eyebrow">A MOMENTARY PAUSE</p><h1>LET’S TRY<br />THAT AGAIN.</h1><p>This page is taking a little longer. Please try again.</p><button className="button primary" onClick={reset}>Reload this page</button></main>; }
