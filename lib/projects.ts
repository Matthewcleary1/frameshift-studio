export type Project = {
  slug: string; title: string; discipline: string; category: 'Hybrid' | 'Film & photo' | 'Generative AI';
  image: string; alt: string; description: string; brief: string; approach: string; deliverables: string[];
  is_concept: boolean; published: boolean; sort_order: number;
};

export const conceptProjects: Project[] = [
  {
    slug: 'beyond-the-road', title: 'Beyond the road', discipline: 'AUTOMOTIVE / WORLD BUILDING', category: 'Hybrid',
    image: '/images/beyond-the-road.webp', alt: 'Black sports car in a red desert canyon beneath a floating silver monolith',
    description: 'Real-world detail. An otherworldly destination.',
    brief: 'Explore an automotive campaign that pairs the precision of a product shoot with an environment that could only exist in the imagination.',
    approach: 'The proposed production would capture the car, reflections and movement on set, then extend the environment with generative imagery and carefully matched compositing. This visual is an AI-generated study of that direction.',
    deliverables: ['Campaign key visual', 'Environment exploration', 'Social & out-of-home layouts'],
    is_concept: true, published: true, sort_order: 1,
  },
  {
    slug: 'a-different-current', title: 'A different current', discipline: 'FASHION / EDITORIAL', category: 'Film & photo',
    image: '/images/a-different-current.webp', alt: 'Fashion concept of a woman in an orange dress on a rugged Mediterranean coast',
    description: 'The elements become part of the story.',
    brief: 'Develop a fashion story around movement, texture and the tension between soft fabric and a wild coastal landscape.',
    approach: 'A photographic treatment for a location-led shoot. Casting, natural light, choreography and styling would carry the final campaign. This AI-generated mood study illustrates the intended art direction; it is not a completed live shoot.',
    deliverables: ['Photographic art direction', 'Location & styling treatment', 'Campaign format studies'],
    is_concept: true, published: true, sort_order: 2,
  },
  {
    slug: 'a-new-nature', title: 'A new nature', discipline: 'BEAUTY / SYNTHETIC STILL LIFE', category: 'Generative AI',
    image: '/images/a-new-nature.webp', alt: 'Chartreuse perfume bottle on dark wet rock in a sculptural studio world',
    description: 'A small object. A world of possibilities.',
    brief: 'Imagine a distinctive beauty campaign where fragrance is expressed through light, material and impossible arrangements.',
    approach: 'An original generative still-life concept, shaped through art direction, image generation and finishing. For a commissioned product, packaging details and product claims would be checked against approved reference assets.',
    deliverables: ['Product concept imagery', 'Material & light studies', 'Campaign adaptation direction'],
    is_concept: true, published: true, sort_order: 3,
  },
];
