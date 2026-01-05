import Link from 'next/link';
import { predefinedExercises, getCategories } from '@/lib/exercises';
import ExerciseList from '@/components/ExerciseList';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function ExercisesPage() {
  // Only pass predefined exercises from server, custom exercises will be loaded on client
  const categories = getCategories();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs />
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              FitLog
            </h1>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              Select an exercise to log your workout
            </p>
          </div>
          <Link
            href="/exercises/add"
            className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium text-center min-h-[44px] flex items-center justify-center"
          >
            + Add Exercise
          </Link>
        </div>
        <ExerciseList exercises={predefinedExercises} categories={categories} />
      </div>
    </div>
  );
}

