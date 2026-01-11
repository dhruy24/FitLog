import { getExerciseById } from '@/lib/exercises-server';
import { notFound } from 'next/navigation';
import ExerciseEntry from '@/components/ExerciseEntry';

interface ExerciseEditPageProps {
  params: Promise<{ id: string; workoutId: string }>;
}

export default async function ExerciseEditPage({ params }: ExerciseEditPageProps) {
  const { id, workoutId } = await params;
  const exercise = await getExerciseById(id);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <ExerciseEntry 
          exerciseId={exercise.id} 
          exerciseName={exercise.name}
          workoutId={workoutId}
        />
      </div>
    </div>
  );
}


