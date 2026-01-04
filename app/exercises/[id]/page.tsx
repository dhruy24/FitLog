import { getExerciseById } from '@/lib/exercises';
import { notFound } from 'next/navigation';
import ExerciseDashboard from '@/components/ExerciseDashboard';

interface ExerciseDashboardPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExerciseDashboardPage({ params }: ExerciseDashboardPageProps) {
  const { id } = await params;
  const exercise = getExerciseById(id);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <ExerciseDashboard exerciseId={exercise.id} exerciseName={exercise.name} />
      </div>
    </div>
  );
}

