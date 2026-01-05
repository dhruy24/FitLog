'use client';

import { useState } from 'react';
import { WorkoutSet } from '@/types';

interface SetFormProps {
  onAddSet: (set: WorkoutSet) => void;
}

export default function SetForm({ onAddSet }: SetFormProps) {
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const repsNum = parseInt(reps);
    const weightNum = parseFloat(weight);
    
    if (repsNum > 0 && weightNum >= 0) {
      onAddSet({ reps: repsNum, weight: weightNum });
      setReps('');
      setWeight('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-2">
      <input
        type="number"
        placeholder="Reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        min="1"
        required
        className="flex-1 px-3 py-3 sm:py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 min-h-[44px] text-base sm:text-sm"
      />
      <input
        type="number"
        placeholder="Weight (kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        min="0"
        step="0.5"
        required
        className="flex-1 px-3 py-3 sm:py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 min-h-[44px] text-base sm:text-sm"
      />
      <button
        type="submit"
        className="px-6 py-3 sm:py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium min-h-[44px] text-base sm:text-sm"
      >
        Add Set
      </button>
    </form>
  );
}


