import { Metadata } from 'next';

// Site-wide SEO constants
export const SITE_NAME = 'FitLog';
export const SITE_DESCRIPTION = 'Track your workouts, log exercises, and monitor your fitness progress. A modern exercise tracking application for gym enthusiasts and fitness beginners.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fitlog.app';
export const SITE_KEYWORDS = [
  'fitness tracker',
  'workout log',
  'exercise tracker',
  'gym tracker',
  'fitness app',
  'workout journal',
  'exercise log',
  'fitness progress',
  'strength training',
  'workout tracking',
];

// Default Open Graph image (you can replace this with your actual OG image)
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Generate Open Graph metadata
 */
export function generateOpenGraph(
  title: string,
  description: string,
  url?: string,
  image?: string,
  type: 'website' | 'article' = 'website'
): Metadata['openGraph'] {
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const ogImage = image || DEFAULT_OG_IMAGE;

  return {
    type,
    url: fullUrl,
    title,
    description,
    siteName: SITE_NAME,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  };
}

/**
 * Generate Twitter Card metadata
 */
export function generateTwitterCard(
  title: string,
  description: string,
  image?: string
): Metadata['twitter'] {
  const twitterImage = image || DEFAULT_OG_IMAGE;

  return {
    card: 'summary_large_image',
    title,
    description,
    images: [twitterImage],
  };
}

/**
 * Generate comprehensive metadata for a page
 */
export function generateMetadata({
  title,
  description,
  keywords,
  url,
  image,
  type = 'website',
  noIndex = false,
}: {
  title: string;
  description: string;
  keywords?: string[];
  url?: string;
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}): Metadata {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const allKeywords = keywords ? [...SITE_KEYWORDS, ...keywords] : SITE_KEYWORDS;

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: generateOpenGraph(fullTitle, description, url, image, type),
    twitter: generateTwitterCard(fullTitle, description, image),
    alternates: {
      canonical: url ? `${SITE_URL}${url}` : SITE_URL,
    },
  };
}

/**
 * Generate exercise-specific metadata
 */
export function generateExerciseMetadata(
  exerciseName: string,
  exerciseId: string,
  category?: string,
  muscleGroup?: string
): Metadata {
  const description = `Track your ${exerciseName} workouts. Log sets, reps, and weight. View your progress, personal records, and workout history. ${category ? `Category: ${category}.` : ''} ${muscleGroup ? `Muscle Group: ${muscleGroup}.` : ''}`;

  return generateMetadata({
    title: `${exerciseName} Workout Tracker`,
    description,
    keywords: [
      exerciseName.toLowerCase(),
      `${exerciseName} workout`,
      `${exerciseName} tracker`,
      category?.toLowerCase() || '',
      muscleGroup?.toLowerCase() || '',
    ].filter(Boolean),
    url: `/exercises/${exerciseId}`,
    type: 'article',
  });
}

/**
 * Generate WebApplication schema for the main site
 */
export function generateWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
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
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  };
}
