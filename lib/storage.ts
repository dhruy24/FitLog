import { WorkoutLog, MaxStats, Exercise, Profile, WorkoutMetrics, BestWorkoutMetric, BestWorkoutResult } from '@/types';

const PROFILES_KEY = 'fitlog-profiles';
const CURRENT_PROFILE_KEY = 'fitlog-current-profile';
const STORAGE_KEY_PREFIX = 'fitlog-workouts-';
const CUSTOM_EXERCISES_KEY_PREFIX = 'fitlog-custom-exercises-';

// Check if we're in the browser environment
function isClient(): boolean {
  return typeof window !== 'undefined';
}

// Profile Management Functions
export function getCurrentProfileId(): string | null {
  if (!isClient()) return null;
  return localStorage.getItem(CURRENT_PROFILE_KEY);
}

export function setCurrentProfile(profileId: string): void {
  if (!isClient()) return;
  localStorage.setItem(CURRENT_PROFILE_KEY, profileId);
}

export function getProfiles(): Profile[] {
  if (!isClient()) return [];
  
  try {
    const stored = localStorage.getItem(PROFILES_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error retrieving profiles:', error);
    return [];
  }
}

export function createProfile(name: string): Profile {
  if (!isClient()) {
    throw new Error('Cannot create profile on server');
  }
  
  const profiles = getProfiles();
  const newProfile: Profile = {
    id: `profile-${Date.now()}`,
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
  
  // Check if name already exists
  if (profiles.some(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
    throw new Error('Profile with this name already exists');
  }
  
  profiles.push(newProfile);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  
  // Set as current profile if it's the first one
  if (profiles.length === 1) {
    setCurrentProfile(newProfile.id);
  }
  
  return newProfile;
}

export function deleteProfile(profileId: string): void {
  if (!isClient()) return;
  
  const profiles = getProfiles();
  const filtered = profiles.filter(p => p.id !== profileId);
  
  if (filtered.length === 0) {
    throw new Error('Cannot delete the last profile');
  }
  
  // Delete profile data
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${profileId}`);
  localStorage.removeItem(`${CUSTOM_EXERCISES_KEY_PREFIX}${profileId}`);
  
  // Update profiles list
  localStorage.setItem(PROFILES_KEY, JSON.stringify(filtered));
  
  // If deleted profile was current, switch to first available
  const currentId = getCurrentProfileId();
  if (currentId === profileId) {
    setCurrentProfile(filtered[0].id);
  }
}

export function updateProfile(profileId: string, name: string): void {
  if (!isClient()) return;
  
  const profiles = getProfiles();
  const index = profiles.findIndex(p => p.id === profileId);
  
  if (index === -1) {
    throw new Error('Profile not found');
  }
  
  // Check if name already exists (excluding current profile)
  if (profiles.some(p => p.id !== profileId && p.name.toLowerCase() === name.trim().toLowerCase())) {
    throw new Error('Profile with this name already exists');
  }
  
  profiles[index].name = name.trim();
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

// Helper function to get storage keys for current profile
function getStorageKey(): string {
  const profileId = getCurrentProfileId();
  return profileId ? `${STORAGE_KEY_PREFIX}${profileId}` : STORAGE_KEY_PREFIX + 'default';
}

function getCustomExercisesKey(): string {
  const profileId = getCurrentProfileId();
  return profileId ? `${CUSTOM_EXERCISES_KEY_PREFIX}${profileId}` : CUSTOM_EXERCISES_KEY_PREFIX + 'default';
}

export function saveWorkout(workoutData: WorkoutLog): void {
  if (!isClient()) return;
  
  try {
    const existingWorkouts = getWorkouts();
    const updatedWorkouts = [...existingWorkouts, workoutData];
    localStorage.setItem(getStorageKey(), JSON.stringify(updatedWorkouts));
  } catch (error) {
    console.error('Error saving workout:', error);
    throw new Error('Failed to save workout');
  }
}

export function getWorkouts(exerciseId?: string, date?: string): WorkoutLog[] {
  if (!isClient()) return [];
  
  try {
    const stored = localStorage.getItem(getStorageKey());
    if (!stored) return [];
    
    let workouts: WorkoutLog[] = JSON.parse(stored);
    
    if (exerciseId) {
      workouts = workouts.filter(w => w.exerciseId === exerciseId);
    }
    
    if (date) {
      workouts = workouts.filter(w => w.date === date);
    }
    
    return workouts;
  } catch (error) {
    console.error('Error retrieving workouts:', error);
    return [];
  }
}

export function getMaxStats(exerciseId: string): MaxStats {
  if (!isClient()) {
    return { maxReps: 0, maxWeight: 0 };
  }
  
  const workouts = getWorkouts(exerciseId);
  
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

export function getLastWorkout(exerciseId: string, excludeWorkoutId?: string): WorkoutLog | null {
  if (!isClient()) return null;
  
  const workouts = getWorkouts(exerciseId);
  
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

export function getBestWorkout(
  exerciseId: string,
  metric: BestWorkoutMetric = 'volume',
  excludeWorkoutId?: string
): BestWorkoutResult | null {
  if (!isClient()) return null;
  
  const workouts = getWorkouts(exerciseId);
  
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
export function getMaxWorkout(exerciseId: string, excludeWorkoutId?: string): { workout: WorkoutLog; type: 'reps' | 'weight' } | null {
  const bestByWeight = getBestWorkout(exerciseId, 'weight', excludeWorkoutId);
  const bestByReps = getBestWorkout(exerciseId, 'reps', excludeWorkoutId);
  
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

export function getWorkoutById(workoutId: string): WorkoutLog | undefined {
  if (!isClient()) return undefined;
  
  try {
    const workouts = getWorkouts();
    return workouts.find(w => w.id === workoutId);
  } catch (error) {
    console.error('Error retrieving workout:', error);
    return undefined;
  }
}

export function updateWorkout(workoutId: string, workoutData: WorkoutLog): void {
  if (!isClient()) return;
  
  try {
    const workouts = getWorkouts();
    const index = workouts.findIndex(w => w.id === workoutId);
    
    if (index === -1) {
      throw new Error('Workout not found');
    }
    
    workouts[index] = { ...workoutData, id: workoutId };
    localStorage.setItem(getStorageKey(), JSON.stringify(workouts));
  } catch (error) {
    console.error('Error updating workout:', error);
    throw new Error('Failed to update workout');
  }
}

export function deleteWorkout(workoutId: string): void {
  if (!isClient()) return;
  
  try {
    const workouts = getWorkouts();
    const filtered = workouts.filter(w => w.id !== workoutId);
    localStorage.setItem(getStorageKey(), JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw new Error('Failed to delete workout');
  }
}

export function saveCustomExercise(exercise: Exercise): void {
  if (!isClient()) return;
  
  try {
    const existingExercises = getCustomExercises();
    // Check if exercise with same id already exists
    const exists = existingExercises.some(ex => ex.id === exercise.id);
    if (exists) {
      throw new Error('Exercise with this ID already exists');
    }
    const updatedExercises = [...existingExercises, exercise];
    localStorage.setItem(getCustomExercisesKey(), JSON.stringify(updatedExercises));
  } catch (error) {
    console.error('Error saving custom exercise:', error);
    throw error;
  }
}

export function getCustomExercises(): Exercise[] {
  if (!isClient()) return [];
  
  try {
    const stored = localStorage.getItem(getCustomExercisesKey());
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error retrieving custom exercises:', error);
    return [];
  }
}

export function deleteCustomExercise(exerciseId: string): void {
  if (!isClient()) return;
  
  try {
    const exercises = getCustomExercises();
    const filtered = exercises.filter(ex => ex.id !== exerciseId);
    localStorage.setItem(getCustomExercisesKey(), JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting custom exercise:', error);
    throw new Error('Failed to delete custom exercise');
  }
}

