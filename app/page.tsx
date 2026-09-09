import Link from 'next/link';
import Image from 'next/image';
import { Arrow } from '@/components/icons';
import { Footer } from '@/components/footer';
import { WorkGrid } from '@/components/work-grid';
import { getProjects } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const projects = await getProjects();
  return <><main id="main">
    <section className="hero" aria-labelledby="hero-heading">
      <Image className="hero-image" src="/images/beyond-the-road.webp" alt="A cinematic automotive concept set in a surreal red desert" fill priority sizes="100vw" />
      <div className="hero-shade" />
      <div className="hero-top"><span className="eyebrow">INDEPENDENT HYBRID PRODUCTION STUDIO</span><span className="hero-coordinate">HUMAN × MACHINE</span></div>
      <div className="hero-copy"><h1 id="hero-heading">REAL CRAFT.<br /><span>UNREAL</span><br className="mobile-break" /> POSSIBILITIES.</h1><div className="hero-bottom"><p>Film. Photography. Generative AI.<br />One vision. Every way to make it.</p><Link href="#work" className="circle-link"><span>Explore the work</span><span className="circle"><Arrow /></span></Link></div></div>
      <div className="hero-caption"><span>01 / BEYOND THE ROAD</span><span>AI-GENERATED CONCEPT</span></div>
    </section>
    <div className="ticker" aria-label="Creative development, live action, photography, generative AI, post production"><span>CREATIVE DEVELOPMENT</span><b>✳</b><span>LIVE ACTION</span><b>✳</b><span>PHOTOGRAPHY</span><b>✳</b><span>GENERATIVE AI</span><b>✳</b><span>POST PRODUCTION</span></div>
    <section className="intro section-pad" id="studio"><p className="eyebrow section-index">01 / THE STUDIO</p><div><h2>GOOD IDEAS DON’T<br />FIT IN <span className="outline-text">ONE FRAME.</span></h2><div className="intro-bottom"><p>We bring filmmakers, photographers and AI artists around the same table. To make ambitious images. To tell stories with feeling. And to find the right way to bring your idea to life.</p><p>From the first treatment to the final grade, creative direction holds it all together. Real production experience, with a wider set of possibilities.</p></div></div></section>
    <section id="work" className="work-section section-pad"><div className="section-heading"><div><p className="eyebrow">02 / IN THE FRAME</p><h2>POSSIBILITY,<br /><span>IN PICTURES.</span></h2></div><p>A look at the worlds we want to make.<br />Three original visual concept studies.</p></div><WorkGrid projects={projects} /></section>
    <section id="approach" className="approach-section section-pad"><div className="section-heading"><div><p className="eyebrow">03 / HOW WE MAKE IT</p><h2>THE IDEA LEADS.<br />THE TOOLS FOLLOW.</h2></div><p>Choose the approach that serves the story.<br />We’ll help you find the right mix.</p></div><div className="approach-grid">
      <article><span className="approach-no">/ 01</span><h3>Human<br />by nature.</h3><span className="approach-label">LIVE ACTION & PHOTOGRAPHY</span><p>Real people, real places, real emotion. Thoughtful casting, cinematography and art direction that give a story its character.</p><ul><li>Film & campaign photography</li><li>Casting, locations & production</li><li>On-set creative direction</li></ul></article>
      <article className="featured-approach"><span className="approach-no">/ 02</span><span className="approach-star" aria-hidden="true">✳</span><h3>Better<br />together.</h3><span className="approach-label">HYBRID PRODUCTION</span><p>Capture what needs to feel real. Create what stretches the imagination. Bring both into one convincing, carefully finished world.</p><ul><li>Live action + generative environments</li><li>Product capture + world building</li><li>Compositing, finishing & adaptation</li></ul></article>
      <article><span className="approach-no">/ 03</span><h3>Beyond<br />the possible.</h3><span className="approach-label">GENERATIVE AI</span><p>New worlds, unexpected imagery and room to explore. Led by artists, shaped through iteration and finished with a critical eye.</p><ul><li>AI imagery & motion development</li><li>Concepts & visual exploration</li><li>Campaign variations & formats</li></ul></article>
    </div></section>
    <section className="process-section section-pad"><div><p className="eyebrow">04 / FROM FIRST THOUGHT TO FINAL FRAME</p><h2>ONE TEAM.<br />ALL THE WAY.</h2><Link href="/start" className="text-link">Tell us your idea <Arrow diagonal /></Link></div><div className="process-list">{[
      ['01', 'Find the story', 'We get clear on the idea, audience, deliverables and budget. Then we shape the creative direction.'],
      ['02', 'Build the plan', 'A treatment, the right team and a production approach. Scope, timings and approvals agreed up front.'],
      ['03', 'Make the world', 'Shoot, generate or combine both. Review the work at agreed milestones, with a producer keeping it moving.'],
      ['04', 'Finish every frame', 'Edit, grade, retouch and deliver. Each format checked, each detail considered.'],
    ].map(([n, title, text]) => <article key={n}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>
    <section className="faq-section section-pad"><p className="eyebrow">A FEW THINGS YOU MIGHT BE WONDERING</p><div>{[
      ['Do we need to know if we want AI or a traditional shoot?', 'No. Bring the brief, the references and the goal. We can develop a production approach around the creative, the budget and the things that need to stay true to your brand.'],
      ['Can you work with our creative agency or in-house team?', 'Yes. We can join an existing concept, handle a specific part of the production, or bring a project from creative development through to delivery.'],
      ['How do you approach AI and brand accuracy?', 'We agree the use of AI before production, work from approved references and review product fidelity, talent consent, usage rights and disclosure requirements as part of the project scope.'],
      ['Is the work shown here a client portfolio?', 'These are original AI-generated concept studies illustrating creative directions. They are labelled throughout and do not represent commissioned campaigns or client endorsements.'],
    ].map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
  </main><Footer /></>;
}
