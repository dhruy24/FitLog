'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { WorkoutSet, WorkoutLog, MaxStats, BestWorkoutMetric, BestWorkoutResult } from '@/types';
import { saveWorkout, updateWorkout, getWorkoutById, getMaxStats, getWorkouts, getLastWorkout, getBestWorkout } from '@/lib/storage/index';
import SetForm from './SetForm';
import SetList from './SetList';
import { useRouter } from 'next/navigation';
import Breadcrumbs from './Breadcrumbs';

interface ExerciseEntryProps {
  exerciseId: string;
  exerciseName: string;
  workoutId?: string; // Optional: if provided, we're in edit mode
}

export default function ExerciseEntry({ exerciseId, exerciseName, workoutId }: ExerciseEntryProps) {
  const router = useRouter();
  const isEditMode = !!workoutId;
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previousBest, setPreviousBest] = useState<MaxStats>({ maxReps: 0, maxWeight: 0 });
  const [lastWorkout, setLastWorkout] = useState<WorkoutLog | null>(null);
  const [bestWorkout, setBestWorkout] = useState<BestWorkoutResult | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<BestWorkoutMetric>('volume');

  useEffect(() => {
    // Load workout data if in edit mode
    const loadData = async () => {
      if (isEditMode && workoutId) {
        const workout = await getWorkoutById(workoutId);
        if (workout) {
          setSelectedDate(workout.date);
          setSets(workout.sets);
        }
        setIsLoading(false);
      }
      
      // Load previous best stats, last workout, and max workout (exclude current workout if editing)
      const excludeId = isEditMode ? workoutId : undefined;
      
      // Load previous best stats
      const allStats = await getMaxStats(exerciseId);
      
      if (isEditMode && workoutId) {
        // If editing, we need to calculate stats excluding the current workout
        const workout = await getWorkoutById(workoutId);
        if (workout) {
          // Get all workouts except the one being edited
          const otherWorkouts = (await getWorkouts(exerciseId)).filter((w: WorkoutLog) => w.id !== workoutId);
          
          let maxReps = 0;
          let maxWeight = 0;
          
          otherWorkouts.forEach((w: WorkoutLog) => {
            w.sets.forEach(set => {
              if (set.reps > maxReps) maxReps = set.reps;
              if (set.weight > maxWeight) maxWeight = set.weight;
            });
          });
          
          setPreviousBest({ maxReps, maxWeight });
        } else {
          setPreviousBest(allStats);
        }
      } else {
        // For new workouts, show all-time best
        setPreviousBest(allStats);
      }
      
      // Load last workout
      const last = await getLastWorkout(exerciseId, excludeId);
      setLastWorkout(last);
      
      // Load best workout by selected metric
      const best = await getBestWorkout(exerciseId, selectedMetric, excludeId);
      setBestWorkout(best);
    };
    
    loadData();
  }, [isEditMode, workoutId, exerciseId, selectedMetric]);

  useEffect(() => {
    // Clear message after 3 seconds
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleAddSet = (set: WorkoutSet) => {
    setSets([...sets, set]);
  };

  const handleRemoveSet = (index: number) => {
    setSets(sets.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (sets.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one set' });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    
    try {
      if (isEditMode && workoutId) {
        // Update existing workout
        const workoutLog: WorkoutLog = {
          id: workoutId,
          date: selectedDate,
          exerciseId,
          sets,
        };
        await updateWorkout(workoutId, workoutLog);
        setMessage({ type: 'success', text: 'Workout updated successfully!' });
      } else {
        // Create new workout
        const workoutLog: WorkoutLog = {
          id: `${exerciseId}-${Date.now()}`,
          date: selectedDate,
          exerciseId,
          sets,
        };
        await saveWorkout(workoutLog);
        setMessage({ type: 'success', text: 'Workout saved successfully!' });
      }
      
      // Redirect after saving
      setTimeout(() => {
        router.push(`/exercises/${exerciseId}/history`);
      }, 1500);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || (isEditMode 
          ? 'Failed to update workout. Please try again.' 
          : 'Failed to save workout. Please try again.')
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-12 text-zinc-600 dark:text-zinc-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Breadcrumbs />
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {exerciseName}
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          {isEditMode ? 'Edit your workout' : 'Log your workout'}
        </p>
      </div>

      {/* New Log Entry Form - At the Top */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={format(new Date(), 'yyyy-MM-dd')}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 min-h-[44px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Sets
          </label>
          <SetForm onAddSet={handleAddSet} />
        </div>

        <SetList sets={sets} onRemoveSet={handleRemoveSet} />

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving || sets.length === 0}
            className="flex-1 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {isSaving ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Workout' : 'Save Workout')}
          </button>
          <button
            onClick={() => router.push(`/exercises/${exerciseId}`)}
            className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium text-zinc-900 dark:text-zinc-100 min-h-[44px]"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Reference Information - Below the Form */}
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
          {lastWorkout && (
            <div className="p-3 sm:p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Last Workout
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                {format(parseISO(lastWorkout.date), 'MMM d, yyyy')}
              </div>
              <SetList sets={lastWorkout.sets} />
            </div>
          )}

          {/* Best Workout */}
          {bestWorkout && (
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
            </div>
          )}
        </div>
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
    </div>
  );
}

