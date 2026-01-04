import { Exercise } from '@/types';
import { getCustomExercises } from './storage';

export const predefinedExercises: Exercise[] = [
  // Chest
  { id: 'bench-press', name: 'Bench Press', category: 'Chest', muscleGroup: 'Upper Body' },
  { id: 'incline-bench-press', name: 'Incline Bench Press', category: 'Chest', muscleGroup: 'Upper Body' },
  { id: 'decline-bench-press', name: 'Decline Bench Press', category: 'Chest', muscleGroup: 'Upper Body' },
  { id: 'dumbbell-press', name: 'Dumbbell Press', category: 'Chest', muscleGroup: 'Upper Body' },
  { id: 'chest-fly', name: 'Chest Fly', category: 'Chest', muscleGroup: 'Upper Body' },
  { id: 'push-ups', name: 'Push-ups', category: 'Chest', muscleGroup: 'Upper Body' },
  
  // Back
  { id: 'deadlift', name: 'Deadlift', category: 'Back', muscleGroup: 'Upper Body' },
  { id: 'barbell-row', name: 'Barbell Row', category: 'Back', muscleGroup: 'Upper Body' },
  { id: 'pull-ups', name: 'Pull-ups', category: 'Back', muscleGroup: 'Upper Body' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'Back', muscleGroup: 'Upper Body' },
  { id: 't-bar-row', name: 'T-Bar Row', category: 'Back', muscleGroup: 'Upper Body' },
  { id: 'cable-row', name: 'Cable Row', category: 'Back', muscleGroup: 'Upper Body' },
  { id: 'one-arm-dumbbell-row', name: 'One-Arm Dumbbell Row', category: 'Back', muscleGroup: 'Upper Body' },
  
  // Shoulders
  { id: 'overhead-press', name: 'Overhead Press', category: 'Shoulders', muscleGroup: 'Upper Body' },
  { id: 'dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', category: 'Shoulders', muscleGroup: 'Upper Body' },
  { id: 'lateral-raise', name: 'Lateral Raise', category: 'Shoulders', muscleGroup: 'Upper Body' },
  { id: 'front-raise', name: 'Front Raise', category: 'Shoulders', muscleGroup: 'Upper Body' },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', category: 'Shoulders', muscleGroup: 'Upper Body' },
  { id: 'upright-row', name: 'Upright Row', category: 'Shoulders', muscleGroup: 'Upper Body' },
  
  // Arms
  { id: 'barbell-curl', name: 'Barbell Curl', category: 'Arms', muscleGroup: 'Upper Body' },
  { id: 'dumbbell-curl', name: 'Dumbbell Curl', category: 'Arms', muscleGroup: 'Upper Body' },
  { id: 'hammer-curl', name: 'Hammer Curl', category: 'Arms', muscleGroup: 'Upper Body' },
  { id: 'tricep-dips', name: 'Tricep Dips', category: 'Arms', muscleGroup: 'Upper Body' },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', category: 'Arms', muscleGroup: 'Upper Body' },
  { id: 'close-grip-bench-press', name: 'Close-Grip Bench Press', category: 'Arms', muscleGroup: 'Upper Body' },
  
  // Legs
  { id: 'squat', name: 'Squat', category: 'Legs', muscleGroup: 'Lower Body' },
  { id: 'leg-press', name: 'Leg Press', category: 'Legs', muscleGroup: 'Lower Body' },
  { id: 'leg-extension', name: 'Leg Extension', category: 'Legs', muscleGroup: 'Lower Body' },
  { id: 'leg-curl', name: 'Leg Curl', category: 'Legs', muscleGroup: 'Lower Body' },
  { id: 'lunges', name: 'Lunges', category: 'Legs', muscleGroup: 'Lower Body' },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'Legs', muscleGroup: 'Lower Body' },
  { id: 'calf-raise', name: 'Calf Raise', category: 'Legs', muscleGroup: 'Lower Body' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', category: 'Legs', muscleGroup: 'Lower Body' },
  
  // Core
  { id: 'plank', name: 'Plank', category: 'Core', muscleGroup: 'Core' },
  { id: 'crunches', name: 'Crunches', category: 'Core', muscleGroup: 'Core' },
  { id: 'sit-ups', name: 'Sit-ups', category: 'Core', muscleGroup: 'Core' },
  { id: 'russian-twist', name: 'Russian Twist', category: 'Core', muscleGroup: 'Core' },
  { id: 'leg-raises', name: 'Leg Raises', category: 'Core', muscleGroup: 'Core' },
  { id: 'mountain-climbers', name: 'Mountain Climbers', category: 'Core', muscleGroup: 'Core' },
];

export function getExerciseList(): Exercise[] {
  // Merge predefined exercises with custom exercises
  const customExercises = typeof window !== 'undefined' ? getCustomExercises() : [];
  return [...predefinedExercises, ...customExercises];
}

export function getExerciseById(id: string): Exercise | undefined {
  // First check predefined exercises (works on server)
  const predefined = predefinedExercises.find(ex => ex.id === id);
  if (predefined) return predefined;
  
  // Then check custom exercises (only on client)
  if (typeof window !== 'undefined') {
    const customExercises = getCustomExercises();
    return customExercises.find(ex => ex.id === id);
  }
  
  return undefined;
}

export function getCategories(): string[] {
  const allExercises = getExerciseList();
  return Array.from(new Set(allExercises.map(ex => ex.category)));
}

export function getMuscleGroups(): string[] {
  const allExercises = getExerciseList();
  return Array.from(new Set(allExercises.map(ex => ex.muscleGroup)));
}

// Helper function to generate a unique ID from exercise name
export function generateExerciseId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

