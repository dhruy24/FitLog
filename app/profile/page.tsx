import type { Metadata } from 'next';
import ProfileManager from '@/components/ProfileManager';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Profile Management',
  description: 'Manage your FitLog profile and workout settings. Customize your fitness tracking experience.',
  url: '/profile',
  noIndex: true, // Don't index user-specific pages
});

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <ProfileManager />
      </div>
    </div>
  );
}

