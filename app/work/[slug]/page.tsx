import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProjects } from '@/lib/data';
import { Arrow } from '@/components/icons';
import { Footer } from '@/components/footer';

export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = (await getProjects()).find(p=>p.slug === slug);
  return { title: project?.title ?? 'Project not found', description: project?.description };
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find(p=>p.slug === slug);
  if (!project) notFound();
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  return <><main id="main" className="project-page"><div className="project-title section-pad"><Link href="/#work" className="back-link">← All work</Link><p className="eyebrow">{project.discipline} {project.is_concept && '/ CONCEPT STUDY'}</p><h1>{project.title}</h1><p>{project.description}</p></div><div className="project-full-image"><Image src={project.image} alt={project.alt} fill priority sizes="100vw" /></div><section className="project-story section-pad"><div><p className="eyebrow">THE DIRECTION</p><h2>{project.category}</h2>{project.is_concept && <p className="concept-disclaimer">An original AI-generated visual study. No client commission or endorsement is implied.</p>}</div><div><h3>The idea</h3><p>{project.brief}</p><h3>The proposed approach</h3><p>{project.approach}</p><h3>Concept scope</h3><ul>{project.deliverables.map(d=><li key={d}>{d}</li>)}</ul><Link href="/start" className="button primary">Have something in mind? <Arrow diagonal /></Link></div></section>{next && next.slug !== slug && <Link href={`/work/${next.slug}`} className="next-project section-pad"><span className="eyebrow">NEXT CONCEPT</span><span>{next.title}</span><Arrow /></Link>}</main><Footer /></>;
}
