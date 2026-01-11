import { getExerciseById } from '@/lib/exercises-server';
import { notFound } from 'next/navigation';
import ExerciseEntry from '@/components/ExerciseEntry';

interface ExerciseEntryPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExerciseEntryPage({ params }: ExerciseEntryPageProps) {
  const { id } = await params;
  const exercise = await getExerciseById(id);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <ExerciseEntry exerciseId={exercise.id} exerciseName={exercise.name} />
      </div>
    </div>
  );
}


