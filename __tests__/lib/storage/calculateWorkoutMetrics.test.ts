import { calculateWorkoutMetrics } from '@/lib/storage-supabase';
import { WorkoutLog } from '@/types';

describe('calculateWorkoutMetrics', () => {
  it('should calculate metrics for empty sets', () => {
    const workout: WorkoutLog = {
      id: '1',
      date: '2024-01-01',
      exerciseId: 'bench-press',
      sets: [],
    };

    const metrics = calculateWorkoutMetrics(workout);

    expect(metrics).toEqual({
      totalVolume: 0,
      maxWeight: 0,
      maxReps: 0,
      estimated1RM: 0,
      averageWeight: 0,
      bestSetVolume: 0,
      totalReps: 0,
    });
  });

  it('should calculate metrics for single set', () => {
    const workout: WorkoutLog = {
      id: '1',
      date: '2024-01-01',
      exerciseId: 'bench-press',
      sets: [{ reps: 10, weight: 100 }],
    };

    const metrics = calculateWorkoutMetrics(workout);

    expect(metrics.totalVolume).toBe(1000); // 10 * 100
    expect(metrics.maxWeight).toBe(100);
    expect(metrics.maxReps).toBe(10);
    expect(metrics.bestSetVolume).toBe(1000);
    expect(metrics.totalReps).toBe(10);
    expect(metrics.averageWeight).toBe(100);
    // 1RM = 100 * (1 + 10/30) = 100 * 1.333 = 133.33
    expect(metrics.estimated1RM).toBeCloseTo(133.33, 2);
  });

  it('should calculate metrics for multiple sets', () => {
    const workout: WorkoutLog = {
      id: '1',
      date: '2024-01-01',
      exerciseId: 'bench-press',
      sets: [
        { reps: 10, weight: 100 },
        { reps: 8, weight: 110 },
        { reps: 6, weight: 120 },
      ],
    };

    const metrics = calculateWorkoutMetrics(workout);

    expect(metrics.totalVolume).toBe(2600); // (10*100) + (8*110) + (6*120)
    expect(metrics.maxWeight).toBe(120);
    expect(metrics.maxReps).toBe(10);
    expect(metrics.bestSetVolume).toBe(1000); // 10 * 100 (max volume: first set)
    expect(metrics.totalReps).toBe(24);
    expect(metrics.averageWeight).toBeCloseTo(110, 2); // (100 + 110 + 120) / 3
    // 1RM should be max of all set 1RMs
    // Set 1: 100 * (1 + 10/30) = 133.33
    // Set 2: 110 * (1 + 8/30) = 139.33
    // Set 3: 120 * (1 + 6/30) = 144
    expect(metrics.estimated1RM).toBeCloseTo(144, 2);
  });

  it('should handle zero reps', () => {
    const workout: WorkoutLog = {
      id: '1',
      date: '2024-01-01',
      exerciseId: 'bench-press',
      sets: [{ reps: 0, weight: 100 }],
    };

    const metrics = calculateWorkoutMetrics(workout);

    expect(metrics.totalVolume).toBe(0);
    expect(metrics.maxWeight).toBe(100);
    expect(metrics.maxReps).toBe(0);
    expect(metrics.totalReps).toBe(0);
    expect(metrics.averageWeight).toBe(100);
    // 1RM = 100 * (1 + 0/30) = 100
    expect(metrics.estimated1RM).toBe(100);
  });

  it('should handle zero weight', () => {
    const workout: WorkoutLog = {
      id: '1',
      date: '2024-01-01',
      exerciseId: 'bench-press',
      sets: [{ reps: 10, weight: 0 }],
    };

    const metrics = calculateWorkoutMetrics(workout);

    expect(metrics.totalVolume).toBe(0);
    expect(metrics.maxWeight).toBe(0);
    expect(metrics.maxReps).toBe(10);
    expect(metrics.totalReps).toBe(10);
    expect(metrics.averageWeight).toBe(0);
    expect(metrics.estimated1RM).toBe(0);
  });

  it('should correctly calculate 1RM using Epley formula', () => {
    const workout: WorkoutLog = {
      id: '1',
      date: '2024-01-01',
      exerciseId: 'bench-press',
      sets: [
        { reps: 1, weight: 200 }, // 1RM = 200 * (1 + 1/30) = 206.67
        { reps: 5, weight: 180 }, // 1RM = 180 * (1 + 5/30) = 210
        { reps: 10, weight: 150 }, // 1RM = 150 * (1 + 10/30) = 200
      ],
    };

    const metrics = calculateWorkoutMetrics(workout);

    // Should use the maximum 1RM estimate
    expect(metrics.estimated1RM).toBeCloseTo(210, 2);
  });

  it('should handle decimal weights', () => {
    const workout: WorkoutLog = {
      id: '1',
      date: '2024-01-01',
      exerciseId: 'bench-press',
      sets: [
        { reps: 10, weight: 100.5 },
        { reps: 8, weight: 110.25 },
      ],
    };

    const metrics = calculateWorkoutMetrics(workout);

    expect(metrics.totalVolume).toBeCloseTo(1887, 2); // (10*100.5) + (8*110.25)
    expect(metrics.maxWeight).toBe(110.25);
    expect(metrics.averageWeight).toBeCloseTo(105.375, 2);
  });

  it('should handle many sets', () => {
    const workout: WorkoutLog = {
      id: '1',
      date: '2024-01-01',
      exerciseId: 'bench-press',
      sets: Array.from({ length: 5 }, (_, i) => ({
        reps: 10 - i,
        weight: 100 + i * 10,
      })),
    };

    const metrics = calculateWorkoutMetrics(workout);

    expect(metrics.totalReps).toBe(40); // 10+9+8+7+6
    expect(metrics.maxWeight).toBe(140);
    expect(metrics.maxReps).toBe(10);
    expect(metrics.averageWeight).toBe(120); // (100+110+120+130+140)/5
  });
});
