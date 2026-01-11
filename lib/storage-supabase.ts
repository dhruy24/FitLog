import { WorkoutLog, MaxStats, Exercise, Profile, WorkoutMetrics, BestWorkoutMetric, BestWorkoutResult } from '@/types';
import { createClient } from '@/lib/supabase/client';

// Helper to get current user ID
async function getUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// Profile Management Functions
export async function getProfile(): Promise<Profile | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateProfileName(name: string): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error('User not authenticated');

  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ name: name.trim() })
    .eq('id', userId);

  if (error) throw new Error(error.message);
}

// Workout Functions
export async function saveWorkout(workoutData: WorkoutLog): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error('User not authenticated');

  const supabase = createClient();
  const { error } = await supabase
    .from('workouts')
    .insert({
      id: workoutData.id,
      user_id: userId,
      date: workoutData.date,
      exercise_id: workoutData.exerciseId,
      sets: workoutData.sets,
    });

  if (error) {
    console.error('Error saving workout:', error);
    throw new Error('Failed to save workout');
  }
}

export async function getWorkouts(exerciseId?: string, date?: string): Promise<WorkoutLog[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const supabase = createClient();
  let query = supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (exerciseId) {
    query = query.eq('exercise_id', exerciseId);
  }

  if (date) {
    query = query.eq('date', date);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error retrieving workouts:', error);
    return [];
  }

  if (!data) return [];

  return data.map((w: any) => ({
    id: w.id,
    date: w.date,
    exerciseId: w.exercise_id,
    sets: w.sets,
  }));
}

export async function getWorkoutById(workoutId: string): Promise<WorkoutLog | undefined> {
  const userId = await getUserId();
  if (!userId) return undefined;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', workoutId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return undefined;

  return {
    id: data.id,
    date: data.date,
    exerciseId: data.exercise_id,
    sets: data.sets,
  };
}

export async function updateWorkout(workoutId: string, workoutData: WorkoutLog): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error('User not authenticated');

  const supabase = createClient();
  const { error } = await supabase
    .from('workouts')
    .update({
      date: workoutData.date,
      exercise_id: workoutData.exerciseId,
      sets: workoutData.sets,
    })
    .eq('id', workoutId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating workout:', error);
    throw new Error('Failed to update workout');
  }
}

export async function deleteWorkout(workoutId: string): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error('User not authenticated');

  const supabase = createClient();
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting workout:', error);
    throw new Error('Failed to delete workout');
  }
}

export async function getMaxStats(exerciseId: string): Promise<MaxStats> {
  const workouts = await getWorkouts(exerciseId);

  if (workouts.length === 0) {
    return { maxReps: 0, maxWeight: 0 };
  }

  let maxReps = 0;
  let maxWeight = 0;

  workouts.forEach(workout => {
    workout.sets.forEach(set => {
      if (set.reps > maxReps) {
        maxReps = set.reps;
      }
      if (set.weight > maxWeight) {
        maxWeight = set.weight;
      }
    });
  });

  return { maxReps, maxWeight };
}

export async function getLastWorkout(exerciseId: string, excludeWorkoutId?: string): Promise<WorkoutLog | null> {
  const workouts = await getWorkouts(exerciseId);

  if (workouts.length === 0) return null;

  // Filter out excluded workout if provided
  let filteredWorkouts = excludeWorkoutId 
    ? workouts.filter(w => w.id !== excludeWorkoutId)
    : workouts;

  if (filteredWorkouts.length === 0) return null;

  // Sort by date (newest first) and return the most recent
  filteredWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return filteredWorkouts[0];
}

export function calculateWorkoutMetrics(workout: WorkoutLog): WorkoutMetrics {
  let totalVolume = 0;
  let maxWeight = 0;
  let maxReps = 0;
  let bestSetVolume = 0;
  let totalReps = 0;
  let totalWeight = 0;
  let setCount = 0;
  let estimated1RM = 0;

  workout.sets.forEach(set => {
    const setVolume = set.reps * set.weight;
    totalVolume += setVolume;
    maxWeight = Math.max(maxWeight, set.weight);
    maxReps = Math.max(maxReps, set.reps);
    bestSetVolume = Math.max(bestSetVolume, setVolume);
    totalReps += set.reps;
    totalWeight += set.weight;
    setCount++;
    
    // Calculate 1RM estimate (Epley formula)
    const set1RM = set.weight * (1 + set.reps / 30);
    estimated1RM = Math.max(estimated1RM, set1RM);
  });

  return {
    totalVolume,
    maxWeight,
    maxReps,
    estimated1RM,
    averageWeight: setCount > 0 ? totalWeight / setCount : 0,
    bestSetVolume,
    totalReps
  };
}

export async function getBestWorkout(
  exerciseId: string,
  metric: BestWorkoutMetric = 'volume',
  excludeWorkoutId?: string
): Promise<BestWorkoutResult | null> {
  const workouts = await getWorkouts(exerciseId);

  if (workouts.length === 0) return null;

  // Filter out excluded workout if provided
  let filteredWorkouts = excludeWorkoutId 
    ? workouts.filter(w => w.id !== excludeWorkoutId)
    : workouts;

  if (filteredWorkouts.length === 0) return null;

  let bestWorkout: WorkoutLog | null = null;
  let bestValue = 0;
  let metricName = '';

  filteredWorkouts.forEach(workout => {
    const metrics = calculateWorkoutMetrics(workout);
    let value = 0;

    switch (metric) {
      case 'volume':
        value = metrics.totalVolume;
        metricName = 'Total Volume';
        break;
      case 'weight':
        value = metrics.maxWeight;
        metricName = 'Max Weight';
        break;
      case 'reps':
        value = metrics.maxReps;
        metricName = 'Max Reps';
        break;
      case '1rm':
        value = metrics.estimated1RM;
        metricName = 'Estimated 1RM';
        break;
      case 'bestSet':
        value = metrics.bestSetVolume;
        metricName = 'Best Set Volume';
        break;
    }

    if (value > bestValue) {
      bestValue = value;
      bestWorkout = workout;
    }
  });

  return bestWorkout ? { 
    workout: bestWorkout, 
    metric, 
    metricName, 
    value: bestValue 
  } : null;
}

// Legacy function for backward compatibility
export async function getMaxWorkout(exerciseId: string, excludeWorkoutId?: string): Promise<{ workout: WorkoutLog; type: 'reps' | 'weight' } | null> {
  const bestByWeight = await getBestWorkout(exerciseId, 'weight', excludeWorkoutId);
  const bestByReps = await getBestWorkout(exerciseId, 'reps', excludeWorkoutId);
  
  if (!bestByWeight && !bestByReps) return null;
  
  // Prioritize weight if both exist
  if (bestByWeight && bestByReps) {
    return { workout: bestByWeight.workout, type: 'weight' };
  }
  
  if (bestByWeight) {
    return { workout: bestByWeight.workout, type: 'weight' };
  }
  
  return { workout: bestByReps!.workout, type: 'reps' };
}

// Custom Exercise Functions
export async function saveCustomExercise(exercise: Exercise): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error('User not authenticated');

  const supabase = createClient();
  const { error } = await supabase
    .from('custom_exercises')
    .insert({
      user_id: userId,
      exercise_id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      muscle_group: exercise.muscleGroup,
    });

  if (error) {
    // If duplicate, update instead
    if (error.code === '23505') { // Unique violation
      const { error: updateError } = await supabase
        .from('custom_exercises')
        .update({
          name: exercise.name,
          category: exercise.category,
          muscle_group: exercise.muscleGroup,
        })
        .eq('user_id', userId)
        .eq('exercise_id', exercise.id);

      if (updateError) {
        console.error('Error updating custom exercise:', updateError);
        throw new Error('Failed to save custom exercise');
      }
    } else {
      console.error('Error saving custom exercise:', error);
      throw new Error('Failed to save custom exercise');
    }
  }
}

export async function getCustomExercises(): Promise<Exercise[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from('custom_exercises')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error retrieving custom exercises:', error);
    return [];
  }

  if (!data) return [];

  return data.map((ex: any) => ({
    id: ex.exercise_id,
    name: ex.name,
    category: ex.category,
    muscleGroup: ex.muscle_group,
  }));
}

export async function deleteCustomExercise(exerciseId: string): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error('User not authenticated');

  const supabase = createClient();
  const { error } = await supabase
    .from('custom_exercises')
    .delete()
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId);

  if (error) {
    console.error('Error deleting custom exercise:', error);
    throw new Error('Failed to delete custom exercise');
  }
}

// Exercise Functions (public exercises from database)
// Client-side only - for server-side, use exercises-server.ts
export async function getExercises(): Promise<Exercise[]> {
  try {
    // Client-side only - use browser client
    const supabase = createClient();

    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      // Check if it's a table doesn't exist error
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('Exercises table does not exist. Please run migrations 002 and 003.');
        return [];
      }
      console.error('Error retrieving exercises:', error);
      return [];
    }

    if (!data) return [];

    return data.map((ex: any) => ({
      id: ex.id,
      name: ex.name,
      category: ex.category,
      muscleGroup: ex.muscle_group,
    }));
  } catch (error: any) {
    // Handle cases where Supabase client creation fails
    if (error?.message?.includes('Missing Supabase environment variables')) {
      console.warn('Supabase not configured. Exercises will not be available.');
      return [];
    }
    console.error('Error in getExercises:', error);
    return [];
  }
}

export async function getExerciseById(id: string): Promise<Exercise | undefined> {
  try {
    // Client-side only - use browser client
    const supabase = createClient();

    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // Check if it's a table doesn't exist error
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('Exercises table does not exist. Please run migrations 002 and 003.');
        return undefined;
      }
      return undefined;
    }

    if (!data) return undefined;

    return {
      id: data.id,
      name: data.name,
      category: data.category,
      muscleGroup: data.muscle_group,
    };
  } catch (error: any) {
    // Handle cases where Supabase client creation fails
    if (error?.message?.includes('Missing Supabase environment variables')) {
      console.warn('Supabase not configured. Exercise will not be available.');
      return undefined;
    }
    console.error('Error in getExerciseById:', error);
    return undefined;
  }
}

// Data Migration Functions
export async function migrateLocalStorageData(): Promise<{ workouts: number; exercises: number }> {
  const userId = await getUserId();
  if (!userId) throw new Error('User not authenticated');

  if (typeof window === 'undefined') {
    return { workouts: 0, exercises: 0 };
  }

  const PROFILES_KEY = 'fitlog-profiles';
  const CURRENT_PROFILE_KEY = 'fitlog-current-profile';
  const STORAGE_KEY_PREFIX = 'fitlog-workouts-';
  const CUSTOM_EXERCISES_KEY_PREFIX = 'fitlog-custom-exercises-';

  let migratedWorkouts = 0;
  let migratedExercises = 0;

  try {
    // Get current profile ID from localStorage
    const currentProfileId = localStorage.getItem(CURRENT_PROFILE_KEY);
    if (!currentProfileId) {
      return { workouts: 0, exercises: 0 };
    }

    // Migrate workouts
    const workoutsKey = `${STORAGE_KEY_PREFIX}${currentProfileId}`;
    const workoutsData = localStorage.getItem(workoutsKey);
    if (workoutsData) {
      const workouts: WorkoutLog[] = JSON.parse(workoutsData);
      const supabase = createClient();

      for (const workout of workouts) {
        // Check if workout already exists
        const { data: existing } = await supabase
          .from('workouts')
          .select('id')
          .eq('id', workout.id)
          .eq('user_id', userId)
          .single();

        if (!existing) {
          await supabase
            .from('workouts')
            .insert({
              id: workout.id,
              user_id: userId,
              date: workout.date,
              exercise_id: workout.exerciseId,
              sets: workout.sets,
            });
          migratedWorkouts++;
        }
      }
    }

    // Migrate custom exercises
    const exercisesKey = `${CUSTOM_EXERCISES_KEY_PREFIX}${currentProfileId}`;
    const exercisesData = localStorage.getItem(exercisesKey);
    if (exercisesData) {
      const exercises: Exercise[] = JSON.parse(exercisesData);
      const supabase = createClient();

      for (const exercise of exercises) {
        // Check if exercise already exists
        const { data: existing } = await supabase
          .from('custom_exercises')
          .select('exercise_id')
          .eq('user_id', userId)
          .eq('exercise_id', exercise.id)
          .single();

        if (!existing) {
          await supabase
            .from('custom_exercises')
            .insert({
              user_id: userId,
              exercise_id: exercise.id,
              name: exercise.name,
              category: exercise.category,
              muscle_group: exercise.muscleGroup,
            });
          migratedExercises++;
        }
      }
    }
  } catch (error) {
    console.error('Error migrating localStorage data:', error);
    throw error;
  }

  return { workouts: migratedWorkouts, exercises: migratedExercises };
}


