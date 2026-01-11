import { generateExerciseId } from '@/lib/exercises';

describe('generateExerciseId', () => {
  it('should convert exercise name to lowercase kebab-case', () => {
    expect(generateExerciseId('Bench Press')).toBe('bench-press');
    expect(generateExerciseId('Incline Bench Press')).toBe('incline-bench-press');
  });

  it('should handle special characters', () => {
    expect(generateExerciseId('Cable Crossover (High)')).toBe('cable-crossover-high');
    expect(generateExerciseId('T-Bar Row')).toBe('t-bar-row');
    expect(generateExerciseId('Push-ups')).toBe('push-ups');
  });

  it('should handle multiple spaces', () => {
    expect(generateExerciseId('Leg   Press')).toBe('leg-press');
    expect(generateExerciseId('  Squat  ')).toBe('squat');
  });

  it('should handle numbers', () => {
    expect(generateExerciseId('Exercise 1')).toBe('exercise-1');
    expect(generateExerciseId('3x10 Reps')).toBe('3x10-reps');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(generateExerciseId('  Exercise  ')).toBe('exercise');
    expect(generateExerciseId('---Test---')).toBe('test');
  });

  it('should handle empty string', () => {
    expect(generateExerciseId('')).toBe('');
  });

  it('should handle single word', () => {
    expect(generateExerciseId('Squat')).toBe('squat');
    expect(generateExerciseId('DEADLIFT')).toBe('deadlift');
  });

  it('should handle special characters and punctuation', () => {
    expect(generateExerciseId('Exercise (Variation)')).toBe('exercise-variation');
    expect(generateExerciseId('Exercise: Main')).toBe('exercise-main');
    expect(generateExerciseId('Exercise, Comma')).toBe('exercise-comma');
  });
});
