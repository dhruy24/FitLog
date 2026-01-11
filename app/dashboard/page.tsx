import type { Metadata } from 'next';
import MainDashboard from '@/components/MainDashboard';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Workout Dashboard',
  description: 'View your complete workout history, track progress, and analyze your fitness journey. See your workout statistics and calendar.',
  keywords: ['workout dashboard', 'fitness dashboard', 'workout history', 'fitness progress'],
  url: '/dashboard',
  noIndex: true, // Don't index user-specific pages
});

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <MainDashboard />
      </div>
    </div>
  );
}

