'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { WorkoutLog, MaxStats } from '@/types';
import { getWorkouts, getMaxStats } from '@/lib/storage';
import SetList from './SetList';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Breadcrumbs from './Breadcrumbs';

interface ExerciseHistoryProps {
  exerciseId: string;
  exerciseName: string;
}

export default function ExerciseHistory({ exerciseId, exerciseName }: ExerciseHistoryProps) {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [maxStats, setMaxStats] = useState<MaxStats>({ maxReps: 0, maxWeight: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    const workoutData = getWorkouts(exerciseId);
    const stats = getMaxStats(exerciseId);
    
    // Sort workouts by date (newest first)
    workoutData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setWorkouts(workoutData);
    setMaxStats(stats);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    
    // Reload data when page becomes visible (e.g., returning from edit page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [exerciseId]);

  const handleEdit = (workoutId: string) => {
    router.push(`/exercises/${exerciseId}/edit/${workoutId}`);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center py-12 text-zinc-600 dark:text-zinc-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Breadcrumbs />
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {exerciseName}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">Workout History</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Max Reps</div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {maxStats.maxReps}
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Max Weight (kg)</div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {maxStats.maxWeight}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href={`/exercises/${exerciseId}/entry`}
          className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
        >
          Log New Workout
        </Link>
        <Link
          href={`/exercises/${exerciseId}`}
          className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium text-zinc-900 dark:text-zinc-100"
        >
          Dashboard
        </Link>
        <Link
          href="/exercises"
          className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium text-zinc-900 dark:text-zinc-100"
        >
          Back to Exercises
        </Link>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
          No workout history yet. Log your first workout to see it here!
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Past Workouts
          </h2>
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
            >
              <div className="mb-4 flex justify-between items-start">
                <div>
                  <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    {format(parseISO(workout.date), 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {workout.sets.length} {workout.sets.length === 1 ? 'set' : 'sets'}
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(workout.id)}
                  className="px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-medium"
                >
                  Edit
                </button>
              </div>
              <SetList sets={workout.sets} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

