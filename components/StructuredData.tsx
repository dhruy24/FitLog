'use client';

interface StructuredDataProps {
  data: Record<string, any>;
}

/**
 * Component to inject JSON-LD structured data into the page
 * This helps search engines understand the content better
 */
export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Generate WebApplication schema for the main site
 */
export function generateWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'FitLog',
    description: 'Track your workouts, log exercises, and monitor your fitness progress',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://fitlog.app',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

/**
 * Generate Exercise schema for exercise pages
 */
export function generateExerciseSchema(
  exerciseName: string,
  exerciseId: string,
  category?: string,
  muscleGroup?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ExerciseAction',
    name: exerciseName,
    identifier: exerciseId,
    ...(category && { category }),
    ...(muscleGroup && { muscleGroup }),
    target: {
      '@type': 'Muscle',
      name: muscleGroup || 'Various',
    },
  };
}

/**
 * Generate BreadcrumbList schema for navigation
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FitLog',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://fitlog.app',
    description: 'A modern exercise tracking application',
  };
}
