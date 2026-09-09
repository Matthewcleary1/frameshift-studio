import { z } from 'zod';

export const productionTypes = ['Hybrid production', 'Film & photography', 'Generative AI', 'Help me decide'] as const;
export const budgetOptions = ['Under €5,000', '€5,000–€15,000', '€15,000–€30,000', '€30,000–€75,000', '€75,000+', 'Let’s discuss'] as const;
export const timelineOptions = ['Within a month', '1–3 months', '3–6 months', 'Still exploring'] as const;
export const deliverableOptions = ['Brand film', 'Campaign photography', 'Social content', 'Product imagery', 'Visual development'] as const;

export const briefSchema = z.object({
  requestId: z.uuid(),
  productionType: z.enum(productionTypes),
  deliverables: z.array(z.enum(deliverableOptions)).max(5),
  budget: z.enum(budgetOptions),
  timeline: z.enum(timelineOptions),
  brief: z.string().trim().min(20, 'Please tell us a little more (at least 20 characters).').max(5000),
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254).transform(s => s.toLowerCase()),
  company: z.string().trim().max(160),
  consent: z.literal(true),
  website: z.string().max(200).optional(),
});
export type BriefInput = z.infer<typeof briefSchema>;
