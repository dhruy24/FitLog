'use client';

import { Exercise } from '@/types';
import Link from 'next/link';

interface ExerciseCardProps {
  exercise: Exercise;
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <Link
      href={`/exercises/${exercise.id}`}
      className="block p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
    >
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {exercise.name}
      </h3>
      <div className="flex gap-2">
        <span className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded">
          {exercise.category}
        </span>
        <span className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded">
          {exercise.muscleGroup}
        </span>
      </div>
    </Link>
  );
}


