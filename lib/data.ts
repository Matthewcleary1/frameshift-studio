import 'server-only';
import { cache } from 'react';
import { publicDatabase } from './supabase';
import { conceptProjects, type Project } from './projects';

export const getProjects = cache(async (): Promise<Project[]> => {
  const db = publicDatabase();
  if (!db) return conceptProjects;
  const { data, error } = await db.from('agency_projects').select('slug,title,discipline,category,image,alt,description,brief,approach,deliverables,is_concept,published,sort_order').eq('published', true).order('sort_order');
  if (error) throw new Error('The portfolio is temporarily unavailable.');
  return data as Project[];
});
