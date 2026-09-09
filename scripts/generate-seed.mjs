import { writeFileSync } from 'node:fs';
import { conceptProjects } from '../lib/projects.ts';
const quote = (s) => "'" + String(s).replaceAll("'", "''") + "'";
const columns = ['slug','title','discipline','category','image','alt','description','brief','approach','deliverables','is_concept','published','sort_order'];
const rows = conceptProjects.map(p => '(' + columns.map(c => Array.isArray(p[c]) ? 'ARRAY['+p[c].map(quote).join(',')+']::text[]' : typeof p[c] === 'boolean' || typeof p[c] === 'number' ? String(p[c]) : quote(p[c])).join(',') + ')');
writeFileSync(new URL('../supabase/seed.sql', import.meta.url), '-- Original AI-generated concept studies. Run after schema.sql.\nINSERT INTO public.agency_projects ('+columns.join(',')+') VALUES\n'+rows.join(',\n')+'\nON CONFLICT (slug) DO NOTHING;\n');
