import 'server-only';

import { Exercise } from '@/types';
import { createClient } from '@/lib/supabase/server';

// Server-only functions for fetching exercises
// These should only be used in Server Components, Server Actions, or Route Handlers

export async function getExercises(): Promise<Exercise[]> {
  try {
    const supabase = await createClient();

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
    const supabase = await createClient();

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
