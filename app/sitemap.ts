import { MetadataRoute } from 'next';
import { getExercises } from '@/lib/exercises-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fitlog.app';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/exercises`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Dynamic exercise pages
  try {
    const exercises = await getExercises();
    const exercisePages: MetadataRoute.Sitemap = exercises.map((exercise) => ({
      url: `${baseUrl}/exercises/${exercise.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticPages, ...exercisePages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages even if exercises fail to load
    return staticPages;
  }
}
