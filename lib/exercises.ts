import { Exercise } from '@/types';
import { getCustomExercises } from './storage/index';

// Legacy export for backward compatibility (deprecated - use getExerciseList instead)
export const predefinedExercises: Exercise[] = [];

// Helper to get exercises from database (handles server/client split)
async function getExercisesFromDB(): Promise<Exercise[]> {
  try {
    if (typeof window === 'undefined') {
      // Server-side: This should not be called from client components
      // Server components should import directly from exercises-server.ts
      throw new Error('getExercisesFromDB should not be called on server. Use exercises-server.ts directly.');
    } else {
      // Client-side: use client functions
      const storageSupabase = await import('./storage-supabase');
      return await storageSupabase.getExercises();
    }
  } catch (error) {
    console.error('Error fetching exercises from database:', error);
    return [];
  }
}

// Helper to get exercise by ID from database (handles server/client split)
async function getExerciseByIdFromDB(id: string): Promise<Exercise | undefined> {
  try {
    if (typeof window === 'undefined') {
      // Server-side: This should not be called from client components
      // Server components should import directly from exercises-server.ts
      throw new Error('getExerciseByIdFromDB should not be called on server. Use exercises-server.ts directly.');
    } else {
      // Client-side: use client functions
      const storageSupabase = await import('./storage-supabase');
      return await storageSupabase.getExerciseById(id);
    }
  } catch (error) {
    console.error('Error fetching exercise from database:', error);
    return undefined;
  }
}

export async function getExerciseList(): Promise<Exercise[]> {
  // Get exercises from database and merge with custom exercises
  const exercises = await getExercisesFromDB();
  const customExercises = typeof window !== 'undefined' ? await getCustomExercises() : [];
  return [...exercises, ...customExercises];
}

export async function getExerciseById(id: string): Promise<Exercise | undefined> {
  // First check database exercises
  const exercise = await getExerciseByIdFromDB(id);
  if (exercise) return exercise;
  
  // Then check custom exercises (only on client)
  if (typeof window !== 'undefined') {
    const customExercises = await getCustomExercises();
    return customExercises.find(ex => ex.id === id);
  }
  
  return undefined;
}

export async function getCategories(): Promise<string[]> {
  const allExercises = await getExerciseList();
  return Array.from(new Set(allExercises.map(ex => ex.category)));
}

export async function getMuscleGroups(): Promise<string[]> {
  const allExercises = await getExerciseList();
  return Array.from(new Set(allExercises.map(ex => ex.muscleGroup)));
}

// Helper function to generate a unique ID from exercise name
export function generateExerciseId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

