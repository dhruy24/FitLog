import type { Metadata } from 'next';
import AddExerciseForm from '@/components/AddExerciseForm';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Add Custom Exercise',
  description: 'Create and add your own custom exercise to track in your workout logs. Personalize your fitness journey with custom exercises.',
  keywords: ['custom exercise', 'add exercise', 'create exercise', 'personalized workout'],
  url: '/exercises/add',
  noIndex: true, // Don't index user-specific pages
});

export default function AddExercisePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <AddExerciseForm />
      </div>
    </div>
  );
}


