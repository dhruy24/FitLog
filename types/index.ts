export interface Exercise {
  id: string;
  name: string;
  category: string; // e.g., "Chest", "Back", "Legs"
  muscleGroup: string; // e.g., "Upper Body", "Lower Body"
}

export interface WorkoutSet {
  reps: number;
  weight: number;
}

export interface WorkoutLog {
  id: string;
  date: string; // ISO date string
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface MaxStats {
  maxReps: number;
  maxWeight: number;
}

export interface Profile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string; // Optional for backward compatibility
}

export interface WorkoutMetrics {
  totalVolume: number;        // Sum of (reps × weight) for all sets
  maxWeight: number;          // Highest weight in any set
  maxReps: number;            // Highest reps in any set
  estimated1RM: number;       // Estimated one-rep max
  averageWeight: number;      // Average weight across all sets
  bestSetVolume: number;     // Highest (reps × weight) for a single set
  totalReps: number;          // Total reps across all sets
}

export type BestWorkoutMetric = 'volume' | 'weight' | 'reps' | '1rm' | 'bestSet';

export interface BestWorkoutResult {
  workout: WorkoutLog;
  metric: BestWorkoutMetric;
  metricName: string;
  value: number;
}


