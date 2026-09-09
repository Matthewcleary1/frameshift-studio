'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/lib/projects';
import { Arrow } from './icons';

const filters = ['All work', 'Hybrid', 'Film & photo', 'Generative AI'] as const;
export function WorkGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<string>('All work');
  const filtered = projects.filter(p => filter === 'All work' || p.category === filter);
  return <>
    <div className="work-controls"><div className="filter-list" role="group" aria-label="Filter projects">{filters.map(f => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)} className={filter === f ? 'filter active' : 'filter'}>{f}{f === 'All work' && <sup>{String(projects.length).padStart(2, '0')}</sup>}</button>)}</div><p className="concept-note">Original concepts. Future possibilities.</p></div>
    <div className={`work-grid ${filtered.length === 1 ? 'single' : ''}`} aria-live="polite">
      {filtered.map((p, i) => <Link href={`/work/${p.slug}`} className={`project-card ${filter === 'All work' && i === 0 ? 'wide' : ''}`} key={p.slug}>
        <div className="project-image"><Image src={p.image} alt={p.alt} fill sizes={filter === 'All work' && i === 0 ? '(max-width: 760px) 100vw, 94vw' : '(max-width: 760px) 100vw, 47vw'} /><div className="image-topline"><span>{p.category}</span>{p.is_concept && <span>CONCEPT STUDY</span>}</div><span className="project-open"><Arrow diagonal /></span></div>
        <div className="project-caption"><div><p className="eyebrow">{p.discipline}</p><h3>{p.title}</h3></div><p>{p.description}</p></div>
      </Link>)}
      {filtered.length === 0 && <p className="empty-state">New work is taking shape. <Link href="/start">Tell us what you have in mind.</Link></p>}
    </div>
  </>;
}
