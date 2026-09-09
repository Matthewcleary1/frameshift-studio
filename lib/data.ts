import 'server-only';
import { cache } from 'react';
import { publicDatabase } from './supabase';
import { conceptProjects, type Project } from './projects';

const portfolioAssetOrigin = 'https://mcwblzbttlionsuwvxbb.supabase.co/storage/v1/object/public/portfolio';

function withHostedImage(project: Project): Project {
  if (!project.image.startsWith('/images/')) return project;
  return { ...project, image: `${portfolioAssetOrigin}/${project.image.slice('/images/'.length)}` };
}

export const getProjects = cache(async (): Promise<Project[]> => {
  const db = publicDatabase();
  if (!db) return conceptProjects.map(withHostedImage);
  const { data, error } = await db.from('agency_projects').select('slug,title,discipline,category,image,alt,description,brief,approach,deliverables,is_concept,published,sort_order').eq('published', true).order('sort_order');
  if (error) throw new Error('The portfolio is temporarily unavailable.');
  return (data as Project[]).map(withHostedImage);
});
