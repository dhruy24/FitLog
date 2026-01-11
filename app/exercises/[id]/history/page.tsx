import { getExerciseById } from '@/lib/exercises-server';
import { notFound } from 'next/navigation';
import ExerciseHistory from '@/components/ExerciseHistory';

interface ExerciseHistoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExerciseHistoryPage({ params }: ExerciseHistoryPageProps) {
  const { id } = await params;
  const exercise = await getExerciseById(id);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <ExerciseHistory exerciseId={exercise.id} exerciseName={exercise.name} />
      </div>
    </div>
  );
}


