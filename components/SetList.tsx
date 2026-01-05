'use client';

import { WorkoutSet } from '@/types';

interface SetListProps {
  sets: WorkoutSet[];
  onRemoveSet?: (index: number) => void;
}

export default function SetList({ sets, onRemoveSet }: SetListProps) {
  if (sets.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
        No sets added yet. Add your first set above.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden md:grid grid-cols-4 gap-4 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-medium text-sm text-zinc-700 dark:text-zinc-300">
        <div>Reps</div>
        <div>Weight (kg)</div>
        <div>Set</div>
        {onRemoveSet && <div>Action</div>}
      </div>
      {sets.map((set, index) => (
        <div
          key={index}
          className="md:grid md:grid-cols-4 md:gap-4 px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
        >
          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Set {index + 1}</span>
              {onRemoveSet && (
                <button
                  onClick={() => onRemoveSet(index)}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium min-h-[44px] px-2 py-1"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Reps</div>
                <div className="text-base font-medium text-zinc-900 dark:text-zinc-100">{set.reps}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Weight (kg)</div>
                <div className="text-base font-medium text-zinc-900 dark:text-zinc-100">{set.weight}</div>
              </div>
            </div>
          </div>
          {/* Desktop Layout */}
          <div className="hidden md:contents">
            <div className="text-zinc-900 dark:text-zinc-100">{set.reps}</div>
            <div className="text-zinc-900 dark:text-zinc-100">{set.weight}</div>
            <div className="text-zinc-900 dark:text-zinc-100">{index + 1}</div>
            {onRemoveSet && (
              <button
                onClick={() => onRemoveSet(index)}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium min-h-[44px]"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

