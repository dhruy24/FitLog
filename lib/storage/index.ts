import { WorkoutLog, MaxStats, Exercise, Profile, WorkoutMetrics, BestWorkoutMetric, BestWorkoutResult } from '@/types';
import * as localStorageStorage from '../storage';
import * as supabaseStorage from '../storage-supabase';
import { createClient } from '@/lib/supabase/client';

// Check if user is authenticated
async function isAuthenticated(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}

// Profile Management
export async function getCurrentProfileId(): Promise<string | null> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    const profile = await supabaseStorage.getProfile();
    return profile?.id || null;
  }
  return localStorageStorage.getCurrentProfileId();
}

export async function setCurrentProfile(profileId: string): Promise<void> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    // For Supabase, profile is tied to user, so this is a no-op
    // But we can store preference in localStorage for consistency
    localStorageStorage.setCurrentProfile(profileId);
    return;
  }
  localStorageStorage.setCurrentProfile(profileId);
}

export async function getProfiles(): Promise<Profile[]> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    const profile = await supabaseStorage.getProfile();
    if (!profile) return [];
    // Convert Supabase profile to Profile type
    return [{
      id: profile.id,
      name: profile.name,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }];
  }
  return localStorageStorage.getProfiles();
}

export async function createProfile(name: string): Promise<Profile> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    // For Supabase, profile is created on signup
    // Just update the name
    await supabaseStorage.updateProfileName(name);
    const profile = await supabaseStorage.getProfile();
    if (!profile) throw new Error('Failed to create profile');
    return {
      id: profile.id,
      name: profile.name,
      createdAt: profile.createdAt,
    };
  }
  return localStorageStorage.createProfile(name);
}

export async function deleteProfile(profileId: string): Promise<void> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    throw new Error('Cannot delete profile when using Supabase. Delete your account instead.');
  }
  localStorageStorage.deleteProfile(profileId);
}

export async function updateProfile(profileId: string, name: string): Promise<void> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    await supabaseStorage.updateProfileName(name);
    return;
  }
  localStorageStorage.updateProfile(profileId, name);
}

// Workout Functions
export async function saveWorkout(workoutData: WorkoutLog): Promise<void> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    await supabaseStorage.saveWorkout(workoutData);
    return;
  }
  localStorageStorage.saveWorkout(workoutData);
}

export async function getWorkouts(exerciseId?: string, date?: string): Promise<WorkoutLog[]> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    return await supabaseStorage.getWorkouts(exerciseId, date);
  }
  return localStorageStorage.getWorkouts(exerciseId, date);
}

export async function getMaxStats(exerciseId: string): Promise<MaxStats> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    return await supabaseStorage.getMaxStats(exerciseId);
  }
  return localStorageStorage.getMaxStats(exerciseId);
}

export async function getLastWorkout(exerciseId: string, excludeWorkoutId?: string): Promise<WorkoutLog | null> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    return await supabaseStorage.getLastWorkout(exerciseId, excludeWorkoutId);
  }
  return localStorageStorage.getLastWorkout(exerciseId, excludeWorkoutId);
}

export function calculateWorkoutMetrics(workout: WorkoutLog): WorkoutMetrics {
  // This is a pure function, same for both
  return localStorageStorage.calculateWorkoutMetrics(workout);
}

export async function getBestWorkout(
  exerciseId: string,
  metric: BestWorkoutMetric = 'volume',
  excludeWorkoutId?: string
): Promise<BestWorkoutResult | null> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    return await supabaseStorage.getBestWorkout(exerciseId, metric, excludeWorkoutId);
  }
  return localStorageStorage.getBestWorkout(exerciseId, metric, excludeWorkoutId);
}

export async function getWorkoutById(workoutId: string): Promise<WorkoutLog | undefined> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    return await supabaseStorage.getWorkoutById(workoutId);
  }
  return localStorageStorage.getWorkoutById(workoutId);
}

export async function updateWorkout(workoutId: string, workoutData: WorkoutLog): Promise<void> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    await supabaseStorage.updateWorkout(workoutId, workoutData);
    return;
  }
  localStorageStorage.updateWorkout(workoutId, workoutData);
}

export async function deleteWorkout(workoutId: string): Promise<void> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    await supabaseStorage.deleteWorkout(workoutId);
    return;
  }
  localStorageStorage.deleteWorkout(workoutId);
}

// Custom Exercise Functions
export async function saveCustomExercise(exercise: Exercise): Promise<void> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    await supabaseStorage.saveCustomExercise(exercise);
    return;
  }
  localStorageStorage.saveCustomExercise(exercise);
}

export async function getCustomExercises(): Promise<Exercise[]> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    return await supabaseStorage.getCustomExercises();
  }
  return localStorageStorage.getCustomExercises();
}

export async function deleteCustomExercise(exerciseId: string): Promise<void> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    await supabaseStorage.deleteCustomExercise(exerciseId);
    return;
  }
  localStorageStorage.deleteCustomExercise(exerciseId);
}

// Migration function
export async function migrateLocalStorageData(): Promise<{ workouts: number; exercises: number }> {
  return await supabaseStorage.migrateLocalStorageData();
}
