'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { WorkoutLog, MaxStats, BestWorkoutMetric, BestWorkoutResult } from '@/types';
import { getMaxStats, getLastWorkout, getBestWorkout } from '@/lib/storage';
import SetList from './SetList';
import Link from 'next/link';
import Breadcrumbs from './Breadcrumbs';

interface ExerciseDashboardProps {
  exerciseId: string;
  exerciseName: string;
}

export default function ExerciseDashboard({ exerciseId, exerciseName }: ExerciseDashboardProps) {
  const [previousBest, setPreviousBest] = useState<MaxStats>({ maxReps: 0, maxWeight: 0 });
  const [lastWorkout, setLastWorkout] = useState<WorkoutLog | null>(null);
  const [bestWorkout, setBestWorkout] = useState<BestWorkoutResult | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<BestWorkoutMetric>('volume');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [exerciseId, selectedMetric]);

  const loadDashboardData = () => {
    // Load previous best stats
    const allStats = getMaxStats(exerciseId);
    setPreviousBest(allStats);
    
    // Load last workout
    const last = getLastWorkout(exerciseId);
    setLastWorkout(last);
    
    // Load best workout by selected metric
    const best = getBestWorkout(exerciseId, selectedMetric);
    setBestWorkout(best);
    
    setIsLoading(false);
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
        <p className="text-zinc-600 dark:text-zinc-400">Exercise Dashboard</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
        <Link
          href={`/exercises/${exerciseId}/entry`}
          className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium text-center min-h-[44px] flex items-center justify-center"
        >
          Log New Workout
        </Link>
        <Link
          href={`/exercises/${exerciseId}/history`}
          className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium text-zinc-900 dark:text-zinc-100 text-center min-h-[44px] flex items-center justify-center"
        >
          View History
        </Link>
        <Link
          href="/exercises"
          className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium text-zinc-900 dark:text-zinc-100 text-center min-h-[44px] flex items-center justify-center"
        >
          Back to Exercises
        </Link>
      </div>

      {/* Previous Best Stats */}
      {(previousBest.maxReps > 0 || previousBest.maxWeight > 0) && (
        <div className="p-3 sm:p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            Previous Best Stats
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Max Reps</div>
              <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {previousBest.maxReps}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Max Weight (kg)</div>
              <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {previousBest.maxWeight}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workout Comparison */}
      <div className="space-y-4">
        {/* Metric Selector for Best Workout */}
        {lastWorkout && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Best Workout by:
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as BestWorkoutMetric)}
              className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 min-h-[44px]"
            >
              <option value="volume">Total Volume</option>
              <option value="weight">Max Weight</option>
              <option value="reps">Max Reps</option>
              <option value="1rm">Estimated 1RM</option>
              <option value="bestSet">Best Set Volume</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Last Workout */}
          {lastWorkout ? (
            <div className="p-3 sm:p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Last Workout
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                {format(parseISO(lastWorkout.date), 'MMM d, yyyy')}
              </div>
              <SetList sets={lastWorkout.sets} />
              <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                <Link
                  href={`/exercises/${exerciseId}/edit/${lastWorkout.id}`}
                  className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium min-h-[44px] flex items-center"
                >
                  Edit this workout →
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Last Workout
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                No workouts yet. Log your first workout to get started!
              </div>
            </div>
          )}

          {/* Best Workout */}
          {bestWorkout ? (
            <div className="p-3 sm:p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Best Workout ({bestWorkout.metricName})
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                {format(parseISO(bestWorkout.workout.date), 'MMM d, yyyy')}
              </div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                {bestWorkout.metric === 'volume' || bestWorkout.metric === 'bestSet' 
                  ? `${bestWorkout.value.toLocaleString()} kg`
                  : bestWorkout.metric === '1rm'
                  ? `${bestWorkout.value.toFixed(1)} kg`
                  : bestWorkout.metric === 'weight'
                  ? `${bestWorkout.value} kg`
                  : `${bestWorkout.value} reps`}
              </div>
              <SetList sets={bestWorkout.workout.sets} />
              <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                <Link
                  href={`/exercises/${exerciseId}/edit/${bestWorkout.workout.id}`}
                  className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium min-h-[44px] flex items-center"
                >
                  Edit this workout →
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Best Workout
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                No workouts yet. Log your first workout to see your best performance!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

